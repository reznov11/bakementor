"""Serializers for component registry and templates."""
from __future__ import annotations

from rest_framework import serializers

from .models import ComponentDefinition, PageTemplate


class ComponentDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentDefinition
        fields = (
            "id",
            "key",
            "name",
            "category",
            "description",
            "schema",
            "props_schema",
            "preview_image",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class PageTemplateSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = PageTemplate
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "component_tree",
            "thumbnail",
            "created_by",
            "created_by_email",
            "is_public",
            "tags",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "created_by",
            "created_by_email",
            "created_at",
            "updated_at",
        )

