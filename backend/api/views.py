from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Resume, Interview, Question, Response as UserResponse
from .serializers import InterviewSerializer, QuestionSerializer
from .supabase_client import supabase
from rest_framework.permissions import IsAuthenticated
from .auth import SupabaseJWTAuthentication
from mimetypes import guess_type
from datetime import datetime, timezone
import jwt
from rest_framework.response import Response as DRFResponse


class StartInterviewView(APIView):
    def post(self, request):
        # Step 1: Decode token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)

        token = auth_header.split(' ')[1]
        try:
            decoded = jwt.decode(token, options={"verify_signature": False})
            supabase_id = decoded.get('sub')
            user = User.objects.get(supabase_id=supabase_id)
        except Exception as e:
            return Response({'detail': f'Invalid token: {str(e)}'}, status=401)

        # Step 2: Get input data
        title = request.data.get('title')
        level = request.data.get('level')
        mode = request.data.get('mode')
        duration = request.data.get('duration_seconds')

        if not all([title, level, mode, duration]):
            return Response({'detail': 'Missing interview details.'}, status=400)

        # Step 3: Create Interview
        interview = Interview.objects.create(
            user=user,
            title=title,
            level=level,
            mode=mode,
            duration_seconds=duration,
            scheduled_at=datetime.now()
        )

        # Step 4: Simulate LLM-based questions
        dummy_questions = [
            "What is React and how does it differ from other frameworks?",
            "Can you explain how the virtual DOM works in React?",
            "What are props and state in React? How do they differ?"
        ]

        for i, q in enumerate(dummy_questions, start=1):
            Question.objects.create(
                interview=interview,
                text=q,
                order=i
            )

        # Step 5: Return full interview with questions
        serializer = InterviewSerializer(interview)
        return Response(serializer.data, status=201)


class InterviewCreateView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user

        interview = Interview.objects.create(
            user=user,
            title=data.get('title', 'General Interview'),
            scheduled_at=data.get('scheduled_at', timezone.now()),
            level=data.get('level'),
            mode=data.get('mode'),
            duration_seconds=data.get('duration_seconds', 600)
        )

        # Simulate 3 dummy questions
        sample_questions = [
            "Tell me about yourself.",
            "What are your strengths and weaknesses?",
            "Why do you want to work here?"
        ]
        for i, q in enumerate(sample_questions, start=1):
            Question.objects.create(interview=interview, text=q, order=i)

        serializer = InterviewSerializer(interview)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InterviewListView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(user=request.user)
        serializer = InterviewSerializer(interviews, many=True)
        return Response(serializer.data)


class SubmitResponseView(APIView):
    def post(self, request, interview_id, question_id):
        try:
            interview = Interview.objects.get(id=interview_id)
            question = Question.objects.get(id=question_id)
        except (Interview.DoesNotExist, Question.DoesNotExist):
            return DRFResponse({"detail": "Interview or Question not found"}, status=404)

        text = request.data.get("text")
        if not text:
            return DRFResponse({"detail": "Text is required"}, status=400)

        response = UserResponse.objects.create(
            interview=interview,
            question=question,
            text=text,
        )
        return DRFResponse({"id": response.id, "text": response.text}, status=201)


class SignupView(APIView):
    def post(self, request):
        email = request.data.get('api_email', request.data.get('email'))
        password = request.data.get('password')
        username = request.data.get('username', email)
        try:
            response = supabase.auth.sign_up({"email": email, "password": password})
            user = User.objects.create_user(
                email=email,
                username=username,
                supabase_id=response.user.id,
                password=password
            )
            return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            response = supabase.auth.sign_in_with_password({"email": email, "password": password})
            return Response({
                "token": response.session.access_token,
                "user": {"email": response.user.email}
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResumeUploadView(APIView):
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('resume')
        user = request.user

        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            auth_header = request.headers.get('Authorization')
            token = auth_header.split(' ')[1]

            file_path = f"resumes/{user.supabase_id}/{file.name}"
            mime_type, _ = guess_type(file.name)
            options = {"content-type": mime_type or "application/pdf"}

            response = supabase.storage.from_("resumes").upload(file_path, file.read(), options)

            # Check for error
            if hasattr(response, 'error') and response.error:
                return Response({"error": str(response.error)}, status=500)

            file_url = supabase.storage.from_("resumes").get_public_url(file_path)
            Resume.objects.create(user=user, email=user.email, file_url=file_url)

            supabase.auth.set_session(None, '')

            return Response({"message": "Resume uploaded", "url": file_url}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
