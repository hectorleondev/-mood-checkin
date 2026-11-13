from django.db import IntegrityError, transaction
from rest_framework import generics, permissions, serializers, viewsets

from .models import MoodCheckIn, is_admin
from .serializers import (
    DUPLICATE_CHECKIN_MESSAGE,
    MeSerializer,
    MoodCheckInSerializer,
    RegisterSerializer,
)


class MoodCheckInViewSet(viewsets.ModelViewSet):
    serializer_class = MoodCheckInSerializer
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        queryset = MoodCheckIn.objects.select_related("user")
        if is_admin(self.request.user):
            return queryset
        return queryset.filter(user=self.request.user)  # 404 on other users' records

    def _save_or_400(self, serializer, **kwargs):
        # Safety net for concurrent requests: the DB constraint wins -> 400, not 500.
        try:
            with transaction.atomic():
                serializer.save(**kwargs)
        except IntegrityError:
            raise serializers.ValidationError({"date": [DUPLICATE_CHECKIN_MESSAGE]})

    def perform_create(self, serializer):
        self._save_or_400(serializer, user=self.request.user)

    def perform_update(self, serializer):
        self._save_or_400(serializer)


class RegisterView(generics.CreateAPIView):
    """Public sign-up. New users get the 'user' role (post_save signal)."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user
