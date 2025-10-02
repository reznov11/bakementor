export type BreakpointId = "desktop" | "tablet" | "mobile";

export const BREAKPOINTS: Record<BreakpointId, { label: string; min?: number; max?: number }> = {
  desktop: { label: "Desktop", min: 1280 },
  tablet: { label: "Tablet", min: 768, max: 1279 },
  mobile: { label: "Mobile", max: 767 },
};

export interface BreakpointValues<T> {
  base: T;
  tablet?: Partial<T>;
  mobile?: Partial<T>;
}

export type TokenReference = string;

export interface FourSideValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface ColorValue {
  type: "solid" | "gradient";
  value: TokenReference | string;
  stops?: Array<{ color: TokenReference | string; position: number }>;
}

export interface StyleDeclaration {
  display?: "flex" | "grid" | "block" | "inline" | "inline-flex";
  flexDirection?: "row" | "column";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse" | string;
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  flex?: string;
  gap?: TokenReference | string;
  rowGap?: TokenReference | string;
  columnGap?: TokenReference | string;
  gridTemplateColumns?: string;
  padding?: FourSideValue | string;
  margin?: FourSideValue | string;
  width?: TokenReference | string;
  height?: TokenReference | string;
  maxWidth?: TokenReference | string;
  minHeight?: TokenReference | string;
  textAlign?: "left" | "center" | "right";
  background?: ColorValue;
  backgroundColor?: TokenReference | string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  borderRadius?: TokenReference | string;
  borderWidth?: FourSideValue | string;
  borderColor?: TokenReference | string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | string;
  boxShadow?: TokenReference | string;
  color?: TokenReference | string;
  fontSize?: TokenReference | string;
  fontWeight?: TokenReference | number | string;
  lineHeight?: TokenReference | string;
}

export interface NodeStyles {
  base?: StyleDeclaration;
  tablet?: StyleDeclaration;
  mobile?: StyleDeclaration;
}

export type BuilderNodeType = "layout" | "component" | "slot";

export interface BuilderNode {
  id: string;
  type: BuilderNodeType;
  component: string;
  props: Record<string, unknown>;
  children: string[];
  styles?: NodeStyles;
  metadata?: Record<string, unknown>;
  bindings?: Record<string, unknown>;
}

export interface BuilderTree {
  version: string;
  root: string;
  nodes: Record<string, BuilderNode>;
}

export interface ComponentStyleHandleControl {
  property: keyof StyleDeclaration;
  type: "slider" | "select" | "color" | "four-sides" | "toggle" | "input" | "image";
  options?: Record<string, string>;
  min?: number;
  max?: number;
  step?: number;
}

export interface ComponentStyleHandle {
  id: string;
  label: string;
  group: "layout" | "spacing" | "typography" | "background" | "border" | "effects";
  controls: ComponentStyleHandleControl[];
}

export interface ComponentManifestEntry {
  key: string;
  category: string;
  label: string;
  description?: string;
  icon?: string;
  defaultProps: Record<string, unknown>;
  schema: Record<string, unknown>;
  styleHandles: ComponentStyleHandle[];
  allowedChildren?: string[];
  allowedParents?: string[];
  slots?: string[];
  thumbnail?: string | null;
}

export interface BuilderDocument {
  tree: BuilderTree;
  manifest: ComponentManifestEntry[];
  assets: Array<{ id: string; url: string; type: string; width?: number; height?: number }>;
  lastSavedAt?: string;
  meta?: Record<string, unknown>;
}

export interface BuilderAction {
  type:
    | "ADD_NODE"
    | "UPDATE_NODE"
    | "UPDATE_NODE_PROPS"
    | "UPDATE_NODE_STYLES"
    | "MOVE_NODE"
    | "DELETE_NODE"
    | "DUPLICATE_NODE"
    | "ADD_BLOCK"
    | "REORDER_CHILDREN"
    | "REPLACE_TREE";
  payload: Record<string, unknown>;
}

export interface BuilderState {
  document: BuilderDocument | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeBreakpoint: BreakpointId;
  changes: BuilderAction[];
  undoStack: BuilderAction[];
  redoStack: BuilderAction[];
  isSaving: boolean;
}
