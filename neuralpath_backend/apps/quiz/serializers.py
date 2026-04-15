from rest_framework import serializers
from .models import Quiz, Question, UserQuizResult


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_type', 'question_text', 'options', 'order']
        # correct_answer excluded — never sent to frontend during quiz


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Used in results — includes correct answer and explanation."""
    class Meta:
        model = Question
        fields = ['id', 'question_type', 'question_text', 'options',
                  'correct_answer', 'explanation', 'order']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'difficulty', 'is_ai_generated', 'question_count', 'questions']

    def get_question_count(self, obj):
        return obj.questions.count()


class UserQuizResultSerializer(serializers.ModelSerializer):
    percentage = serializers.ReadOnlyField()
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = UserQuizResult
        fields = ['id', 'quiz_title', 'score', 'max_score', 'percentage',
                  'time_taken_seconds', 'answers', 'completed_at']
