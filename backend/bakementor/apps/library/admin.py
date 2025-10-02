"""Admin registrations for media app."""
from __future__ import annotations

from django.contrib import admin

from .models import MediaFile


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ("title", "media_type", "size", "uploaded_by", "created_at")
    list_filter = ("media_type",)
    search_fields = ("title", "alt_text", "uploaded_by__email")
    readonly_fields = ("created_at", "updated_at", "size")
    autocomplete_fields = ("uploaded_by",)
