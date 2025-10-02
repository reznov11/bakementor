"use client";

import { useMemo } from "react";

import type { BreakpointId, BuilderNode, StyleDeclaration, FourSideValue } from "@/types/builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/features/builder/components/ui/slider";

interface StyleInspectorProps {
  node: BuilderNode | null;
  activeBreakpoint: BreakpointId;
  onChange: (style: Partial<StyleDeclaration>) => void;
}

type ControlType = "select" | "input" | "slider" | "color" | "image" | "four-sides";

interface ControlConfig {
  property: keyof StyleDeclaration;
  label: string;
  type: ControlType;
  options?: Record<string, string>;
  min?: number;
  max?: number;
  step?: number;
}

const LAYOUT_CONTROLS: ControlConfig[] = [
  { property: "display", label: "Display", type: "select", options: { flex: "Flex", grid: "Grid", block: "Block" } },
  { property: "flexDirection", label: "Direction", type: "select", options: { row: "Row", column: "Column" } },
  { property: "justifyContent", label: "Justify", type: "select", options: { "flex-start": "Start", center: "Center", "flex-end": "End", "space-between": "Between" } },
  { property: "alignItems", label: "Align", type: "select", options: { "flex-start": "Start", center: "Center", "flex-end": "End", stretch: "Stretch" } },
  { property: "gap", label: "Gap", type: "slider", min: 0, max: 96, step: 4 },
  { property: "width", label: "Width", type: "input" },
  { property: "maxWidth", label: "Max width", type: "input" },
];

const SPACING_CONTROLS: ControlConfig[] = [
  { property: "padding", label: "Padding", type: "four-sides" },
  { property: "margin", label: "Margin", type: "four-sides" },
];

const TYPOGRAPHY_CONTROLS: ControlConfig[] = [
  { property: "fontSize", label: "Font size", type: "slider", min: 12, max: 72, step: 2 },
  { property: "fontWeight", label: "Weight", type: "select", options: { normal: "Normal", 500: "Medium", 600: "Semibold", bold: "Bold" } },
  { property: "lineHeight", label: "Line height", type: "slider", min: 12, max: 96, step: 2 },
  { property: "color", label: "Text color", type: "input" },
  { property: "textAlign", label: "Align", type: "select", options: { left: "Left", center: "Center", right: "Right" } },
];

const BACKGROUND_CONTROLS: ControlConfig[] = [
  { property: "backgroundColor", label: "Background color", type: "color" },
  { property: "backgroundImage", label: "Background image URL", type: "image" },
];

const BORDER_CONTROLS: ControlConfig[] = [
  { property: "borderRadius", label: "Radius", type: "input" },
  { property: "borderWidth", label: "Border width", type: "input" },
  { property: "borderStyle", label: "Border style", type: "select", options: { solid: "Solid", dashed: "Dashed", dotted: "Dotted", none: "None" } },
  { property: "borderColor", label: "Border color", type: "color" },
];

const GROUPS: Array<{ id: string; label: string; controls: ControlConfig[] }> = [
  { id: "layout", label: "Layout", controls: LAYOUT_CONTROLS },
  { id: "spacing", label: "Spacing", controls: SPACING_CONTROLS },
  { id: "border", label: "Border", controls: BORDER_CONTROLS },
  { id: "typography", label: "Typography", controls: TYPOGRAPHY_CONTROLS },
  { id: "background", label: "Background", controls: BACKGROUND_CONTROLS },
];

function getStyleValue(node: BuilderNode | null, breakpoint: BreakpointId, key: keyof StyleDeclaration): StyleDeclaration[keyof StyleDeclaration] | undefined {
  if (!node?.styles) return undefined;
  if (breakpoint === "desktop") {
    return node.styles.base?.[key];
  }
  return node.styles[breakpoint]?.[key];
}

const parseNumeric = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }
  if (value && typeof value === "object" && "top" in (value as Record<string, unknown>)) {
    const top = (value as Record<string, string | number | undefined>).top;
    return top ? parseNumeric(top) : 0;
  }
  return 0;
};

const toFourSideValue = (value: unknown): FourSideValue => {
  if (!value) {
    return { top: "0px", right: "0px", bottom: "0px", left: "0px" };
  }

  if (typeof value === "string") {
    return { top: value, right: value, bottom: value, left: value };
  }

  if (typeof value === "number") {
    const px = `${value}px`;
    return { top: px, right: px, bottom: px, left: px };
  }

  if (typeof value === "object") {
    const record = value as Record<string, string | number | undefined>;
    const format = (input: string | number | undefined) => {
      if (typeof input === "number") return `${input}px`;
      if (typeof input === "string") return input;
      return "0px";
    };
    return {
      top: format(record.top),
      right: format(record.right ?? record.left ?? record.top),
      bottom: format(record.bottom ?? record.top),
      left: format(record.left ?? record.right ?? record.top),
    };
  }

  return { top: "0px", right: "0px", bottom: "0px", left: "0px" };
};

export function StyleInspector({ node, activeBreakpoint, onChange }: StyleInspectorProps) {
  const controlsByGroup = useMemo(() => GROUPS, []);

  if (!node) {
    return (
      <aside className="flex h-full flex-col gap-4 border-l border-surface-200 bg-white p-4">
        <p className="text-sm text-surface-500">Select a component to edit its styles.</p>
      </aside>
    );
  }

  const renderControl = (config: ControlConfig) => {
    const value = getStyleValue(node, activeBreakpoint, config.property);

    switch (config.type) {
      case "select":
        return (
          <select
            className="h-9 w-full rounded-lg border border-surface-200 bg-white px-2 text-sm text-surface-700 focus:border-primary-400 focus:outline-none"
            value={(value as string) ?? ""}
            onChange={(event) => onChange({ [config.property]: event.target.value })}
          >
            <option value="">Default</option>
            {config.options &&
              Object.entries(config.options).map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>
                  {label}
                </option>
              ))}
          </select>
        );
      case "input":
        return (
          <Input
            value={(value as string) ?? ""}
            onChange={(event) => onChange({ [config.property]: event.target.value })}
            placeholder="Auto"
          />
        );
      case "slider": {
        const numericValue = parseNumeric(value);
        const min = config.min ?? 0;
        const max = config.max ?? 120;
        const step = config.step ?? 4;

        return (
          <Slider
            min={min}
            max={max}
            step={step}
            value={numericValue}
            onChange={(nextValue) => {
              if (config.property === "padding" || config.property === "margin") {
                const px = `${nextValue}px`;
                onChange({ [config.property]: { top: px, right: px, bottom: px, left: px } });
              } else {
                onChange({ [config.property]: `${nextValue}px` });
              }
            }}
          />
        );
      }
      case "four-sides": {
        const current = toFourSideValue(value);

        const handleChange = (side: keyof FourSideValue, next: string) => {
          const formatted = next.endsWith("px") || next.endsWith("%") ? next : `${next}px`;
          onChange({
            [config.property]: {
              ...current,
              [side]: formatted,
            },
          });
        };

        return (
          <div className="grid grid-cols-2 gap-2">
            {([
              ["top", "Top"],
              ["right", "Right"],
              ["bottom", "Bottom"],
              ["left", "Left"],
            ] as Array<[keyof FourSideValue, string]>).map(([side, label]) => (
              <div key={side} className="flex flex-col gap-1 text-[11px]">
                <span className="text-[10px] uppercase tracking-wide text-surface-400">{label}</span>
                <Input
                  value={current[side] ?? "0px"}
                  onChange={(event) => handleChange(side, event.target.value)}
                />
              </div>
            ))}
          </div>
        );
      }
      case "color": {
        const colorValue = typeof value === "string" && value ? value : "#ffffff";
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorValue.startsWith("#") ? colorValue : "#ffffff"}
              onChange={(event) => onChange({ [config.property]: event.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-surface-200 bg-transparent"
            />
            <Input
              value={colorValue}
              onChange={(event) => onChange({ [config.property]: event.target.value })}
            />
          </div>
        );
      }
      case "image": {
        return (
          <Input
            value={(value as string) ?? ""}
            placeholder="https://example.com/background.jpg"
            onChange={(event) => {
              const url = event.target.value.trim();
              if (!url) {
                onChange({ backgroundImage: undefined, backgroundSize: undefined });
              } else {
                onChange({ backgroundImage: `url(${url})`, backgroundSize: "cover" });
              }
            }}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <aside className="flex h-full flex-col gap-6">
      {controlsByGroup.map((group) => (
        <section key={group.id} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500">{group.label}</h3>
          <div className="flex flex-col gap-3">
            {group.controls.map((control) => (
              <div key={`${group.id}-${control.property}`} className="flex flex-col gap-1">
                <Label className="text-xs text-surface-500">{control.label}</Label>
                {renderControl(control)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}
