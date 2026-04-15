from django.db import models
from apps.core.models import UserProfile


class LeaderboardEntry(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='leaderboard_entry')
    rank = models.IntegerField(default=0)
    xp_points = models.IntegerField(default=0)
    modules_completed = models.IntegerField(default=0)
    quizzes_passed = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-xp_points']

    def __str__(self):
        return f"#{self.rank} {self.user_profile} — {self.xp_points} XP"
