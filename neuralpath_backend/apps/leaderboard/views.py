from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.core.models import UserProfile
from apps.core.views import get_or_create_profile
from .models import LeaderboardEntry
from .serializers import LeaderboardSerializer


def refresh_leaderboard():
    """Recompute rank for all users and sync XP."""
    profiles = UserProfile.objects.all().order_by('-xp_points')
    for rank, profile in enumerate(profiles, start=1):
        modules_completed = profile.progress.filter(completed=True).count()
        quizzes_passed = profile.quiz_results.filter(score__gt=0).count()
        LeaderboardEntry.objects.update_or_create(
            user_profile=profile,
            defaults={
                'rank': rank,
                'xp_points': profile.xp_points,
                'modules_completed': modules_completed,
                'quizzes_passed': quizzes_passed,
            }
        )


class LeaderboardView(APIView):
    """GET /api/leaderboard/?limit=20 — top N users."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        refresh_leaderboard()
        limit = int(request.query_params.get('limit', 20))
        entries = LeaderboardEntry.objects.select_related('user_profile').order_by('rank')[:limit]
        serializer = LeaderboardSerializer(entries, many=True)
        return Response(serializer.data)


class MyRankView(APIView):
    """GET /api/leaderboard/me/ — current user's rank."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = get_or_create_profile(request.user)
        refresh_leaderboard()
        try:
            entry = LeaderboardEntry.objects.get(user_profile=profile)
            serializer = LeaderboardSerializer(entry)
            return Response(serializer.data)
        except LeaderboardEntry.DoesNotExist:
            return Response({'rank': None, 'xp_points': profile.xp_points})
