"""Admin registrations for analytics."""
from __future__ import annotations

from django.contrib import admin

from .models import PageDailySummary, PageVisit


@admin.register(PageVisit)
class PageVisitAdmin(admin.ModelAdmin):
    list_display = ("page", "visited_at", "user", "ip_address")
    list_filter = ("visited_at",)
    search_fields = ("page__title", "ip_address", "user_agent")
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("page", "user")


@admin.register(PageDailySummary)
class PageDailySummaryAdmin(admin.ModelAdmin):
    list_display = ("page", "date", "views", "unique_visitors")
    list_filter = ("date",)
    search_fields = ("page__title",)
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("page",)
