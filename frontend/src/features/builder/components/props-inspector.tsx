"use client";

import { useMemo } from "react";

import type { BuilderNode } from "@/types/builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PropsInspectorProps {
  node: BuilderNode | null;
  onChange: (update: Record<string, unknown>) => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

interface FieldMetadata {
  key: string;
  label: string;
  multiline?: boolean;
  helperText?: string;
}

const PROPERTY_METADATA: Record<string, FieldMetadata[]> = {
  "content.richText": [
    { key: "text", label: "Text" },
    { key: "tag", label: "HTML Tag" },
  ],
  "content.button": [
    { key: "label", label: "Label" },
    { key: "href", label: "Link" },
  ],
  "content.image": [
    { key: "url", label: "Image URL" },
    { key: "alt", label: "Alt text" },
  ],
  "content.logo": [
    { key: "text", label: "Logo Text" },
    { key: "url", label: "Logo Image URL" },
    { key: "href", label: "Link" },
  ],
  "content.navLink": [
    { key: "label", label: "Label" },
    { key: "href", label: "Link" },
  ],
  "content.stat": [
    { key: "value", label: "Value" },
    { key: "label", label: "Label" },
    { key: "description", label: "Description" },
  ],
  "forms.input": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    { key: "placeholder", label: "Placeholder" },
  ],
  "forms.textarea": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    { key: "placeholder", label: "Placeholder" },
  ],
  "forms.select": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    { key: "options", label: "Options (one per line)", multiline: true },
  ],
  "media.video": [
    { key: "source", label: "Video Source URL" },
    { key: "poster", label: "Poster Image URL" },
    { key: "title", label: "Title" },
  ],
  "media.slider": [
    { key: "autoplay", label: "Autoplay (ms)" },
  ],
};

export function PropsInspector({ node, onChange, canDelete = false, onDelete }: PropsInspectorProps) {
  const fields = useMemo(() => {
    if (!node) return [];
    return PROPERTY_METADATA[node.component] ?? [];
  }, [node]);

  if (!node) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500">Content</h3>
        {canDelete && onDelete && node.id && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
      {fields.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fields.map(({ key, label, multiline }) => (
            <div key={key} className="flex flex-col gap-1">
              <Label className="text-xs text-surface-500">{label}</Label>
              {(() => {
                const rawValue = node.props?.[key];
                const value = rawValue === undefined || rawValue === null ? "" : String(rawValue);
                if (multiline) {
                  return (
                    <Textarea
                      rows={4}
                      value={value}
                      onChange={(event) => onChange({ [key]: event.target.value })}
                    />
                  );
                }
                return (
                  <Input
                    value={value}
                    onChange={(event) => onChange({ [key]: event.target.value })}
                  />
                );
              })()}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-500">No editable properties for this component.</p>
      )}
    </section>
  );
}
