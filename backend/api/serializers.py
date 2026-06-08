from rest_framework import serializers
from .models import Interview, Question, Response, InterviewAnalysis


class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Response
        fields = ['id', 'interview', 'question', 'text', 'video_url', 'ai_feedback', 'agent_metadata']


class QuestionSerializer(serializers.ModelSerializer):
    response = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'response']

    def get_response(self, question):
        interview = self.context.get('interview')
        if not interview:
            return None
        try:
            response = Response.objects.get(interview=interview, question=question)
            return ResponseSerializer(response).data
        except Response.DoesNotExist:
            return None


class InterviewSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = ['id', 'title', 'scheduled_at', 'level', 'mode', 'duration_seconds', 'created_at', 'questions']


class InterviewDetailSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = ['id', 'title', 'level', 'mode', 'scheduled_at', 'duration_seconds', 'created_at', 'questions']

    def get_questions(self, interview):
        serializer = QuestionSerializer(
            interview.questions.all().order_by("order"),
            many=True,
            context={"interview": interview},
        )
        return serializer.data


class InterviewAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewAnalysis
        fields = [
            'id', 'interview', 'overall_score', 'communication_score',
            'technical_score', 'confidence_score', 'pace_wpm',
            'filler_word_count', 'power_word_count', 'strengths',
            'improvements', 'summary', 'generated_at',
        ]
