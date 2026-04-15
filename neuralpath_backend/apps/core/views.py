from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import UserProfile
from .serializers import UserProfileSerializer


def get_or_create_profile(payload):
    """Get or create a UserProfile from a Supabase JWT payload."""
    uid = payload.get('sub')
    email = payload.get('email', '')
    display_name = payload.get('user_metadata', {}).get('full_name', '') or email.split('@')[0]

    profile, created = UserProfile.objects.get_or_create(
        supabase_uid=uid,
        defaults={'display_name': display_name, 'email': email}
    )
    if not created:
        profile.update_streak()

    # Award first badge
    if created:
        profile.award_badge('first_lesson')

    return profile, created


class PingView(APIView):
    """Health check — public endpoint."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'service': 'NeuralPath API'})


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Called after Supabase signup to ensure UserProfile exists in Django DB.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payload = request.user  # payload dict from SupabaseJWTAuthentication
        profile, created = get_or_create_profile(payload)
        serializer = UserProfileSerializer(profile)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class MeView(APIView):
    """
    GET /api/me/
    Returns current user's profile, XP, badges, streak.
    Auto-creates UserProfile if it doesn't exist.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payload = request.user
        profile, created = get_or_create_profile(payload)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        """Update display_name."""
        payload = request.user
        profile, _ = get_or_create_profile(payload)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
