import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .client import call_gemini, call_gemini_json, check_rate_limit


class AITutorView(APIView):
    """POST /api/ai/tutor/ — AI tutor chat powered by Gemini."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id

        if check_rate_limit(user_id, cooldown_seconds=3):
            return Response({'error': 'Please wait a moment before asking again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        question = request.data.get('question', '').strip()
        topic_context = request.data.get('topic_context', 'AI/ML fundamentals')

        if not question:
            return Response({'error': 'question is required'}, status=status.HTTP_400_BAD_REQUEST)

        system_prompt = (
            f"You are NeuralPath, a friendly and expert AI/ML tutor. "
            f"The student is currently studying: {topic_context}. "
            f"Answer their question clearly, concisely, and accurately. "
            f"Use simple analogies when helpful. Keep answers to 3-5 sentences unless more depth is needed. "
            f"Do NOT answer questions completely unrelated to AI, ML, or data science."
        )

        try:
            answer = call_gemini(system_prompt, question)
            return Response({'answer': answer})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIQuizGenView(APIView):
    """POST /api/ai/quiz-gen/ — Generate quiz questions with Gemini JSON mode."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id

        if check_rate_limit(user_id, cooldown_seconds=10):
            return Response({'error': 'Please wait before generating another quiz.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        topic = request.data.get('topic', 'Machine Learning')
        difficulty = request.data.get('difficulty', 'medium')
        count = min(int(request.data.get('count', 5)), 10)

        system_prompt = (
            f"You are a quiz generator for an AI/ML learning platform. "
            f"Generate exactly {count} multiple choice questions about '{topic}' at {difficulty} difficulty. "
            f"Return ONLY a valid JSON array. Each element must have exactly these fields: "
            f"'question_text' (string), 'options' (array of exactly 4 strings), "
            f"'correct_answer' (integer 0-3 indicating which option is correct), "
            f"'explanation' (string, 1-2 sentences explaining why the answer is correct). "
            f"No extra text, no markdown, just the JSON array."
        )

        try:
            raw = call_gemini_json(
                system_prompt,
                f"Generate {count} {difficulty} questions about: {topic}"
            )
            # Clean up any accidental markdown fences
            raw = raw.strip()
            if raw.startswith('```'):
                raw = raw.split('```')[1]
                if raw.startswith('json'):
                    raw = raw[4:]
                raw = raw.strip()

            questions = json.loads(raw)
            if not isinstance(questions, list):
                questions = questions.get('questions', questions)

            return Response({'questions': questions})
        except json.JSONDecodeError as e:
            return Response(
                {'error': f'Failed to parse AI response as JSON: {str(e)}', 'raw': raw[:200]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIHintView(APIView):
    """POST /api/ai/hint/ — Give a coding hint without revealing the full solution."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id

        if check_rate_limit(user_id, cooldown_seconds=5):
            return Response({'error': 'Please wait a moment before requesting another hint.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        code = request.data.get('code', '')
        challenge_description = request.data.get('challenge_description', '')

        if not challenge_description:
            return Response({'error': 'challenge_description is required'}, status=status.HTTP_400_BAD_REQUEST)

        system_prompt = (
            f"You are an encouraging coding mentor for an AI/ML learning platform. "
            f"The student is working on this challenge: {challenge_description}. "
            f"Give exactly ONE helpful hint — a nudge in the right direction. "
            f"Do NOT give the solution or write code for them. "
            f"Be warm and encouraging. Maximum 3 sentences."
        )

        try:
            hint = call_gemini(system_prompt, f"My current code:\n{code[:1000]}\n\nI need a hint, not the answer.")
            return Response({'hint': hint})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIExplainView(APIView):
    """POST /api/ai/explain/ — Explain a Sim World ML model prediction in plain English."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id

        if check_rate_limit(user_id, cooldown_seconds=5):
            return Response({'error': 'Please wait a moment.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        dataset_name = request.data.get('dataset_name', '')
        prediction = request.data.get('prediction', '')
        features = request.data.get('features', {})

        system_prompt = (
            f"You are explaining a machine learning model's prediction to a beginner student. "
            f"Dataset: {dataset_name}. The model predicted: {prediction}. "
            f"Input features the model used: {features}. "
            f"Explain in 2-3 plain English sentences why the model likely made this prediction. "
            f"No jargon. No code. Be intuitive and educational."
        )

        try:
            explanation = call_gemini(system_prompt, "Explain this prediction in plain English.")
            return Response({'explanation': explanation})
        except Exception as e:
            return Response({'error': f'AI service error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
