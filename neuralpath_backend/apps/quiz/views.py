from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.core.views import get_or_create_profile
from apps.curriculum.models import Module
from .models import Quiz, Question, UserQuizResult
from .serializers import QuizSerializer, QuestionWithAnswerSerializer, UserQuizResultSerializer


class QuizView(APIView):
    """GET /api/quiz/?module=<slug> — Get quiz for a module."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        module_slug = request.query_params.get('module')
        if module_slug:
            try:
                module = Module.objects.get(slug=module_slug)
                quiz = Quiz.objects.filter(module=module).prefetch_related('questions').first()
            except Module.DoesNotExist:
                return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            quiz = Quiz.objects.prefetch_related('questions').first()

        if not quiz:
            return Response({'error': 'No quiz found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizSerializer(quiz)
        return Response(serializer.data)


class QuizSubmitView(APIView):
    """POST /api/quiz/submit/ — Submit quiz answers and get score."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = get_or_create_profile(request.user)
        quiz_id = request.data.get('quiz_id')
        answers = request.data.get('answers', {})  # {question_id: selected_index}
        time_taken = request.data.get('time_taken', 0)

        try:
            quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

        questions = quiz.questions.all()
        score = 0
        max_score = questions.count()
        question_results = []

        for q in questions:
            user_answer = answers.get(str(q.id))
            correct = (user_answer is not None and int(user_answer) == q.correct_answer)
            if correct:
                score += 1
            question_results.append({
                'question_id': q.id,
                'user_answer': user_answer,
                'correct_answer': q.correct_answer,
                'correct': correct,
                'explanation': q.explanation,
            })

        percentage = round((score / max_score) * 100) if max_score > 0 else 0

        # Save result
        result = UserQuizResult.objects.create(
            user_profile=profile,
            quiz=quiz,
            score=score,
            max_score=max_score,
            time_taken_seconds=time_taken,
            answers=answers,
        )

        # Award XP
        if percentage >= 70:
            profile.add_xp(30, 'quiz_pass')
        if percentage == 100:
            profile.add_xp(50, 'quiz_perfect')
            profile.award_badge('quiz_master')

        return Response({
            'score': score,
            'max_score': max_score,
            'percentage': percentage,
            'time_taken': time_taken,
            'question_results': question_results,
            'xp_earned': 30 if percentage >= 70 else 0,
        })
