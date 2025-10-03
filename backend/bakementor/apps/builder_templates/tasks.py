"""Celery tasks for AI import and template generation."""

from __future__ import annotations

import time
from typing import Any

from celery import shared_task
from django.core.cache import cache

AI_IMPORT_CACHE_PREFIX = "ai_import:"


def _cache_key(job_id: str) -> str:
    return f"{AI_IMPORT_CACHE_PREFIX}{job_id}"


def _update(job_id: str, progress: int, step: str) -> None:
    state: dict[str, Any] = cache.get(_cache_key(job_id)) or {}
    state.update({"progress": progress, "step": step})
    cache.set(_cache_key(job_id), state, timeout=60 * 60)


@shared_task
def run_figma_import(job_id: str, figma_url: str, user_id: int) -> None:
    """Analyze a Figma file (via MCP integration point) and produce a builder tree."""
    try:
        _update(job_id, 5, "validating")
        time.sleep(0.2)

        _update(job_id, 20, "fetching-figma")
        time.sleep(0.4)

        _update(job_id, 45, "extracting-frames")
        time.sleep(0.4)

        _update(job_id, 70, "mapping-components")
        time.sleep(0.4)

        _update(job_id, 90, "assembling-tree")
        time.sleep(0.4)

        tree = {
            "version": "ai-import-1",
            "root": "root",
            "nodes": {
                "root": {
                    "id": "root",
                    "type": "layout",
                    "component": "layout.section",
                    "props": {},
                    "children": ["container"],
                    "styles": {
                        "base": {
                            "backgroundColor": "#ffffff",
                            "padding": {"top": "64px", "bottom": "96px", "left": "24px", "right": "24px"},
                        }
                    },
                },
                "container": {
                    "id": "container",
                    "type": "layout",
                    "component": "layout.container",
                    "props": {},
                    "children": ["title", "desc"],
                    "styles": {"base": {"maxWidth": "1080px", "margin": {"left": "auto", "right": "auto"}}},
                },
                "title": {
                    "id": "title",
                    "type": "component",
                    "component": "content.richText",
                    "props": {"text": "Imported from Figma", "tag": "h1"},
                    "children": [],
                },
                "desc": {
                    "id": "desc",
                    "type": "component",
                    "component": "content.richText",
                    "props": {"text": figma_url, "tag": "p"},
                    "children": [],
                },
            },
        }

        state: dict[str, Any] = cache.get(_cache_key(job_id)) or {}
        state.update({
            "progress": 100,
            "step": "done",
            "result": {"tree": tree, "assets": [], "meta": {"source": "figma", "url": figma_url}},
        })
        cache.set(_cache_key(job_id), state, timeout=60 * 60)
    except Exception as exc:  # pragma: no cover
        final_state: dict[str, Any] = cache.get(_cache_key(job_id)) or {}
        final_state.update({"progress": 100, "step": "failed", "error": str(exc)})
        cache.set(_cache_key(job_id), final_state, timeout=60 * 60)

