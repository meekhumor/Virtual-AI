from django.urls import path
from .views import InterviewDetailView, InterviewListView, InterviewCreateView, SubmitResponseView, ResumeUploadView, LoginView, SignupView, StartInterviewView
urlpatterns = [
    path('interviews/start/', StartInterviewView.as_view(), name='interview-start'),
     path('interviews/', InterviewListView.as_view(), name='interview-list'),  
    path('interviews/<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),  
    path('interviews/create/', InterviewCreateView.as_view(), name='interview-create'),
    path('interviews/<int:interview_id>/questions/<int:question_id>/response/', SubmitResponseView.as_view(), name='submit-response'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('resume/upload/', ResumeUploadView.as_view(), name='resume-upload'),

]