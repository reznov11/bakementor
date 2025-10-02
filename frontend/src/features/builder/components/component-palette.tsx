"use client";

import { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";

import type { ComponentManifestEntry } from "@/types/builder";

interface ComponentPaletteProps {
  manifest: ComponentManifestEntry[];
}

const CATEGORY_LABELS: Record<string, string> = {
  layout: "Layout",
  content: "Content",
  media: "Media",
  forms: "Forms",
};

function PaletteItem({ entry }: { entry: ComponentManifestEntry }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${entry.key}`,
    data: {
      type: "palette",
      component: entry,
    },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={`flex flex-col gap-1 rounded-lg border border-surface-200 bg-surface-50 p-3 text-left shadow-sm transition hover:border-primary-200 hover:bg-white ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="text-sm font-medium text-surface-800">{entry.label}</span>
      {entry.description && (
        <span className="text-xs text-surface-500 line-clamp-2">{entry.description}</span>
      )}
    </button>
  );
}

export function ComponentPalette({ manifest }: ComponentPaletteProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, ComponentManifestEntry[]>();
    manifest.forEach((entry) => {
      const category = entry.category ?? "other";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(entry);
    });
    return Array.from(groups.entries());
  }, [manifest]);

  return (
    <aside className="flex h-full min-w-[240px] flex-col gap-4 overflow-y-auto border-r border-surface-200 bg-white p-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-surface-800">Components</h2>
        <p className="text-xs text-surface-500">Drag components into the canvas</p>
      </header>
      <div className="flex flex-col gap-4">
        {grouped.map(([category, entries]) => (
          <section key={category} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500">
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="grid gap-2">
              {entries.map((entry) => (
                <PaletteItem key={entry.key} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

