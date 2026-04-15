import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.core.views import get_or_create_profile
from .client import call_gemini, check_rate_limit


class AITutorView(APIView):
    """POST /api/ai/tutor/ — AI tutor chat."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.user
        uid = payload.get('sub', 'anon')

        if check_rate_limit(uid):
            return Response({'error': 'Please wait a moment before asking again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        question = request.data.get('question', '').strip()
        topic_context = request.data.get('topic_context', 'AI/ML fundamentals')

        if not question:
            return Response({'error': 'question is required'}, status=status.HTTP_400_BAD_REQUEST)

        system_prompt = (
            f"You are NeuralPath, an expert AIML tutor. "
            f"The student is currently studying: {topic_context}. "
            f"Answer their question clearly and concisely. "
            f"Use simple analogies. Do NOT answer questions unrelated to AI/ML."
        )

        try:
            answer = call_gemini(system_prompt, question)
            return Response({'answer': answer})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIQuizGenView(APIView):
    """POST /api/ai/quiz-gen/ — generate quiz questions."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.user
        uid = payload.get('sub', 'anon')

        if check_rate_limit(uid, cooldown_seconds=10):
            return Response({'error': 'Please wait before generating another quiz.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        topic = request.data.get('topic', 'Machine Learning')
        difficulty = request.data.get('difficulty', 'medium')
        count = min(int(request.data.get('count', 5)), 10)

        system_prompt = (
            f"Generate {count} multiple choice questions about {topic} "
            f"at {difficulty} difficulty for an AIML learner. "
            f"Respond ONLY with a valid JSON array. No preamble. No markdown fences. "
            f"Each object must have: question_text (string), options (array of exactly 4 strings), "
            f"correct_answer (integer 0-3), explanation (string)."
        )

        try:
            raw = call_gemini(system_prompt, f"Generate {count} questions about {topic} at {difficulty} level.")
            # Strip markdown fences if model ignores instructions
            raw = raw.strip().strip('`').strip()
            if raw.startswith('json'):
                raw = raw[4:].strip()
            questions = json.loads(raw)
            return Response({'questions': questions})
        except json.JSONDecodeError as e:
            return Response({'error': f'Failed to parse AI response as JSON: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIHintView(APIView):
    """POST /api/ai/hint/ — code hint giver."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.user
        uid = payload.get('sub', 'anon')

        if check_rate_limit(uid):
            return Response({'error': 'Please wait a moment before requesting another hint.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        code = request.data.get('code', '')
        challenge_description = request.data.get('challenge_description', '')

        if not challenge_description:
            return Response({'error': 'challenge_description is required'}, status=status.HTTP_400_BAD_REQUEST)

        system_prompt = (
            f"You are a coding mentor. The student is working on: {challenge_description}. "
            f"Give ONE helpful hint only — not the solution, not the full code. "
            f"Be encouraging. Maximum 3 sentences."
        )

        try:
            hint = call_gemini(system_prompt, f"My current code:\n{code}\n\nI need a hint.")
            return Response({'hint': hint})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIExplainView(APIView):
    """POST /api/ai/explain/ — Sim World prediction explainer."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.user
        uid = payload.get('sub', 'anon')

        if check_rate_limit(uid):
            return Response({'error': 'Please wait a moment.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        dataset_name = request.data.get('dataset_name', '')
        prediction = request.data.get('prediction', '')
        features = request.data.get('features', {})

        system_prompt = (
            f"You are explaining an ML model prediction to a student. "
            f"Dataset: {dataset_name}. Prediction: {prediction}. "
            f"Key features used: {features}. "
            f"Explain in 2-3 plain English sentences why the model likely made this prediction. "
            f"No jargon. No code. Be intuitive and educational."
        )

        try:
            explanation = call_gemini(system_prompt, "Explain this prediction.")
            return Response({'explanation': explanation})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
