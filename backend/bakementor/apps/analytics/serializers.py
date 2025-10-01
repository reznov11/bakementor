"""Analytics serializers."""
from __future__ import annotations

from rest_framework import serializers

from .models import PageDailySummary, PageVisit


class PageVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVisit
        fields = (
            "id",
            "page",
            "user",
            "session_id",
            "ip_address",
            "user_agent",
            "referer",
            "visited_at",
        )
        read_only_fields = fields


class PageDailySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PageDailySummary
        fields = (
            "id",
            "page",
            "date",
            "views",
            "unique_visitors",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

