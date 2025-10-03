"""Media asset management."""
from __future__ import annotations

import hashlib
import mimetypes
from datetime import date
from pathlib import Path
from django.utils import timezone

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


def _safe_extension(filename: str) -> str:
    suffix = Path(filename).suffix or ""
    return suffix.lower()


def upload_to(instance: "MediaFile", filename: str) -> str:
    """Generate path like YYYY/MM/DD/PREFIX_<hash><ext>

    The hash is derived from the file contents (sha256) shortened to 16 hex chars.
    Example: 2025/10/03/media_ab12cd34ef56a789.jpg
    """
    # Compute date-based archive path (use timezone-aware date)
    today = timezone.localdate() if hasattr(timezone, "localdate") else date.today()
    year = str(today.year)
    month = f"{today.month:02d}"
    day = f"{today.day:02d}"

    # Determine extension
    ext = _safe_extension(filename)

    # Compute a content hash where possible
    hash_hex = "xxxx"
    try:
        # UploadedFile supports .chunks(); read content in chunks to avoid memory spikes
        hasher = hashlib.sha256()
        file_obj = instance.file
        if hasattr(file_obj, "chunks"):
            for chunk in file_obj.chunks():
                hasher.update(chunk)
        else:
            # Fallback: try reading whole file
            content = file_obj.read()
            if content:
                if isinstance(content, str):
                    content = content.encode("utf-8")
                hasher.update(content)
        hash_hex = hasher.hexdigest()[:16]
        # Reset file pointer where possible so storage can read it from the start
        if hasattr(file_obj, "seek"):
            try:
                file_obj.seek(0)
            except Exception:
                pass
    except Exception:
        # If hashing fails for any reason, fall back to a short uuid-like token
        import uuid

        hash_hex = uuid.uuid4().hex[:16]

    prefix = "media"
    name = f"{prefix}_{hash_hex}{ext}"
    return str(Path(year) / month / day / name)


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

