from rest_framework.views import APIView
from rest_framework.response import Response as DRFResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from mimetypes import guess_type
from django.utils import timezone
import requests
import pdfplumber
from io import BytesIO
from django.conf import settings
from .models import User, Resume, Interview, Question, Response as InterviewResponse  # Use alias for model
from .serializers import InterviewSerializer, ResponseSerializer, QuestionSerializer, InterviewDetailSerializer
from .supabase_client import supabase
from .auth import SupabaseJWTAuthentication
from time import sleep
import json
import re
from rest_framework.generics import RetrieveAPIView

class ProfileView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return DRFResponse({
            "email": user.email,
            "username": user.username,
            "profile_image_url": user.profile_image_url
        }, status=200)
    
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

            # Upload to Supabase bucket
            response = supabase.storage.from_("profile-images").upload(
                file_path, image.read(), options
            )

            if hasattr(response, 'error') and response.error:
                return DRFResponse(
                    {"error": str(response.error)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Get public URL
            public_url = supabase.storage.from_("profile-images").get_public_url(file_path)

            # Save public image URL to user model
            user.profile_image_url = public_url
            user.save()

            return DRFResponse({
                "message": "Image uploaded successfully",
                "url": public_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdateProfileView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        new_username = request.data.get("username")

        if not new_username:
            return DRFResponse({"error": "Username required."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Add validation for username (e.g., uniqueness, format)
        if User.objects.filter(username=new_username).exclude(id=user.id).exists():
            return DRFResponse({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user.username = new_username
            user.save()
            return DRFResponse({"message": "Username updated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return DRFResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class SignupView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        username = request.data.get('username', email)

        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "email_redirect_to": "http://localhost:5173/confirmed"
                }
            })

            user = User.objects.create_user(
                email=email,
                username=username,
                supabase_id=response.user.id,
                password=password
            )

            return DRFResponse({
                "message": "User created. Please confirm your email.",
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return DRFResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            user = User.objects.get(email=email)

            return DRFResponse({
                "token": response.session.access_token,
                "user": {
                    "email": user.email,
                    "username": user.username
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return DRFResponse({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ResumeUploadView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('resume')
        user = request.user

        if not file:
            return DRFResponse({"error": "No file provided"}, status=400)

        try:
            file_path = f"resumes/{user.supabase_id}/{file.name}"
            mime_type, _ = guess_type(file.name)
            options = {"content-type": mime_type or "application/pdf"}

            response = supabase.storage.from_("resumes").upload(file_path, file.read(), options)

            if hasattr(response, 'error') and response.error:
                return DRFResponse({"error": str(response.error)}, status=500)

            file_url = supabase.storage.from_("resumes").get_public_url(file_path)
            Resume.objects.create(user=user, email=user.email, file_url=file_url)

            return DRFResponse({
                "message": "Resume uploaded",
                "url": file_url,
                "filename": file.name
            }, status=201)

        except Exception as e:
            return DRFResponse({"error": str(e)}, status=500)

class InterviewCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        interview = Interview.objects.create(
            user=user,
            title=data.get('title', 'General Interview'),
            scheduled_at=data.get('scheduled_at', timezone.now()),
            level=data.get('level'),
            mode=data.get('mode'),
            duration_seconds=data.get('duration_seconds', 600)
        )

        sample_questions = [
            "Tell me about yourself.",
            "What are your strengths and weaknesses?",
            "Why do you want to work here?"
        ]

        for i, q in enumerate(sample_questions, start=1):
            Question.objects.create(interview=interview, text=q, order=i)

        serializer = InterviewSerializer(interview)
        return DRFResponse(serializer.data, status=201)

class InterviewDetailView(RetrieveAPIView):
    queryset = Interview.objects.all()
    serializer_class = InterviewDetailSerializer
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow access to interviews created by the logged-in user
        return Interview.objects.filter(user=self.request.user)
    
    def delete(self, request, pk):
        try:
            interview = Interview.objects.get(pk=pk, user=request.user)
            interview.delete()
            return DRFResponse({"message": "Interview deleted."}, status=204)
        except Interview.DoesNotExist:
            return DRFResponse({"error": "Interview not found."}, status=404)

class InterviewListView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user)
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

        # Fetch resume dynamically
        resume_text = ""
        resume_filename = request.data.get('resumeFileName')
        try:
            if resume_filename:
                resume_url = supabase.storage.from_("resumes").get_public_url(f"resumes/{user.supabase_id}/{resume_filename}")
                resume_response = requests.get(resume_url)
                if resume_response.status_code == 200:
                    with pdfplumber.open(BytesIO(resume_response.content)) as pdf:
                        resume_text = "".join(page.extract_text() or "" for page in pdf.pages)[:3000]
                else:
                    print(f"Failed to fetch resume {resume_filename}: {resume_response.status_code}")
            else:
                resume = Resume.objects.filter(user=user).order_by('-created_at').first()
                if resume:
                    resume_response = requests.get(resume.file_url)
                    if resume_response.status_code == 200:
                        with pdfplumber.open(BytesIO(resume_response.content)) as pdf:
                            resume_text = "".join(page.extract_text() or "" for page in pdf.pages)[:3000]
                    else:
                        print(f"Failed to fetch resume: {resume_response.status_code}")
                else:
                    print("No resume found for user")
        except Exception as e:
            print(f"Error fetching resume: {e}")

        # Generate AI feedback and next question
        prompt = f"""
You are an expert interviewer conducting a {interview.level.lower()} level {interview.mode.lower()} interview.
The user's resume contains: {resume_text or 'No resume provided.'}
The user was asked: "{question.text}"
Their response was: "{text}"
Provide concise feedback on the response and generate one relevant follow-up question.
Format the output as JSON:
{{
    "feedback": "<feedback>",
    "next_question": "<question>"
}}
"""

        feedback = "Good response, but please elaborate further."
        next_question_text = "Can you provide more details?"

        try:
            for attempt in range(3):
                response = requests.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "mistral-large-latest",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 200
                    }
                )
                if response.status_code == 429:
                    print(f"Rate limit hit, retrying in {2 ** attempt}s")
                    sleep(2 ** attempt)
                    continue
                response.raise_for_status()

                raw_content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "{}").strip()
                print("Raw Mistral response:", raw_content)

                # Strip code block formatting
                if raw_content.startswith("```"):
                    raw_content = re.sub(r"^```(?:json)?\n?", "", raw_content)
                    raw_content = re.sub(r"```$", "", raw_content)

                try:
                    ai_data = json.loads(raw_content)
                    feedback = ai_data.get("feedback", feedback)
                    next_question_text = ai_data.get("next_question", next_question_text)
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
                break
            else:
                print("Max retries reached for Mistral API")
        except requests.exceptions.RequestException as e:
            print(f"Mistral API request error: {str(e)}")

        # Save response and generate next question
        try:
            response_obj = Response.objects.create(
                interview=interview,
                question=question,
                text=text,
                ai_feedback=feedback,
                video_url=request.data.get('video_url', '')
            )
            next_order = question.order + 1
            next_question = Question.objects.create(
                interview=interview,
                text=next_question_text,
                order=next_order
            )
            serializer = ResponseSerializer(response_obj)
            return DRFResponse({
                "response": serializer.data,
                "next_question": QuestionSerializer(next_question).data
            }, status=201)
        except Exception as e:
            return DRFResponse({'detail': f'Failed to save response or question: {str(e)}'}, status=500)

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
            scheduled_at=timezone.now()
        )

        # Fetch resume dynamically
        resume_text = ""
        resume_filename = request.data.get('resumeFileName')
        try:
            if resume_filename:
                resume_url = supabase.storage.from_("resumes").get_public_url(
                    f"resumes/{user.supabase_id}/{resume_filename}"
                )
                resume_response = requests.get(resume_url)
                if resume_response.status_code == 200:
                    with pdfplumber.open(BytesIO(resume_response.content)) as pdf:
                        resume_text = "".join(page.extract_text() or "" for page in pdf.pages)[:3000]
                else:
                    print(f"Failed to fetch resume {resume_filename}: {resume_response.status_code}")
            else:
                resume = Resume.objects.filter(user=user).order_by('-created_at').first()
                if resume:
                    resume_response = requests.get(resume.file_url)
                    if resume_response.status_code == 200:
                        with pdfplumber.open(BytesIO(resume_response.content)) as pdf:
                            resume_text = "".join(page.extract_text() or "" for page in pdf.pages)[:3000]
                    else:
                        print(f"Failed to fetch resume: {resume_response.status_code}")
                else:
                    print("No resume found for user")
        except Exception as e:
            print(f"Error fetching resume: {e}")

        # Generate question using Mistral API
        prompt = f"""
You are an expert interviewer conducting a {level.lower()} level {mode.lower()} interview.
The user's resume contains: {resume_text or 'No resume provided.'}
Generate one relevant interview question based on the resume and the interview level/mode.
Ensure the question is clear, concise, and appropriate for the context.
"""

        try:
            for attempt in range(3):
                response = requests.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "mistral-large-latest",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 150
                    }
                )
                if response.status_code == 429:
                    print(f"Rate limit hit, retrying in {2 ** attempt}s")
                    sleep(2 ** attempt)
                    continue
                response.raise_for_status()

                # Extract raw content
                raw_content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "Tell me about yourself.").strip()

                # Clean up markdown and extract quoted question or fallback
                match = re.search(r'["“](.+?)["”]', raw_content, re.DOTALL)
                question_text = match.group(1).strip() if match else raw_content.replace("**Question:**", "").strip()
                break
            else:
                raise Exception("Max retries reached for Mistral API")
        except requests.exceptions.HTTPError as e:
            print(f"Mistral API HTTP error: {e.response.status_code} - {e.response.text}")
            question_text = "Tell me about yourself."
        except requests.exceptions.RequestException as e:
            print(f"Mistral API request error: {str(e)}")
            question_text = "Tell me about yourself."

        # Save the first question
        Question.objects.create(interview=interview, text=question_text, order=1)
        serializer = InterviewSerializer(interview)
        return DRFResponse(serializer.data, status=201)