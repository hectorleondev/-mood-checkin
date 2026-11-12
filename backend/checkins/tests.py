from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MoodCheckIn, UserProfile

User = get_user_model()

PASSWORD = "test-pass-123"
LOGIN_URL = "/api/auth/login/"
CHECKINS_URL = "/api/mood-checkins/"


class BaseAPITestCase(APITestCase):
    """Shared users and check-ins, created once for the whole test class."""

    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(username="admin_user", password=PASSWORD)
        cls.admin.profile.role = UserProfile.Role.ADMIN
        cls.admin.profile.save()

        cls.user = User.objects.create_user(username="normal_user", password=PASSWORD)
        cls.other_user = User.objects.create_user(username="other_user", password=PASSWORD)

        cls.user_checkin = MoodCheckIn.objects.create(
            user=cls.user, score=7, date=date(2026, 11, 10)
        )
        cls.other_checkin = MoodCheckIn.objects.create(
            user=cls.other_user, score=4, date=date(2026, 11, 10)
        )

    def authenticate(self, username):
        """Log in through the real JWT endpoint and use the access token."""
        response = self.client.post(
            LOGIN_URL, {"username": username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")


class LoginTests(BaseAPITestCase):
    def test_login_with_valid_credentials_returns_tokens(self):
        response = self.client.post(
            LOGIN_URL, {"username": "normal_user", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_missing_fields_returns_400(self):
        response = self.client.post(LOGIN_URL, {"username": "normal_user"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_login_with_wrong_password_returns_401(self):
        response = self.client.post(
            LOGIN_URL, {"username": "normal_user", "password": "wrong"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("access", response.data)


class ListCheckInsTests(BaseAPITestCase):
    def test_admin_sees_checkins_of_all_users(self):
        self.authenticate("admin_user")
        response = self.client.get(CHECKINS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.user_checkin.id, self.other_checkin.id})

    def test_normal_user_sees_only_own_checkins(self):
        self.authenticate("normal_user")
        response = self.client.get(CHECKINS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.user_checkin.id})
        self.assertTrue(all(item["user"]["id"] == self.user.id for item in response.data))

    def test_list_without_token_returns_401(self):
        response = self.client.get(CHECKINS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CreateCheckInTests(BaseAPITestCase):
    def setUp(self):
        self.authenticate("normal_user")

    def test_create_valid_checkin_returns_201_and_uses_token_user(self):
        payload = {"score": 8, "note": "Good day", "date": "2026-11-12", "user": self.other_user.id}
        response = self.client.post(CHECKINS_URL, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["id"], self.user.id)  # body "user" is ignored
        self.assertEqual(response.data["score"], 8)
        self.assertEqual(response.data["date"], "2026-11-12")

    def test_note_is_optional(self):
        response = self.client.post(
            CHECKINS_URL, {"score": 5, "date": "2026-11-13"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["note"], "")

    def test_duplicate_checkin_same_day_returns_400(self):
        response = self.client.post(
            CHECKINS_URL, {"score": 3, "date": "2026-11-10"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)
        self.assertEqual(MoodCheckIn.objects.filter(user=self.user).count(), 1)

    def test_score_out_of_range_returns_400(self):
        for score in (0, 11):
            with self.subTest(score=score):
                response = self.client.post(
                    CHECKINS_URL, {"score": score, "date": "2026-11-14"}, format="json"
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("score", response.data)

    def test_create_without_token_returns_401(self):
        self.client.credentials()  # drop the token
        response = self.client.post(
            CHECKINS_URL, {"score": 5, "date": "2026-11-15"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
