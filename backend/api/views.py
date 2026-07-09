import logging
import json
import re
from io import BytesIO
from mimetypes import guess_type

import pdfplumber
import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import RetrieveDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response as DRFResponse
from rest_framework.views import APIView

from .auth import SupabaseJWTAuthentication
from .models import (
    User, Resume, Interview, Question,
    Response as InterviewResponse, InterviewAnalysis,
)
from .serializers import (
    InterviewSerializer, ResponseSerializer, QuestionSerializer,
    InterviewDetailSerializer, InterviewAnalysisSerializer,
)
from .supabase_client import supabase
from google import genai
from google.genai import types
from groq import Groq

logger = logging.getLogger(__name__)

FRONTEND_URL = settings.FRONTEND_URL

_genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
_groq_client = Groq(api_key=settings.GROQ_API_KEY)

def _call_llm(prompt: str, max_output_tokens: int = 500) -> str:
    """Call gemini and fall back to groq on any error."""
    try:
        response = _genai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(max_output_tokens=max_output_tokens),
        )
        return response.text.strip()
    except Exception as gemini_err:
        logger.warning("Gemini failed in views, switching to Groq: %s", gemini_err)
        chat = _groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_output_tokens,
        )
        return chat.choices[0].message.content.strip()


def _get_resume_text(user) -> str:
    """Look up parsed text from the user's most recent resume."""
    resume = Resume.objects.filter(user=user).order_by('-created_at').first()
    if resume and resume.parsed_text:
        return resume.parsed_text[:3000]
    return ""

class ProfileView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return DRFResponse({
            "email": user.email,
            "username": user.username,
            "profile_image_url": user.profile_image_url,
        }, status=200)


class ProfileStatsView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        interviews = Interview.objects.filter(user=user)
        total_interviews = interviews.count()
        total_seconds = sum(i.duration_seconds or 0 for i in interviews)
        total_minutes = total_seconds // 60
        hours = total_minutes // 60
        minutes = total_minutes % 60

        scores = list(
            InterviewAnalysis.objects.filter(interview__user=user)
            .values_list('overall_score', flat=True)
        )
        avg_score = round(sum(s for s in scores if s is not None) / len(scores), 1) if scores else None

        recent = interviews.order_by('-created_at')[:3]
        recent_data = InterviewSerializer(recent, many=True).data

        return DRFResponse({
            "total_interviews": total_interviews,
            "total_time": f"{hours}h {minutes}m",
            "average_score": avg_score,
            "recent_interviews": recent_data,
        })

class ProfileImageUploadView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        image = request.FILES.get("image")
        if not image:
            return DRFResponse({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            file_path = f"{user.supabase_id}/{image.name}"
            mime_type, _ = guess_type(image.name)
            options = {"content-type": mime_type or "image/jpeg"}
            supabase.storage.from_("profile-images").upload(file_path, image.read(), options)
            public_url = supabase.storage.from_("profile-images").get_public_url(file_path)
            user.profile_image_url = public_url
            user.save()
            return DRFResponse({"message": "Image uploaded successfully", "url": public_url})
        except Exception as e:
            logger.exception("Profile image upload failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateProfileView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        new_username = request.data.get("username")
        if not new_username:
            return DRFResponse({"error": "Username required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return DRFResponse({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user.username = new_username
            user.save()
            return DRFResponse({"message": "Username updated successfully."})
        except Exception as e:
            logger.exception("Profile update failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SignupView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username', email)

        supabase_user = None
        try:
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "email_redirect_to": f"{settings.FRONTEND_URL}/confirmed"
                }
            })
            supabase_user = auth_response.user

            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    username=username,
                    supabase_id=supabase_user.id,
                    password=password,
                )

            return DRFResponse({
                "message": "User created. Please confirm your email.",
                "user": {"email": user.email, "username": user.username},
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            if supabase_user:
                try:
                    supabase.auth.admin.delete_user(str(supabase_user.id))
                except Exception:
                    logger.warning("Failed to clean up orphaned Supabase user %s", supabase_user.id)
            logger.exception("Signup failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            response = supabase.auth.sign_in_with_password({"email": email, "password": password})

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    username=email,
                    supabase_id=str(response.user.id),
                )

            return DRFResponse({
                "token": response.session.access_token,
                "user": {"email": user.email, "username": user.username},
            })
        except Exception as e:
            logger.exception("Login failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GuestLoginView(APIView):
    def post(self, request):
        import uuid
        from datetime import timedelta
        try:
            threshold = timezone.now() - timedelta(hours=12)
            expired_guests = User.objects.filter(email__startswith='guest_', created_at__lt=threshold)
            count, _ = expired_guests.delete()
            if count > 0:
                logger.info(f"Cleaned up {count} expired guest user(s).")

            guest_id = str(uuid.uuid4())
            guest_email = f"guest_{guest_id}@virtualai.local"
            guest_username = f"Guest_{guest_id[:4]}"
            
            user = User.objects.create_user(
                email=guest_email,
                username=guest_username,
                supabase_id=guest_id,
                password=None
            )

            guest_token = f"guest_token_{guest_id}"

            return DRFResponse({
                "token": guest_token,
                "user": {"email": user.email, "username": user.username},
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Guest login creation failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResumeUploadView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            resume = Resume.objects.filter(user=user).order_by('-created_at').first()
            if not resume:
                return DRFResponse({"has_resume": False}, status=200)

            # Extract filename from the file_url or just use the last segment.
            filename = resume.file_url.split('/')[-1]
            from urllib.parse import unquote
            filename = unquote(filename)

            return DRFResponse({
                "has_resume": True,
                "url": resume.file_url,
                "filename": filename,
                "created_at": resume.created_at
            }, status=200)
        except Exception as e:
            logger.exception("Failed to fetch resume")
            return DRFResponse({"error": str(e)}, status=500)

    def post(self, request):
        file = request.FILES.get('resume')
        user = request.user
        if not file:
            return DRFResponse({"error": "No file provided"}, status=400)

        try:
            file_bytes = file.read()
            file_path = f"resumes/{user.supabase_id}/{file.name}"
            mime_type, _ = guess_type(file.name)
            options = {"content-type": mime_type or "application/pdf"}

            supabase.storage.from_("resumes").upload(file_path, file_bytes, options)
            file_url = supabase.storage.from_("resumes").get_public_url(file_path)

            parsed_text = ""
            try:
                with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                    parsed_text = "".join(page.extract_text() or "" for page in pdf.pages)[:3000]
            except Exception as parse_err:
                logger.warning("PDF parse failed during upload: %s", parse_err)

            Resume.objects.create(user=user, file_url=file_url, parsed_text=parsed_text)

            return DRFResponse({
                "message": "Resume uploaded",
                "url": file_url,
                "filename": file.name,
            }, status=201)

        except Exception as e:
            logger.exception("Resume upload failed")
            return DRFResponse({"error": str(e)}, status=500)

class InterviewDetailView(RetrieveDestroyAPIView):
    queryset = Interview.objects.all()
    serializer_class = InterviewDetailSerializer
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return DRFResponse({"message": "Interview deleted."}, status=status.HTTP_204_NO_CONTENT)


class InterviewListView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user).order_by('-created_at')
        serializer = InterviewSerializer(interviews, many=True)
        return DRFResponse(serializer.data)


class SubmitResponseView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id, question_id):
        user = request.user
        try:
            interview = Interview.objects.get(id=interview_id, user=user)
            question = Question.objects.get(id=question_id, interview=interview)
        except Interview.DoesNotExist:
            return DRFResponse({'detail': 'Interview not found.'}, status=404)
        except Question.DoesNotExist:
            return DRFResponse({'detail': 'Question not found.'}, status=404)

        text = request.data.get('text')
        if not text:
            return DRFResponse({'detail': 'Response text is required.'}, status=400)

        resume_text = _get_resume_text(user)

        recent_responses = (
            InterviewResponse.objects
            .filter(interview=interview)
            .order_by('-id')[:3]
            .values('question__text', 'text', 'ai_feedback')
        )
        history_context = "\n".join(
            f"Q: {r['question__text']}\nA: {r['text']}\nFeedback: {r['ai_feedback']}"
            for r in reversed(list(recent_responses))
        )

        prompt = f"""You are an expert interviewer conducting a {interview.level.lower()} level {interview.mode.lower()} interview.
The candidate's resume: {resume_text or 'No resume provided.'}

Previous conversation:
{history_context or 'This is the first question.'}

The candidate was just asked: "{question.text}"
Their response: "{text}"

Provide concise feedback on this response and generate one relevant follow-up question.
Respond ONLY with valid JSON in exactly this format:
{{
    "feedback": "<your feedback here>",
    "next_question": "<your follow-up question here>",
    "score": <integer 0-10>
}}"""

        feedback = "Good response, but please elaborate further."
        next_question_text = "Can you provide more details?"
        score = None

        try:
            raw_content = _call_llm(prompt, max_output_tokens=600)
            raw_content = re.sub(r"^```(?:json)?\n?", "", raw_content)
            raw_content = re.sub(r"```$", "", raw_content).strip()
            ai_data = json.loads(raw_content)
            feedback = ai_data.get("feedback", feedback)
            next_question_text = ai_data.get("next_question", next_question_text)
            score = ai_data.get("score")
        except json.JSONDecodeError as e:
            logger.warning("LLM JSON decode error in SubmitResponseView: %s", e)
        except Exception as e:
            logger.exception("LLM call failed in SubmitResponseView: %s", e)

        try:
            response_obj = InterviewResponse.objects.create(
                interview=interview,
                question=question,
                text=text,
                ai_feedback=feedback,
                video_url=request.data.get('video_url', ''),
                agent_metadata={"score": score} if score is not None else {},
            )
            next_order = question.order + 1
            next_question = Question.objects.create(
                interview=interview,
                text=next_question_text,
                order=next_order,
            )
            return DRFResponse({
                "response": ResponseSerializer(response_obj).data,
                "next_question": QuestionSerializer(next_question).data,
            }, status=201)
        except Exception as e:
            logger.exception("Failed to save response/question")
            return DRFResponse({'detail': f'Failed to save: {str(e)}'}, status=500)


class StartInterviewView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        title = request.data.get('title')
        level = request.data.get('level')
        mode = request.data.get('mode')
        duration = request.data.get('duration_seconds')

        if not all([title, level, mode, duration]):
            return DRFResponse({'detail': 'Missing interview details.'}, status=400)

        interview = Interview.objects.create(
            user=user,
            title=title,
            level=level,
            mode=mode,
            duration_seconds=duration,
            scheduled_at=timezone.now(),
            status='IN_PROGRESS',
        )

        resume_text = _get_resume_text(user)

        prompt = f"""You are an expert interviewer conducting a {level.lower()} level {mode.lower()} interview.
The candidate's resume: {resume_text or 'No resume provided.'}
Generate one clear, specific opening interview question appropriate for this level and mode.
Return ONLY the question text, nothing else."""

        question_text = "Tell me about yourself."
        try:
            question_text = _call_llm(prompt, max_output_tokens=200)
            question_text = question_text.strip('"').strip("'").strip()
        except Exception as e:
            logger.exception("LLM failed in StartInterviewView: %s", e)

        Question.objects.create(interview=interview, text=question_text, order=1)

        scheme = "wss" if (request.is_secure() or request.headers.get('x-forwarded-proto') == 'https' or 'onrender.com' in request.get_host()) else "ws"
        ws_url = f"{scheme}://{request.get_host()}/ws/interview/{interview.id}/"

        serializer = InterviewSerializer(interview)
        return DRFResponse({**serializer.data, 'ws_url': ws_url}, status=201)


class InterviewStatusUpdateView(APIView):
    """PATCH /api/interviews/<id>/status/ — update interview status."""
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'detail': 'Interview not found.'}, status=404)

        new_status = request.data.get('status')
        if new_status not in ['IN_PROGRESS', 'COMPLETED', 'PENDING']:
            return DRFResponse({'detail': f'Invalid status: {new_status}'}, status=400)

        interview.status = new_status
        update_fields = ['status', 'updated_at']

        duration_seconds = request.data.get('duration_seconds')
        if duration_seconds is not None:
            interview.duration_seconds = int(duration_seconds)
            update_fields.append('duration_seconds')

        interview.save(update_fields=update_fields)
        return DRFResponse({'id': interview.id, 'status': interview.status, 'duration_seconds': interview.duration_seconds})

class InterviewAnalysisView(APIView):
    """POST /api/interviews/{id}/analyze/ — generate and cache analysis."""
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'detail': 'Interview not found.'}, status=404)

        if hasattr(interview, 'analysis') and interview.analysis:
            return DRFResponse(InterviewAnalysisSerializer(interview.analysis).data)

        responses = (
            InterviewResponse.objects
            .filter(interview=interview)
            .select_related('question')
            .order_by('question__order')
        )
        if not responses.exists():
            return DRFResponse({'detail': 'No responses found for this interview.'}, status=400)

        transcript = "\n\n".join(
            f"Q{i+1}: {r.question.text}\nA{i+1}: {r.text}"
            for i, r in enumerate(responses)
        )

        prompt = f"""You are an expert interview evaluator. Analyze the following interview transcript and return a JSON report.

Interview: {interview.level} level {interview.mode} — "{interview.title}"
Transcript:
{transcript}

Return ONLY valid JSON with exactly these fields:
{{
    "overall_score": <float 0-10>,
    "communication_score": <float 0-10>,
    "technical_score": <float 0-10>,
    "confidence_score": <float 0-10>,
    "pace_wpm": <estimated words per minute as float>,
    "filler_word_count": <integer>,
    "power_word_count": <integer>,
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
    "summary": "<2-3 sentence overall summary>"
}}"""

        try:
            raw = _call_llm(prompt, max_output_tokens=800)
            raw = re.sub(r"^```(?:json)?\n?", "", raw)
            raw = re.sub(r"```$", "", raw).strip()
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            logger.warning("LLM JSON decode error in analysis: %s", e)
            return DRFResponse({'detail': 'AI returned invalid JSON. Try again.'}, status=500)
        except Exception as e:
            logger.exception("LLM call failed in analysis")
            return DRFResponse({'detail': f'AI analysis failed: {str(e)}'}, status=500)

        analysis = InterviewAnalysis.objects.create(
            interview=interview,
            overall_score=data.get('overall_score'),
            communication_score=data.get('communication_score'),
            technical_score=data.get('technical_score'),
            confidence_score=data.get('confidence_score'),
            pace_wpm=data.get('pace_wpm'),
            filler_word_count=data.get('filler_word_count'),
            power_word_count=data.get('power_word_count'),
            strengths=data.get('strengths', []),
            improvements=data.get('improvements', []),
            summary=data.get('summary', ''),
        )
        return DRFResponse(InterviewAnalysisSerializer(analysis).data, status=201)


class InterviewAnalysisGetView(APIView):
    """GET /api/interviews/{id}/analysis/ — retrieve cached analysis."""
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
        except Interview.DoesNotExist:
            return DRFResponse({'detail': 'Interview not found.'}, status=404)
        try:
            analysis = interview.analysis
        except InterviewAnalysis.DoesNotExist:
            return DRFResponse({'detail': 'Analysis not found. POST to /analyze/ first.'}, status=404)
        return DRFResponse(InterviewAnalysisSerializer(analysis).data)


class VideoUploadView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        video_file = request.FILES.get("video")
        if not video_file:
            return DRFResponse({"error": "No video provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            import uuid
            ext = video_file.name.split('.')[-1] if '.' in video_file.name else 'webm'
            unique_filename = f"{uuid.uuid4()}.{ext}"
            file_path = f"{user.supabase_id}/{unique_filename}"
            
            try:
                supabase.storage.get_bucket("videos")
            except Exception:
                try:
                    supabase.storage.create_bucket("videos", options={"public": True})
                except Exception:
                    pass

            options = {"content-type": f"video/{ext}"}
            supabase.storage.from_("videos").upload(file_path, video_file.read(), options)
            public_url = supabase.storage.from_("videos").get_public_url(file_path)
            
            return DRFResponse({"message": "Video uploaded successfully", "url": public_url})
        except Exception as e:
            logger.exception("Video upload failed")
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContactInquiryView(APIView):
    permission_classes = []

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not name or not email or not message:
            return DRFResponse({"error": "Name, email, and message are required fields."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Contact Inquiry: From={name} <{email}>, Subject='{subject}', Msg='{message}'")
        return DRFResponse({"status": "success", "message": "Inquiry submitted successfully!"}, status=status.HTTP_200_OK)