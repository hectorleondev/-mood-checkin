from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MoodCheckIn, UserProfile

User = get_user_model()
URL = "/api/mood-checkins/"


class MoodCheckInAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user("ana", password="pass-12345")
        cls.other = User.objects.create_user("carlos", password="pass-12345")
        cls.admin = User.objects.create_user("boss", password="pass-12345")
        cls.admin.profile.role = UserProfile.Role.ADMIN
        cls.admin.profile.save()
        cls.other_checkin = MoodCheckIn.objects.create(user=cls.other, score=4, date=date(2026, 11, 10))

    def test_create_returns_201_and_owner_comes_from_token(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(URL, {"score": 7, "note": "ok", "date": "2026-11-12"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "ana")
        self.assertTrue(MoodCheckIn.objects.filter(user=self.user, date=date(2026, 11, 12)).exists())

    def test_duplicate_same_day_returns_400(self):
        self.client.force_authenticate(self.other)
        response = self.client.post(URL, {"score": 5, "date": "2026-11-10"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)
        self.assertEqual(MoodCheckIn.objects.filter(user=self.other).count(), 1)

    def test_score_out_of_range_returns_400(self):
        self.client.force_authenticate(self.user)
        for score in (0, 11):
            with self.subTest(score=score):
                response = self.client.post(URL, {"score": score, "date": "2026-11-13"}, format="json")
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("score", response.data)

    def test_user_cannot_see_other_users_checkins(self):
        self.client.force_authenticate(self.user)

        list_response = self.client.get(URL)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 0)  # paginated response

        detail_response = self.client.get(f"{URL}{self.other_checkin.id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_sees_all_checkins(self):
        MoodCheckIn.objects.create(user=self.user, score=8, date=date(2026, 11, 11))
        self.client.force_authenticate(self.admin)

        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
