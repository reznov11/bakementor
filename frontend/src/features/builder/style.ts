import type { BuilderDocument, BuilderNode, BreakpointId, StyleDeclaration } from "@/types/builder";

const styleKeys: Array<keyof StyleDeclaration> = [
  "display",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "flex",
  "gap",
  "rowGap",
  "columnGap",
  "gridTemplateColumns",
  "padding",
  "margin",
  "width",
  "height",
  "maxWidth",
  "minHeight",
  "textAlign",
  "background",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "borderRadius",
  "borderWidth",
  "borderColor",
  "borderStyle",
  "boxShadow",
  "color",
  "fontSize",
  "fontWeight",
  "lineHeight",
];

function resolveBackground(value: StyleDeclaration["background"]): string | undefined {
  if (!value) return undefined;
  if (value.type === "solid") {
    return typeof value.value === "string" ? (value.value as string) : undefined;
  }
  if (value.type === "gradient" && value.stops) {
    const stops = value.stops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    return `linear-gradient(90deg, ${stops})`;
  }
  return undefined;
}

function normalizeFourSide(value: StyleDeclaration["padding"] | StyleDeclaration["margin"]): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const { top = "0", right = top, bottom = top, left = right } = value;
  return `${top} ${right} ${bottom} ${left}`;
}

export const computeNodeStyle = (
  node: BuilderNode,
  breakpoint: BreakpointId,
): React.CSSProperties => {
  const base = node.styles?.base ?? {};
  const overrides = breakpoint === "desktop" ? {} : node.styles?.[breakpoint] ?? {};
  const merged: StyleDeclaration = { ...base, ...overrides };

  const style: React.CSSProperties = {};

  styleKeys.forEach((key) => {
    const value = merged[key];
    if (value === undefined || value === null) return;

    switch (key) {
      case "padding":
      case "margin":
        style[key] = normalizeFourSide(value as StyleDeclaration["padding"]);
        break;
      case "borderWidth":
        style.borderWidth = normalizeFourSide(value as StyleDeclaration["borderWidth"]);
        break;
      case "background": {
        const resolved = resolveBackground(value as StyleDeclaration["background"]);
        if (resolved) {
          style.background = resolved;
        }
        break;
      }
      case "backgroundColor":
        style.backgroundColor = value as React.CSSProperties["backgroundColor"];
        break;
      case "backgroundImage":
        style.backgroundImage = typeof value === "string" ? value : undefined;
        break;
      case "backgroundSize":
        style.backgroundSize = value as React.CSSProperties["backgroundSize"];
        break;
      case "backgroundPosition":
        style.backgroundPosition = value as React.CSSProperties["backgroundPosition"];
        break;
      case "backgroundRepeat":
        style.backgroundRepeat = value as React.CSSProperties["backgroundRepeat"];
        break;
      case "borderRadius":
        style.borderRadius = value as React.CSSProperties["borderRadius"];
        break;
      case "borderColor":
        style.borderColor = value as React.CSSProperties["borderColor"];
        break;
      case "borderStyle":
        style.borderStyle = value as React.CSSProperties["borderStyle"];
        break;
      case "fontWeight":
        style.fontWeight = value as React.CSSProperties["fontWeight"];
        break;
      default:
        style[key] = value as never;
    }
  });

  return style;
};

export const getChildNodes = (
  document: BuilderDocument,
  parent: BuilderNode,
): BuilderNode[] => parent.children.map((childId) => document.tree.nodes[childId]).filter(Boolean) as BuilderNode[];

export const isLeafNode = (node: BuilderNode) => node.children.length === 0;

export const isLayoutNode = (node: BuilderNode) => node.type === "layout";
