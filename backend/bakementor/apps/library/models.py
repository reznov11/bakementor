"""Media asset management."""
from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel

media_storage = FileSystemStorage(location=settings.MEDIA_ROOT)


class MediaType(models.TextChoices):
    IMAGE = "image", "Image"
    VIDEO = "video", "Video"
    DOCUMENT = "document", "Document"
    OTHER = "other", "Other"


def upload_to(instance: "MediaFile", filename: str) -> str:
    return str(Path("uploads") / str(instance.uploaded_by_id or "anon") / filename)


class MediaFile(UUIDModel, TimeStampedModel):
    file = models.FileField(upload_to=upload_to, storage=media_storage)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="media_files",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.IMAGE)
    mime_type = models.CharField(max_length=120, blank=True)
    size = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):  # type: ignore[override]
        if self.file and hasattr(self.file, "size"):
            self.size = self.file.size  # type: ignore[assignment]
            mime, _ = mimetypes.guess_type(self.file.name)
            if mime:
                self.mime_type = mime
                if mime.startswith("image/"):
                    self.media_type = MediaType.IMAGE
                elif mime.startswith("video/"):
                    self.media_type = MediaType.VIDEO
                elif mime in {"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}:
                    self.media_type = MediaType.DOCUMENT
                else:
                    self.media_type = MediaType.OTHER
        super().save(*args, **kwargs)

