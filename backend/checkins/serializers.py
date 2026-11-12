from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import MoodCheckIn, UserProfile, get_role

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
    # Write-only: lets an admin create a check-in for another user.
    # Regular users never send it; the owner comes from the token.
    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = MoodCheckIn
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at"]
        validators = []  # uniqueness is checked in validate() with the resolved owner

    def validate(self, attrs):
        attrs = super().validate(attrs)
        requester = self.context["request"].user
        target_user = attrs.get("user")

        if self.instance is not None:
            # Update: the owner of a check-in never changes.
            if target_user is not None and target_user != self.instance.user:
                raise serializers.ValidationError({"user_id": "The owner of a check-in cannot be changed."})
            owner = self.instance.user
        else:
            if target_user is not None and target_user != requester and get_role(requester) != UserProfile.Role.ADMIN:
                raise serializers.ValidationError({"user_id": "Only admins can create check-ins for other users."})
            owner = target_user or requester
            attrs["user"] = owner

        date = attrs.get("date")
        if date is None:  # PATCH without date: nothing to check
            return attrs

        # The DB UniqueConstraint is the real guarantee; this check turns it into a clear 400.
        duplicates = MoodCheckIn.objects.filter(user=owner, date=date)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError({"date": DUPLICATE_CHECKIN_MESSAGE})
        return attrs
