from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from .models import MediaFile
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class MediaUploadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="user@example.com", password="pass")
        self.staff = User.objects.create_user(email="staff@example.com", password="pass", is_staff=True)
        self.client = APIClient()

    def test_unauthenticated_cannot_upload(self):
        url = reverse("media-upload")
        data = {"file": SimpleUploadedFile("test.txt", b"hello world", content_type="text/plain")}
        res = self.client.post(url, data, format="multipart")
        self.assertIn(res.status_code, (401, 403))

    def test_staff_can_upload(self):
        self.client.force_authenticate(self.staff)
        url = reverse("media-upload")
        data = {"file": SimpleUploadedFile("test.txt", b"hello world", content_type="text/plain")}
        res = self.client.post(url, data, format="multipart")
        self.assertEqual(res.status_code, 201)
        self.assertTrue(MediaFile.objects.filter(title="test.txt").exists())

    def test_normal_user_without_perm_cannot_upload(self):
        self.client.force_authenticate(self.user)
        url = reverse("media-upload")
        data = {"file": SimpleUploadedFile("test.txt", b"hello world", content_type="text/plain")}
        res = self.client.post(url, data, format="multipart")
        self.assertEqual(res.status_code, 403)
