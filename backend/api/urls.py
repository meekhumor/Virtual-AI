from django.urls import path
from .views import (
    InterviewDetailView,
    InterviewListView,
    SubmitResponseView,
    ResumeUploadView,
    LoginView,
    SignupView,
    GuestLoginView,
    StartInterviewView,
    UpdateProfileView,
    ProfileImageUploadView,
    ProfileView,
    ProfileStatsView,
    InterviewAnalysisView,
    InterviewAnalysisGetView,
    InterviewStatusUpdateView,
    VideoUploadView,
)

urlpatterns = [
    # Auth
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('guest-login/', GuestLoginView.as_view(), name='guest-login'),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile-view'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/image/', ProfileImageUploadView.as_view(), name='profile-image-upload'),
    path('profile/stats/', ProfileStatsView.as_view(), name='profile-stats'),

    # Resume
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),

    # Interviews
    path('interviews/start/', StartInterviewView.as_view(), name='interview-start'),
    path('interviews/', InterviewListView.as_view(), name='interview-list'),
    path('interviews/<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),
    path('interviews/<int:interview_id>/questions/<int:question_id>/response/', SubmitResponseView.as_view(), name='submit-response'),

    # Analysis
    path('interviews/<int:interview_id>/analyze/', InterviewAnalysisView.as_view(), name='interview-analyze'),
    path('interviews/<int:interview_id>/analysis/', InterviewAnalysisGetView.as_view(), name='interview-analysis'),

    # Status update
    path('interviews/<int:interview_id>/status/', InterviewStatusUpdateView.as_view(), name='interview-status'),
    path('interviews/video/upload/', VideoUploadView.as_view(), name='video-upload'),
]