import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache

_model = None


def get_model():
    global _model
    if _model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel('gemini-1.5-flash')
    return _model


def call_gemini(system_prompt: str, user_message: str) -> str:
    """Call Gemini with a system prompt and user message."""
    model = get_model()
    full_prompt = f"{system_prompt}\n\nUser: {user_message}"
    response = model.generate_content(full_prompt)
    return response.text


def check_rate_limit(user_uid: str, cooldown_seconds: int = 5) -> bool:
    """
    Returns True if the user is rate-limited (called too recently).
    Returns False if they can proceed.
    """
    cache_key = f"ai_ratelimit_{user_uid}"
    if cache.get(cache_key):
        return True
    cache.set(cache_key, True, cooldown_seconds)
    return False
