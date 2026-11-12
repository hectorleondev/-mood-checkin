from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from checkins.models import UserProfile

User = get_user_model()

SEED_PASSWORD = "password123"
SEED_USERS = [
    {"username": "ana", "first_name": "Ana", "last_name": "Lopez"},
    {"username": "carlos", "first_name": "Carlos", "last_name": "Ruiz"},
    {"username": "maria", "first_name": "Maria", "last_name": "Diaz"},
]


class Command(BaseCommand):
    help = "Create 3 demo users with the 'user' role (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        for data in SEED_USERS:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={"first_name": data["first_name"], "last_name": data["last_name"]},
            )
            if created:
                user.set_password(SEED_PASSWORD)
                user.save()
            UserProfile.objects.update_or_create(user=user, defaults={"role": UserProfile.Role.USER})
            self.stdout.write(f"{'Created' if created else 'Exists '}: {user.username}")

        self.stdout.write(self.style.SUCCESS(f"Done. Password for new users: {SEED_PASSWORD}"))
