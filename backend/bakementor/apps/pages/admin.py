"""Admin registrations for the pages builder."""
from __future__ import annotations

from django.contrib import admin

from .models import Page, PageDraftLock, PageVersion


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "status", "owner", "published_at")
    list_filter = ("status", "is_public")
    search_fields = ("title", "slug", "owner__email")
    readonly_fields = ("created_at", "updated_at", "published_at")
    autocomplete_fields = ("owner", "current_version", "published_version")


@admin.register(PageVersion)
class PageVersionAdmin(admin.ModelAdmin):
    list_display = ("page", "version", "is_published", "created_at")
    list_filter = ("is_published",)
    search_fields = ("page__title", "notes")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PageDraftLock)
class PageDraftLockAdmin(admin.ModelAdmin):
    list_display = ("page", "locked_by", "expires_at")
    autocomplete_fields = ("page", "locked_by")
    readonly_fields = ("created_at", "updated_at")
