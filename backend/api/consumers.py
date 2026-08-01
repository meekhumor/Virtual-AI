# api/consumers.py
import os
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.prebuilt import create_react_agent
from .models import Interview, Response, Question, Resume
from django.db.models import Max

logger = logging.getLogger(__name__)


@database_sync_to_async
def _get_resume_text(interview_id: str) -> str:
    """Fetch stored parsed resume text. Never re downloads the PDF."""
    try:
        interview = Interview.objects.get(id=interview_id)
        resume = Resume.objects.filter(user=interview.user).order_by('-created_at').first()
        if resume and resume.parsed_text:
            return resume.parsed_text[:3000]
    except Interview.DoesNotExist:
        pass
    return "No resume provided."


@database_sync_to_async
def _get_interview_details(interview_id: str) -> dict:
    """Return interview metadata needed by the agent."""
    try:
        interview = Interview.objects.get(id=interview_id)
        return {
            "level": interview.level,
            "mode": interview.mode,
            "title": interview.title,
        }
    except Interview.DoesNotExist:
        return {"level": "ENTRY", "mode": "PRACTICE", "title": "General Interview"}


@database_sync_to_async
def _save_turn_to_db(interview_id: str, candidate_response: str, feedback: str, next_question: str, score: int = None):
    """Save user response and AI feedback, and generate/save the next question atomically."""
    with transaction.atomic():
        interview = Interview.objects.get(id=interview_id)
        current_question = Question.objects.filter(interview=interview).order_by('-order').first()
        if not current_question:
            raise ValueError("No current question found for this interview.")
        
        Response.objects.create(
            interview=interview,
            question=current_question,
            text=candidate_response,
            ai_feedback=feedback,
            agent_metadata={"score": score} if score is not None else {},
            video_url='',
        )
        
        # Save the next question
        next_order = current_question.order + 1
        Question.objects.create(
            interview=interview,
            text=next_question,
            order=next_order
        )


@database_sync_to_async
def _has_questions(interview_id: str) -> bool:
    return Question.objects.filter(interview_id=interview_id).exists()


@database_sync_to_async
def _get_latest_question(interview_id: str) -> str:
    try:
        q = Question.objects.filter(interview_id=interview_id).order_by('-order').first()
        if q:
            return q.text
    except Exception:
        pass
    return None


@database_sync_to_async
def _save_question(interview_id: str, question_text: str):
    try:
        interview = Interview.objects.get(id=interview_id)
        max_order = Question.objects.filter(interview=interview).aggregate(Max('order'))['order__max'] or 0
        Question.objects.create(interview=interview, text=question_text, order=max_order + 1)
    except Exception as e:
        logger.exception("Failed to save question")


@database_sync_to_async
def _update_latest_response_video(interview_id: str, video_url: str):
    try:
        r = Response.objects.filter(interview_id=interview_id).order_by('-id').first()
        if r:
            r.video_url = video_url
            r.save()
            logger.info("Updated latest response with video_url: %s", video_url)
    except Exception as e:
        logger.exception("Failed to update latest response video_url")


@database_sync_to_async
def _validate_interview(interview_id: str, user) -> bool:
    if isinstance(user, AnonymousUser):
        return False
    return Interview.objects.filter(id=interview_id, user=user).exists()


@database_sync_to_async
def _get_history_summary(interview_id: str) -> list:
    responses = list(
        Response.objects
        .filter(interview_id=interview_id)
        .order_by('-id')[:5]
        .values('text', 'ai_feedback')
    )
    return [f"Candidate: {r['text']} | Feedback: {r['ai_feedback']}" for r in reversed(responses)]

@tool
async def save_interview_turn(interview_id: str, candidate_response: str, feedback: str, next_question: str, score: int = None) -> str:
    """Save the candidate's response feedback and the next interview question to the database.
    
    Args:
        interview_id: The interview ID string.
        candidate_response: The candidate's response text to the current question.
        feedback: The feedback and evaluation on the candidate's response.
        next_question: The next question to ask. MUST contain ONLY the question itself. Do NOT include any feedback, praise, conversational filler, or introductory remarks in this parameter (e.g., do NOT start with 'Great!', 'That sounds interesting!', or 'Nice job!').
        score: Optional score (0-10) for the candidate's response.
    """
    try:
        await _save_turn_to_db(interview_id, candidate_response, feedback, next_question, score)
        return "Saved feedback and next question successfully."
    except Exception as e:
        logger.exception("Failed to save turn in tool")
        return f"Error saving turn: {e}"

class InterviewConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        self.user = self.scope.get('user', AnonymousUser())
        self.messages = []  
        if not await _validate_interview(self.interview_id, self.user):
            await self.close()
            return

        await self.accept()

        details = await _get_interview_details(self.interview_id)
        self.level = details['level']
        self.mode = details['mode']
        self.resume = await _get_resume_text(self.interview_id)

        # Gemini
        self.llm_primary = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GEMINI_API_KEY'),
            temperature=0.7,
            convert_system_message_to_human=False,
        )

        # Grok (fallback)
        self.llm_fallback = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=os.getenv('GROQ_API_KEY'),
            temperature=0.7,
        )

        self.llm = self.llm_primary

        system_prompt = (
            f"You are an expert {self.level} level technical interviewer conducting a {self.mode} mode interview.\n"
            f"Candidate resume summary: {self.resume}\n\n"
            "## YOUR ROLE AND PROCESS\n"
            "For each candidate response you receive, follow this EXACT sequence:\n\n"
            "### STEP 1 — Evaluate the response\n"
            "Internally assess the response on: technical accuracy, depth, communication clarity, "
            "and relevance to the level. Assign a score 1-10 and note 1-2 specific strengths and weaknesses.\n\n"
            "### STEP 2 — Formulate the next question\n"
            "Generate ONE focused follow-up question that:\n"
            "- Builds on what the candidate just said (don't change topics abruptly)\n"
            "- Digs deeper into a weakness or probes a concept they glossed over\n"
            "- Is specific, not vague. Bad: 'Tell me more.' Good: 'You mentioned caching — how would you handle cache invalidation in a distributed system?'\n"
            "- Is appropriate for the level: ENTRY=concept understanding, INTERMEDIATE=applied problem solving, SENIOR=system design/tradeoffs\n\n"
            "### STEP 3 — Call save_interview_turn ONCE\n"
            "Use the tool with these parameters:\n"
            "- `candidate_response`: exact words the candidate said\n"
            "- `feedback`: 2-3 sentences of honest, specific feedback. In REAL mode: objective and direct. In PRACTICE mode: constructive and encouraging.\n"
            "- `next_question`: the question text ONLY — no preamble, no 'Great job!', no 'Now let's talk about...'\n"
            "- `score`: your numeric score 1-10\n\n"
            "### STEP 4 — Speak your response (35 words max)\n"
            "After calling the tool, reply to the candidate in 1-2 short sentences + the next question.\n"
            "Format: '[Optional 1 sentence of brief acknowledgement]. [Next question]'\n"
            "NEVER repeat the previous question. NEVER use filler phrases like 'That's a great answer!' more than once per conversation.\n\n"
            f"## TONE\n"
            + (
                "REAL mode: Professional, neutral, structured like a real interview panel. No excessive praise.\n"
                if self.mode == 'REAL' else
                "PRACTICE mode: Warm but honest. Acknowledge effort, but be specific about gaps so the candidate can improve.\n"
            )
        )

        self.system_prompt = system_prompt

        self.agent = create_react_agent(
            self.llm,
            [save_interview_turn],
            prompt=system_prompt,
        )

        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': 'Agent ready. Starting interview...',
        }))

        latest_question = await _get_latest_question(self.interview_id)
        if not latest_question:
            await self._generate_first_question()
        else:
            self.messages.append(AIMessage(content=latest_question))
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': latest_question,
                'is_question': True,
            }))

    async def _generate_first_question(self):
        """Use LLM directly to generate and send the opening question."""
        try:
            prompt = (
                f"You are starting a {self.level} level {self.mode} interview. "
                f"Candidate resume: {self.resume}. "
                "Generate one clear opening interview question. Return ONLY the question, nothing else."
            )
            result = await self.llm.ainvoke(prompt)
            question_text = result.content.strip().strip('"').strip("'")
            await _save_question(self.interview_id, question_text)
            self.messages.append(AIMessage(content=question_text))
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': question_text,
                'is_question': True,
            }))
        except Exception as e:
            logger.exception("Failed to generate first question")
            fallback_text = "Tell me about yourself and your background."
            self.messages.append(AIMessage(content=fallback_text))
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': fallback_text,
                'is_question': True,
            }))

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON received.',
            }))
            return

        if data.get('type') != 'user_message':
            return

        user_input = data.get('text', '').strip()
        video_url = data.get('video_url', '').strip()
        if not user_input:
            return

        history = await _get_history_summary(self.interview_id)

        agent_input = {
            "messages": self.messages + [
                HumanMessage(
                    content=(
                        f"[Interview context] Level: {self.level} | Mode: {self.mode} | "
                        f"Interview ID: {self.interview_id}\n"
                        f"Previous turns: {history}\n"
                        f"Candidate just said: {user_input}"
                    )
                )
            ]
        }

        try:
            result = await self._invoke_with_fallback(agent_input)
            # Append the new messages to persistent history
            self.messages = result.get("messages", [])

            if video_url:
                await _update_latest_response_video(self.interview_id, video_url)

            output_text = ""
            if isinstance(result.get("messages"), list) and result["messages"]:
                last_msg = result["messages"][-1]
                output_text = getattr(last_msg, "content", str(last_msg))

            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': output_text or "Let's continue. Could you elaborate on that?",
                'is_question': False,
            }))
        except Exception as e:
            logger.exception("Agent invocation failed on both Gemini and Groq")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Agent error: {str(e)}',
            }))

    async def _invoke_with_fallback(self, agent_input: dict) -> dict:
        """Try Gemini first; on any exception, rebuild agent with Groq and retry."""
        try:
            return await self.agent.ainvoke(agent_input)
        except Exception as primary_err:
            logger.warning(
                "Gemini failed for interview %s (%s) — switching to Groq fallback",
                self.interview_id, primary_err,
            )
            # Rebuild agent with Groq
            fallback_agent = create_react_agent(
                self.llm_fallback,
                [save_interview_turn],
                prompt=self.system_prompt,
            )
            result = await fallback_agent.ainvoke(agent_input)
            # Persist the fallback agent for subsequent turns this session
            self.llm = self.llm_fallback
            self.agent = fallback_agent
            logger.info("Groq fallback succeeded for interview %s", self.interview_id)
            return result

    async def disconnect(self, close_code):
        logger.info("WebSocket disconnected for interview %s (code=%s)", self.interview_id, close_code)