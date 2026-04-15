import jwt
import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

JWKS_CACHE_KEY = 'supabase_jwks'
JWKS_CACHE_TTL = 3600  # 1 hour


def get_supabase_public_keys():
    """Fetch Supabase JWKS keys, cached for 1 hour."""
    cached = cache.get(JWKS_CACHE_KEY)
    if cached:
        return cached
    url = f"{settings.SUPABASE_URL}/auth/v1/keys"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        keys = response.json().get('keys', [])
        cache.set(JWKS_CACHE_KEY, keys, JWKS_CACHE_TTL)
        return keys
    except Exception as e:
        raise AuthenticationFailed(f'Failed to fetch Supabase JWKS: {e}')


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticates requests using Supabase-issued JWTs.
    Verifies using Supabase's JWKS public keys (RS256).
    Returns (payload_dict, token) — no Django User object.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        # If no Supabase URL configured (dev mode), skip real verification
        if not settings.SUPABASE_URL:
            try:
                payload = jwt.decode(token, options={"verify_signature": False})
                return (payload, token)
            except Exception as e:
                raise AuthenticationFailed(f'Invalid token: {e}')

        try:
            keys = get_supabase_public_keys()
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            matching_key = next((k for k in keys if k.get('kid') == kid), None)

            if not matching_key:
                raise AuthenticationFailed('No matching JWKS key found for this token')

            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(matching_key)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience='authenticated',
            )
            return (payload, token)

        except AuthenticationFailed:
            raise
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {e}')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication error: {e}')

    def authenticate_header(self, request):
        return 'Bearer realm="NeuralPath API"'
