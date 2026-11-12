from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class MoodCheckIn(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mood_checkins",
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Mood score from 1 to 10",
    )
    note = models.TextField(blank=True, default="")
    date = models.DateField(help_text="User's local day of the check-in (sent by the client)")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Server timestamp for auditing")

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="one_checkin_per_day",
            ),
            models.CheckConstraint(
                condition=models.Q(score__gte=1, score__lte=10),
                name="score_between_1_and_10",
            ),
        ]

    def __str__(self):
        return f"{self.user} - {self.score} ({self.date:%d-%m-%Y})"


class UserProfile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)

    def __str__(self):
        return f"{self.user} ({self.role})"


def get_role(user):
    """Return the user's role; users without a profile are treated as regular users."""
    profile = getattr(user, "profile", None)
    return profile.role if profile else UserProfile.Role.USER
