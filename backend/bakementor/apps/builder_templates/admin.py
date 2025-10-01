"""Admin registrations for templates and components."""
from __future__ import annotations

from django.contrib import admin

from .models import ComponentDefinition, PageTemplate


@admin.register(ComponentDefinition)
class ComponentDefinitionAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "category", "is_active", "updated_at")
    list_filter = ("category", "is_active")
    search_fields = ("name", "key")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PageTemplate)
class PageTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_public", "updated_at")
    list_filter = ("is_public",)
    search_fields = ("name", "slug")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("created_by",)
