from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import MoodCheckIn, get_role

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "role"]

    def get_role(self, obj) -> str:
        return get_role(obj)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


DUPLICATE_CHECKIN_MESSAGE = "You have already checked in for this day."


class MoodCheckInSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = MoodCheckIn
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        date = attrs.get("date")
        if date is None:  # PATCH without date: nothing to check
            return attrs

        # `user` is not in the request body, so DRF can't run the
        # UniqueConstraint check by itself. Check it here to return a 400.
        user = self.instance.user if self.instance else self.context["request"].user
        duplicates = MoodCheckIn.objects.filter(user=user, date=date)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError({"date": DUPLICATE_CHECKIN_MESSAGE})
        return attrs
