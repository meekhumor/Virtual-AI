from django.urls import path
from .views import InterviewDetailView, InterviewListView, InterviewCreateView, SubmitResponseView, ResumeUploadView, LoginView, SignupView, StartInterviewView, UpdateProfileView, ProfileImageUploadView, ProfileView
urlpatterns = [
    path('interviews/start/', StartInterviewView.as_view(), name='interview-start'),
     path('interviews/', InterviewListView.as_view(), name='interview-list'),  
    path('interviews/<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),  
    path('interviews/create/', InterviewCreateView.as_view(), name='interview-create'),
    path('interviews/<int:interview_id>/questions/<int:question_id>/response/', SubmitResponseView.as_view(), name='submit-response'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/image/', ProfileImageUploadView.as_view(), name='profile-image-upload'),
    path("profile/", ProfileView.as_view(), name="profile-view"),
]