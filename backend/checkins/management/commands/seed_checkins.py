import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from checkins.models import MoodCheckIn

from .seed_users import SEED_USERS

User = get_user_model()

TOTAL_CHECKINS = 30
FIRST_USER_CHECKINS = 5
NOTES = ["", "", "Slept well", "Stressful day at work", "Went for a walk", "Felt anxious", "Good therapy session"]


class Command(BaseCommand):
    help = (
        f"Create {TOTAL_CHECKINS} mood check-ins for the seeded users: "
        f"{FIRST_USER_CHECKINS} for the first user, the rest split between the others. "
        "Run seed_users first. Idempotent: one check-in per user per day."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        usernames = [u["username"] for u in SEED_USERS]
        users = list(User.objects.filter(username__in=usernames).order_by("id"))
        if len(users) != len(usernames):
            raise CommandError("Seed users not found. Run: python manage.py seed_users")

        rng = random.Random(42)  # reproducible data
        others = users[1:]
        remaining = TOTAL_CHECKINS - FIRST_USER_CHECKINS
        plan = {users[0]: FIRST_USER_CHECKINS}
        for i, user in enumerate(others):
            plan[user] = remaining // len(others) + (1 if i < remaining % len(others) else 0)

        today = timezone.localdate()
        created_count = 0
        for user, count in plan.items():
            for days_ago in range(1, count + 1):  # consecutive past days -> no duplicates
                _, created = MoodCheckIn.objects.get_or_create(
                    user=user,
                    date=today - timedelta(days=days_ago),
                    defaults={"score": rng.randint(1, 10), "note": rng.choice(NOTES)},
                )
                created_count += created
            self.stdout.write(f"{user.username}: {count} check-ins")

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created_count} new check-ins."))
