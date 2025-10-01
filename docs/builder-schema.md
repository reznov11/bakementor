# Builder Schema & State Design

This document captures the shared data model that powers the drag-and-drop page constructor, responsive breakpoints, and style editing capabilities. Frontend (Next.js) and backend (Django) both rely on the same JSON structure that is stored inside `PageVersion.component_tree`.

## Core Concepts

| Concept | Description |
| --- | --- |
| **Component Manifest** | Registry of available component types (text, button, image, grid, form, etc.) with metadata, default props, style handles, constraints. Backed by `ComponentDefinition` records and mirrored in frontend via a generated manifest. |
| **Node** | Any element placed in the canvas. Nodes can be primitives (text, image, button, form input) or structural containers (sections, rows, columns). |
| **Layout Tree** | Hierarchical tree describing how nodes are composed. Structural nodes manage layout (flex/grid/stack) and hold child node IDs. |
| **Style Tokens** | Normalized representation of design tokens (spacing, colors, typography). Style overrides can be applied per breakpoint and merged at runtime. |
| **Breakpoint Overrides** | Differences between desktop/tablet/mobile. Stored as dictionaries that override base props/styles. |
| **Actions** | Builder operations are modeled as Redux-like actions (add node, move node, update props, update style, delete node, duplicate subtree). |

## JSON Structure

```jsonc
{
  "version": "2025-10-01",
  "root": "root-node",
  "nodes": {
    "root-node": {
      "id": "root-node",
      "type": "section",
      "component": "layout.section",
      "props": {
        "background": { "type": "solid", "value": "surface-50" }
      },
      "children": ["hero-1", "feature-grid"],
      "styles": {
        "base": {
          "padding": { "top": "64px", "bottom": "64px", "left": "32px", "right": "32px" },
          "maxWidth": "1200px",
          "margin": { "left": "auto", "right": "auto" }
        },
        "tablet": {
          "padding": { "left": "24px", "right": "24px" }
        },
        "mobile": {
          "padding": { "left": "16px", "right": "16px" }
        }
      }
    },
    "hero-1": {
      "id": "hero-1",
      "type": "component",
      "component": "content.hero",
      "props": {
        "heading": "Launch your next product",
        "body": "All-in-one builder powered by BakeMentor",
        "primaryCta": {
          "label": "Request access",
          "href": "/contact"
        },
        "media": {
          "type": "image",
          "assetId": "media-123"
        }
      },
      "children": [],
      "styles": {
        "base": {
          "textAlign": "left",
          "gap": "32px"
        },
        "mobile": {
          "textAlign": "center"
        }
      }
    },
    "feature-grid": {
      "id": "feature-grid",
      "type": "layout",
      "component": "layout.grid",
      "props": {
        "columns": {
          "base": 3,
          "tablet": 2,
          "mobile": 1
        },
        "gap": "24px"
      },
      "children": ["feature-card-1", "feature-card-2", "feature-card-3"],
      "styles": {
        "base": {
          "marginTop": "48px"
        }
      }
    }
  }
}
```

### Node Fields

- `id`: Unique UUID or ULID.
- `type`: `layout`, `component`, or `slot`.
- `component`: Key referencing the manifest entry.
- `props`: Serializable props matching the manifest schema.
- `children`: Array of node IDs (empty for leaf nodes).
- `styles`: Dictionary with keys `base`, `tablet`, `mobile`; each holds token/value pairs.
- `metadata`: Optional info (author, experiment variants, notes) for future features.
- `bindings`: Event/action bindings (e.g., button submits form, triggers webhook) — placeholder for future enhancements.

### Style Representation

Styles are token-aware objects:

```ts
interface StyleDeclaration {
  display?: "flex" | "grid" | "block" | "inline";
  flexDirection?: "row" | "column";
  gap?: TokenReference;            // e.g., "spacing.400"
  padding?: FourSideValue;
  margin?: FourSideValue | { left: "auto"; right: "auto" };
  width?: TokenReference | "auto" | string;
  height?: TokenReference | "auto" | string;
  textAlign?: "left" | "center" | "right";
  background?: ColorValue;
  borderRadius?: TokenReference | string;
  boxShadow?: TokenReference | string;
}
```

A `TokenReference` is a string pointing to design tokens (e.g., `spacing.400`, `color.primary.500`). Raw values are allowed for power users.

### Breakpoints

Breakpoints are defined globally in both frontend and backend:

```json
{
  "desktop": { "min": 1280 },
  "tablet": { "min": 768, "max": 1279 },
  "mobile": { "max": 767 }
}
```

Styles and prop overrides follow the same structure. When rendering, the frontend merges `base` + breakpoint-specific overrides. Builder UI lets users toggle between views and edit each scope.

## Component Manifest

Each manifest entry includes:

```ts
interface ComponentDefinition {
  key: string;                 // e.g., "content.hero"
  category: "content" | "media" | "forms" | "layout" | ...;
  label: string;
  thumbnail: string | null;
  schema: JSONSchema;
  slots?: string[];            // Named slots (e.g., form fields area)
  allowedParents?: string[];   // Restrict placement
  defaultProps: Record<string, unknown>;
  styleHandles: StyleHandle[]; // e.g., "spacing", "alignment", "background"
}
```

`JSONSchema` specifies the shape of `props`. Frontend form builders auto-generate controls; backend validates incoming trees upon save/publish.

## Builder State

In the frontend we keep two layers of state:

- **Document State**: Selected node ID, expanded nodes, current breakpoint, undo/redo history.
- **Tree Draft**: Mutable version of the component tree. Autosaved every N seconds and on explicit save. Patches diffed against server state.

We’ll use Zustand or Jotai for local state + React Query for persistence.

## API Operations

1. `GET /pages/{id}/builder/` ? returns `PageVersion` including manifest snapshot + tree + asset usage list.
2. `POST /pages/{id}/builder/updates/` ? accepts patch actions (`AddNode`, `MoveNode`, `UpdateProps`, `UpdateStyles`, `DeleteNode`). Backend applies patches atomically.
3. `POST /pages/{id}/builder/publish/` ? triggers publish job (already defined) after tree validation.
4. `GET /assets/` / `POST /assets/` ? existing media endpoints reused for asset picker.

## Next Steps

1. Finalise manifest synchronization (backend ? frontend JSON build artifact).
2. Implement layout engine utilities (calculate slot positions, apply style tokens to CSS).
3. Build drag-and-drop canvas with placeholder components and responsive preview toggles.
4. Integrate media picker and style inspector panels.
