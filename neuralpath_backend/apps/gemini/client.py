"""
Gemini AI client using the latest google-genai SDK.
Docs: https://ai.google.dev/gemini-api/docs/quickstart?lang=python
"""
from django.conf import settings
from django.core.cache import cache
from google import genai
from google.genai import types

_client = None


def get_client() -> genai.Client:
    """Return a singleton Gemini client. Lazy-initialized."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def call_gemini(system_prompt: str, user_message: str) -> str:
    """
    Call Gemini with a system instruction and user message.
    Uses the model configured in GEMINI_MODEL setting (default: gemini-2.5-flash).
    """
    client = get_client()
    model = settings.GEMINI_MODEL

    response = client.models.generate_content(
        model=model,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
            max_output_tokens=1024,
        ),
    )
    return response.text


def call_gemini_json(system_prompt: str, user_message: str) -> str:
    """
    Call Gemini and request JSON output mode.
    Use for structured outputs like quiz generation.
    """
    client = get_client()
    model = settings.GEMINI_MODEL

    response = client.models.generate_content(
        model=model,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.5,
            max_output_tokens=2048,
            response_mime_type='application/json',
        ),
    )
    return response.text


def check_rate_limit(user_id, cooldown_seconds: int = 5) -> bool:
    """
    Returns True if the user is rate-limited (called too recently).
    Returns False if they can proceed.
    """
    cache_key = f"ai_ratelimit_{user_id}"
    if cache.get(cache_key):
        return True
    cache.set(cache_key, True, cooldown_seconds)
    return False
