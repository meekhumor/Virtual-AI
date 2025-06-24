from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, Resume 
from .serializers import InterviewSerializer,  QuestionSerializer
from .supabase_client import supabase
from rest_framework.permissions import IsAuthenticated
from .auth import SupabaseJWTAuthentication
from mimetypes import guess_type
from .models import Interview, Question, Response as UserResponse

class StartInterviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        interview = Interview.objects.create(
            user=request.user,
            title=data.get('title', 'General Interview'),
            scheduled_at=timezone.now(),
            level=data['level'],
            mode=data['mode'],
            duration_seconds=data.get('duration_seconds', 600)
        )

        # Dummy question generation (replace with LLM integration later)
        questions_text = [
            "Tell me about yourself.",
            "What are your strengths?",
            "Why do you want this job?"
        ]
        for idx, text in enumerate(questions_text):
            Question.objects.create(
                interview=interview,
                text=text,
                order=idx + 1
            )

        return Response({"interview_id": interview.id}, status=201)

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
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, question_id):
        try:
            question = Question.objects.get(id=question_id, interview__user=request.user)
        except Question.DoesNotExist:
            return Response({"error": "Invalid question or not authorized"}, status=404)

        text = request.data.get('text')
        video_url = request.data.get('video_url', '')

        response = UserResponse.objects.create(
            question=question,
            text=text,
            video_url=video_url
        )

        return Response({"message": "Response submitted"}, status=201)
    
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