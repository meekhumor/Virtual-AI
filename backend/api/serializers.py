from rest_framework import serializers
from .models import Interview, Question, Response

class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = ['id', 'text', 'video_url']

class QuestionSerializer(serializers.ModelSerializer):
    response = ResponseSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'response']

class InterviewSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = ['id', 'title', 'scheduled_at', 'level', 'mode', 'duration_seconds', 'questions']