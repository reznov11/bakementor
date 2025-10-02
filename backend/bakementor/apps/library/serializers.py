"""Serializers for media assets."""
from __future__ import annotations

from rest_framework import serializers

from .models import MediaFile


class MediaFileSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source="uploaded_by.email", read_only=True)

    class Meta:
        model = MediaFile
        fields = (
            "id",
            "title",
            "description",
            "media_type",
            "mime_type",
            "size",
            "alt_text",
            "metadata",
            "file",
            "uploaded_by",
            "uploaded_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "mime_type",
            "size",
            "uploaded_by",
            "uploaded_by_email",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "file": {"write_only": False},
        }

