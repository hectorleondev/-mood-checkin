from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import MeView, MoodCheckInViewSet, RegisterView

router = DefaultRouter()
router.register("mood-checkins", MoodCheckInViewSet, basename="mood-checkin")

urlpatterns = [
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("users/me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]
