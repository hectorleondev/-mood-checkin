from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import MoodCheckIn, UserProfile

User = get_user_model()


@admin.register(MoodCheckIn)
class MoodCheckInAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "score", "note", "date", "created_at"]
    list_filter = ["date"]
    search_fields = ["user__username", "note"]


admin.site.unregister(User)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["id", "username", "first_name", "last_name", "role"]
    inlines = [UserProfileInline]

    @admin.display(description="Role")
    def role(self, obj):
        return getattr(getattr(obj, "profile", None), "role", "user")

    def has_delete_permission(self, request, obj=None):
        return False
