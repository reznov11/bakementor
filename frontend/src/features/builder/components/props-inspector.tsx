"use client";

import { useMemo } from "react";
import t from "@/i18n";

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
  type?: "text" | "textarea" | "select";
  options?: Array<{ value: string; label: string; }>;
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
    { key: "height", label: "Height", helperText: "Accepts any CSS length value (e.g. 320px, 50vh, auto)" },
    {
      key: "objectFit",
      label: "Object fit",
      type: "select",
      options: [
        { value: "cover", label: "Cover" },
        { value: "contain", label: "Contain" },
        { value: "fill", label: "Fill" },
        { value: "none", label: "None" },
        { value: "scale-down", label: "Scale down" },
      ],
    },
    {
      key: "objectPosition",
      label: "Object position",
      type: "select",
      options: [
        { value: "center", label: "Center" },
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
        { value: "top left", label: "Top left" },
        { value: "top right", label: "Top right" },
        { value: "bottom left", label: "Bottom left" },
        { value: "bottom right", label: "Bottom right" },
      ],
    },
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
  "content.link": [
    { key: "label", label: "Label" },
    { key: "href", label: "Link" },
    {
      key: "target",
      label: "Open link in",
      type: "select",
      options: [
        { value: "_self", label: "Same tab" },
        { value: "_blank", label: "New tab" },
        { value: "_parent", label: "Parent frame" },
      ],
    },
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
  "forms.checkbox": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    {
      key: "defaultChecked",
      label: "Checked by default",
      type: "select",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ],
  "forms.radio": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
    {
      key: "defaultChecked",
      label: "Selected by default",
      type: "select",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ],
  "forms.datetime": [
    { key: "label", label: "Label" },
    { key: "name", label: "Name" },
    { key: "defaultValue", label: "Default value", helperText: "Use ISO format e.g. 2025-01-01T09:00" },
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

  const parseValue = (field: FieldMetadata, raw: string): unknown => {
    if (field.type === "select" && field.options?.some((option) => option.value === "true" || option.value === "false")) {
      if (raw === "") {
        return undefined;
      }
      return raw === "true";
    }
    return raw;
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500">{t("inspector.content")}</h3>
            {canDelete && onDelete && node.id && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                {t("inspector.delete")}
              </Button>
            )}
          </div>
      {fields.length > 0 ? (
        <div className="flex flex-col gap-3">
          {fields.map(({ key, label, multiline, helperText, type, options }) => (
            <div key={key} className="flex flex-col gap-1">
              <Label className="text-xs text-surface-500">{label}</Label>
              {(() => {
                const rawValue = node.props?.[key];
                const value = rawValue === undefined || rawValue === null ? "" : String(rawValue);
                const fieldType: FieldMetadata["type"] = type ?? (multiline ? "textarea" : "text");

                if (fieldType === "select" && options) {
                  return (
                    <select
                      className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-sm text-surface-700 focus:border-primary-400 focus:outline-none"
                      value={value}
                      onChange={(event) => {
                        const nextValue = parseValue({ key, label, multiline, helperText, type, options }, event.target.value);
                        onChange({ [key]: nextValue });
                      }}
                    >
                      <option value="">Default</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  );
                }

                if (fieldType === "textarea") {
                  return (
                    <Textarea
                      rows={4}
                      value={value}
                      onChange={(event) => onChange({ [key]: event.target.value })}
                    />
                  );
                }

                // If this is the image URL field for the content.image component, show a Media library button next to the input
                if (key === "url" && node.component === "content.image") {
                  return (
                    <div className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        value={value}
                        onChange={(event) => onChange({ [key]: event.target.value })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (typeof window === "undefined") return;
                          const detail = { nodeId: node.id, type: "image" };
                          window.dispatchEvent(new CustomEvent("bakementor:openMediaLibrary", { detail }));
                        }}
                      >
                        Media library
                      </Button>
                    </div>
                  );
                }

                // For video fields (source/poster) show Media library button to pick video or poster image
                if ((key === "source" || key === "poster") && node.component === "media.video") {
                  const pickType = key === "source" ? "video" : "image";
                  return (
                    <div className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        value={value}
                        onChange={(event) => onChange({ [key]: event.target.value })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (typeof window === "undefined") return;
                          const detail = { nodeId: node.id, type: pickType };
                          window.dispatchEvent(new CustomEvent("bakementor:openMediaLibrary", { detail }));
                        }}
                      >
                        Media library
                      </Button>
                    </div>
                  );
                }

                return (
                  <Input
                    value={value}
                    onChange={(event) => onChange({ [key]: event.target.value })}
                  />
                );
              })()}
              {helperText ? <p className="text-[10px] text-surface-400">{helperText}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-surface-500">{t("inspector.noEditable")}</p>
      )}
    </section>
  );
}
