from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MoodCheckIn, UserProfile, get_role
from .serializers import DUPLICATE_CHECKIN_MESSAGE, MoodCheckInSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class MoodCheckInViewSet(viewsets.ModelViewSet):
    serializer_class = MoodCheckInSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete"]
    queryset = MoodCheckIn.objects.none()  # for schema generation; real queryset in get_queryset()

    def get_queryset(self):
        queryset = MoodCheckIn.objects.select_related("user", "user__profile")
        if get_role(self.request.user) == UserProfile.Role.ADMIN:
            return queryset
        return queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Safety net for concurrent requests that pass validation at the same time:
        # the DB UniqueConstraint wins, and we turn it into a 400 instead of a 500.
        try:
            with transaction.atomic():
                serializer.save()  # owner resolved in the serializer (token user, or chosen by an admin)
        except IntegrityError:
            raise serializers.ValidationError({"date": [DUPLICATE_CHECKIN_MESSAGE]})

    def perform_update(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            raise serializers.ValidationError({"date": [DUPLICATE_CHECKIN_MESSAGE]})

    @extend_schema(summary="Check-ins of one user (admins: any user; users: only themselves)")
    @action(detail=False, methods=["get"], url_path=r"user/(?P<user_id>\d+)")
    def by_user(self, request, user_id=None):
        checkins = self.get_queryset().filter(user_id=user_id)
        serializer = self.get_serializer(checkins, many=True)
        return Response(serializer.data)


class IsAdminRole(permissions.BasePermission):
    message = "Only admins can perform this action."

    def has_permission(self, request, view):
        return get_role(request.user) == UserProfile.Role.ADMIN


class UserViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = User.objects.select_related("profile").order_by("username")
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == "list":
            # Admin-only: used to pick the owner when creating a check-in.
            return [permissions.IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def get_serializer_class(self):
        return RegisterSerializer if self.action == "create" else UserSerializer

    @extend_schema(responses=UserSerializer, summary="Current authenticated user")
    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class RegisterView(generics.CreateAPIView):
    """Public sign-up. New users always get the 'user' role (set by the post_save signal)."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
