# api/consumers.py
import os
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from .models import Interview, Response, Question, Resume
from django.db.models import Max

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pure async helpers (NOT @tool — called directly by the consumer)
# ---------------------------------------------------------------------------

@database_sync_to_async
def _get_resume_text(interview_id: str) -> str:
    """Fetch stored parsed resume text. Never re-downloads the PDF."""
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
def _save_feedback(interview_id: str, user_text: str, ai_text: str, metadata: dict):
    """Save a Q&A turn to the DB."""
    interview = Interview.objects.get(id=interview_id)
    last_question = Question.objects.filter(interview=interview).order_by('-order').first()
    if last_question:
        Response.objects.get_or_create(
            interview=interview,
            question=last_question,
            defaults={
                'text': user_text,
                'ai_feedback': ai_text,
                'agent_metadata': metadata,
                'video_url': '',
            }
        )


@database_sync_to_async
def _save_question(interview_id: str, text: str):
    """Save a new agent-generated question to the DB."""
    interview = Interview.objects.get(id=interview_id)
    last_order = interview.questions.aggregate(Max('order'))['order__max'] or 0
    Question.objects.create(interview=interview, text=text, order=last_order + 1)


@database_sync_to_async
def _has_questions(interview_id: str) -> bool:
    return Question.objects.filter(interview_id=interview_id).exists()


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


# ---------------------------------------------------------------------------
# Tools available to the LangGraph agent
# ---------------------------------------------------------------------------

@tool
async def save_turn_tool(interview_id: str, turn_type: str, text: str, user_text: str = "", metadata: dict = {}) -> str:
    """Save agent turn (feedback or question) to the database.
    
    Args:
        interview_id: The interview ID string.
        turn_type: Either 'feedback' or 'question'.
        text: The agent text to save.
        user_text: The candidate's answer (for feedback turns).
        metadata: Optional extra data such as score.
    """
    try:
        if turn_type == 'feedback':
            await _save_feedback(interview_id, user_text, text, metadata)
        elif turn_type == 'question':
            await _save_question(interview_id, text)
        return f"Saved {turn_type} successfully."
    except Exception as e:
        return f"Error saving turn: {e}"


# ---------------------------------------------------------------------------
# Interview WebSocket Consumer
# ---------------------------------------------------------------------------

class InterviewConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.interview_id = self.scope['url_route']['kwargs']['interview_id']
        self.user = self.scope.get('user', AnonymousUser())
        self.messages = []  # Persistent message history for multi-turn memory

        if not await _validate_interview(self.interview_id, self.user):
            await self.close()
            return

        await self.accept()

        # Fetch context once at connect time
        details = await _get_interview_details(self.interview_id)
        self.level = details['level']
        self.mode = details['mode']
        self.resume = await _get_resume_text(self.interview_id)

        # Build LangGraph ReAct agent with a plain system message string
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=os.getenv('GEMINI_API_KEY'),
        )

        system_prompt = (
            f"You are an expert {self.level} level {self.mode} interviewer. "
            f"Candidate resume context: {self.resume}. "
            "Conduct the interview professionally: ask focused questions, "
            "give constructive feedback, and adapt based on the candidate's answers. "
            "Use the save_turn_tool to persist each feedback and question to the database."
        )

        self.agent = create_react_agent(
            self.llm,
            [save_turn_tool],
            state_modifier=system_prompt,
        )

        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': 'Agent ready. Starting interview...',
        }))

        if not await _has_questions(self.interview_id):
            await self._generate_first_question()

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
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': question_text,
                'is_question': True,
            }))
        except Exception as e:
            logger.exception("Failed to generate first question")
            await self.send(text_data=json.dumps({
                'type': 'agent_response',
                'text': "Tell me about yourself and your background.",
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
        if not user_input:
            return

        history = await _get_history_summary(self.interview_id)

        # Build agent input matching the keys the agent understands
        agent_input = {
            "messages": self.messages + [
                {
                    "role": "user",
                    "content": (
                        f"[Interview context] Level: {self.level} | Mode: {self.mode} | "
                        f"Interview ID: {self.interview_id}\n"
                        f"Previous turns: {history}\n"
                        f"Candidate just said: {user_input}"
                    ),
                }
            ]
        }

        try:
            result = await self.agent.ainvoke(agent_input)
            # Append the new messages to persistent history
            self.messages = result.get("messages", [])

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
            logger.exception("Agent invocation failed")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Agent error: {str(e)}',
            }))

    async def disconnect(self, close_code):
        logger.info("WebSocket disconnected for interview %s (code=%s)", self.interview_id, close_code)