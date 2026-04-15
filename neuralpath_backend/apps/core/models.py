from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)
    # Keep supabase_uid as a nullable char field for future Supabase migration
    supabase_uid = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
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
        name = self.display_name or (self.user.username if self.user else 'unnamed')
        return f"UserProfile({self.id}) — {name}"

    @property
    def level(self):
        """Return level name and number based on XP."""
        xp = self.xp_points
        if xp < 200:
            return {'name': 'Novice', 'number': 1, 'next_xp': 200}
        elif xp < 500:
            return {'name': 'Apprentice', 'number': 2, 'next_xp': 500}
        elif xp < 1000:
            return {'name': 'Practitioner', 'number': 3, 'next_xp': 1000}
        elif xp < 2000:
            return {'name': 'Expert', 'number': 4, 'next_xp': 2000}
        else:
            return {'name': 'Master', 'number': 5, 'next_xp': None}

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
