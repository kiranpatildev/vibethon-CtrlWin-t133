"""
Core auth views — Django Token Authentication (local PostgreSQL mode).
No Supabase required. Works fully offline.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import UserProfileSerializer


def get_or_create_profile(user):
    """Get or create a UserProfile from a Django User object."""
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'display_name': user.get_full_name() or user.username,
            'email': user.email,
        }
    )
    if not created:
        profile.update_streak()
    return profile, created



class PingView(APIView):
    """Health check — public endpoint."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'service': 'NeuralPath API'})


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Creates a Django user + token + UserProfile.
    Body: { email, password, display_name }
    Also accepts authenticated calls (from frontend after first login) to just return the profile.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # If already authenticated (token provided), just return profile
        if request.user and request.user.is_authenticated:
            profile, created = get_or_create_profile(request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)

        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        display_name = request.data.get('display_name', '').strip()

        if not email or not password:
            return Response({'error': 'email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        username = email.split('@')[0][:30]
        # Ensure unique username
        base = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{counter}"
            counter += 1

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=display_name,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = get_or_create_profile(user)
        profile.display_name = display_name or username
        profile.save()

        serializer = UserProfileSerializer(profile)
        data = serializer.data
        data['token'] = token.key
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { email, password }
    Returns: { token, ...profile }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = get_or_create_profile(user)

        serializer = UserProfileSerializer(profile)
        data = serializer.data
        data['token'] = token.key
        return Response(data)


class MeView(APIView):
    """
    GET /api/me/
    Returns current user's profile, XP, badges, streak.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = get_or_create_profile(request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        """Update display_name."""
        profile, _ = get_or_create_profile(request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
