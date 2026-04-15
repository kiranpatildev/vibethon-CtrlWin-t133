from django.db import models


class UserProfile(models.Model):
    supabase_uid = models.UUIDField(unique=True, db_index=True)
    display_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    xp_points = models.IntegerField(default=0)
    streak_count = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    badges = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"UserProfile({self.supabase_uid}) — {self.display_name or 'unnamed'}"

    def add_xp(self, points, reason=''):
        """Add XP points to the user and return new total."""
        self.xp_points += points
        self.save(update_fields=['xp_points', 'updated_at'])
        return self.xp_points

    def award_badge(self, badge_id):
        """Award a badge if not already owned."""
        if badge_id not in self.badges:
            self.badges.append(badge_id)
            self.save(update_fields=['badges', 'updated_at'])
            return True
        return False

    def update_streak(self):
        """Update daily streak. Call on every authenticated request."""
        from django.utils import timezone
        today = timezone.now().date()

        if self.last_active_date is None:
            self.streak_count = 1
        elif self.last_active_date == today:
            return  # Already counted today
        elif (today - self.last_active_date).days == 1:
            self.streak_count += 1
            if self.streak_count >= 7 and 'week_streak' not in self.badges:
                self.award_badge('week_streak')
                self.add_xp(20, 'daily_streak')
        else:
            self.streak_count = 1  # Streak broken

        self.last_active_date = today
        self.save(update_fields=['streak_count', 'last_active_date', 'updated_at'])
