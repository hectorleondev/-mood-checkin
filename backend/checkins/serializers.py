from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import MoodCheckIn, get_role

User = get_user_model()

DUPLICATE_CHECKIN_MESSAGE = "You have already checked in for this day."


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role"]

    def get_role(self, obj) -> str:
        return get_role(obj)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)  # hashes the password


class MoodCheckInSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = MoodCheckIn
        fields = ["id", "username", "score", "note", "date", "created_at"]
        read_only_fields = ["id", "username", "created_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        date = attrs.get("date")
        if date is None:  # PATCH without date
            return attrs

        # `user` is not in the body, so DRF can't check UniqueConstraint(user, date)
        # on its own. Check it here to return 400 instead of a DB error (500).
        owner = self.instance.user if self.instance else self.context["request"].user
        duplicates = MoodCheckIn.objects.filter(user=owner, date=date)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError({"date": DUPLICATE_CHECKIN_MESSAGE})
        return attrs
