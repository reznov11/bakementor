"""Serializers for page management."""
from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from .models import Page, PageVersion


class PageListVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVersion
        exclude = ("component_tree",)


class PageListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    current_version = PageListVersionSerializer(read_only=True)
    published_version = PageListVersionSerializer(read_only=True)

    class Meta:
        model = Page
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "status",
            "is_public",
            "tags",
            "owner",
            "owner_email",
            "current_version",
            "published_version",
            "published_at",
            "created_at",
            "updated_at",
        )


class PageVersionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVersion
        fields = (
            "title",
            "notes",
            "component_tree",
            "metadata",
        )


class PageVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVersion
        fields = (
            "id",
            "page",
            "version",
            "title",
            "notes",
            "component_tree",
            "metadata",
            "is_published",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "page", "version", "is_published", "created_at", "updated_at")


class PageSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    current_version = PageVersionSerializer(read_only=True)
    published_version = PageVersionSerializer(read_only=True)

    class Meta:
        model = Page
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "status",
            "is_public",
            "tags",
            "owner",
            "owner_email",
            "current_version",
            "published_version",
            "published_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "slug",
            "status",
            "is_public",
            "owner",
            "owner_email",
            "current_version",
            "published_version",
            "published_at",
            "created_at",
            "updated_at",
        )


class PageCreateSerializer(serializers.ModelSerializer):
    initial_version = PageVersionWriteSerializer(write_only=True)

    class Meta:
        model = Page
        fields = ("title", "description", "tags", "initial_version")

    def create(self, validated_data):
        version_data = validated_data.pop("initial_version")
        request = self.context["request"]
        page = Page.objects.create(owner=request.user, **validated_data)
        PageVersion.objects.create(
            page=page,
            version=PageVersion.next_version_for(page),
            created_by=request.user,
            title=version_data.get("title") or page.title,
            notes=version_data.get("notes", ""),
            component_tree=version_data.get("component_tree", {}),
            metadata=version_data.get("metadata", {}),
        )
        page.refresh_from_db()
        page.current_version = page.versions.order_by("-created_at").first()
        page.save(update_fields=["current_version"])
        return page


class PagePublishSerializer(serializers.Serializer):
    version_id = serializers.UUIDField(required=False)

    def validate(self, attrs):
        page: Page = self.context["page"]
        version_id = attrs.get("version_id")
        if version_id:
            try:
                version = page.versions.get(id=version_id)
            except PageVersion.DoesNotExist as exc:
                raise serializers.ValidationError("Version not found") from exc
        else:
            version = page.current_version
        if version is None:
            raise serializers.ValidationError("Page has no version to publish")
        attrs["version"] = version
        return attrs

    def save(self, **kwargs):
        page: Page = self.context["page"]
        version: PageVersion = self.validated_data["version"]
        version.mark_as_published()
        page.mark_published(version)
        return {
            "page_id": str(page.id),
            "published_at": timezone.localtime(page.published_at) if page.published_at else None,
            "version": PageVersionSerializer(version).data,
        }

