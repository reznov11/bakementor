"""Page analytics tracking models."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class PageVisit(UUIDModel, TimeStampedModel):
    page = models.ForeignKey("pages.Page", related_name="visits", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="page_visits",
    )
    session_id = models.CharField(max_length=64, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    referer = models.URLField(blank=True)
    visited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-visited_at",)


class PageDailySummary(TimeStampedModel):
    page = models.ForeignKey("pages.Page", related_name="daily_summaries", on_delete=models.CASCADE)
    date = models.DateField()
    views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("page", "date")
        ordering = ("-date",)

