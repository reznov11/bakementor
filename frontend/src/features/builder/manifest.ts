import type { BuilderDocument, ComponentManifestEntry, BuilderNode } from "@/types/builder";

export const BUILDER_MANIFEST: ComponentManifestEntry[] = [
  {
    key: "layout.section",
    category: "layout",
    label: "Section",
    description: "Full-width section container",
    defaultProps: {
      background: { type: "solid", value: "surface-50" },
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [
          { property: "padding", type: "four-sides" },
          { property: "margin", type: "four-sides" },
        ],
      },
      {
        id: "background",
        label: "Background",
        group: "background",
        controls: [{ property: "background", type: "color" }],
      },
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "maxWidth", type: "input" },
          { property: "margin", type: "four-sides" },
        ],
      },
    ],
    allowedChildren: [
      "layout.row",
      "layout.columns-2",
      "layout.columns-3",
      "layout.columns-4",
      "layout.container",
      "layout.navbar",
      "layout.footer",
      "content.richText",
      "content.button",
      "content.image",
      "media.video",
      "media.slider",
    ],
  },
  {
    key: "layout.row",
    category: "layout",
    label: "Row",
    description: "Horizontal flex row",
    defaultProps: {
      direction: "row",
    },
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "display", type: "select", options: { flex: "Flex", grid: "Grid" } },
          { property: "flexDirection", type: "select", options: { row: "Row", column: "Column" } },
          { property: "gap", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: [
      "layout.column",
      "layout.container",
      "layout.navItem",
      "layout.navDropdown",
      "content.richText",
      "content.button",
      "content.image",
      "content.logo",
      "content.navLink",
      "content.stat",
      "forms.input",
      "forms.select",
      "forms.textarea",
      "media.video",
      "media.slider",
    ],
  },
  {
    key: "layout.column",
    category: "layout",
    label: "Column",
    description: "Vertical stack",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "display", type: "select", options: { flex: "Flex", block: "Block" } },
          { property: "gap", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: [
      "layout.container",
      "content.richText",
      "content.button",
      "content.image",
      "content.logo",
      "content.navLink",
      "content.stat",
      "forms.input",
      "forms.select",
      "forms.textarea",
      "media.video",
      "media.slider",
    ],
  },
  {
    key: "layout.container",
    category: "layout",
    label: "Container",
    description: "Centered wrapper with max width",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "width", type: "input" },
          { property: "maxWidth", type: "input" },
          { property: "margin", type: "four-sides" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [
          { property: "padding", type: "four-sides" },
        ],
      },
    ],
    allowedChildren: [
      "layout.row",
      "layout.column",
      "content.richText",
      "content.button",
      "content.image",
      "content.logo",
      "content.navLink",
      "content.stat",
      "forms.input",
      "forms.select",
      "forms.textarea",
      "media.video",
      "media.slider",
    ],
  },
  {
    key: "layout.columns-2",
    category: "layout",
    label: "2 Columns",
    description: "Even two-column layout",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "gridTemplateColumns", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: ["layout.column"],
  },
  {
    key: "layout.columns-3",
    category: "layout",
    label: "3 Columns",
    description: "Three responsive columns",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "gridTemplateColumns", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: ["layout.column"],
  },
  {
    key: "layout.columns-4",
    category: "layout",
    label: "4 Columns",
    description: "Four-column grid",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "gridTemplateColumns", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: ["layout.column"],
  },
  {
    key: "content.richText",
    category: "content",
    label: "Text",
    description: "Rich text block",
    defaultProps: {
      text: "Start writing...",
      tag: "p",
    },
    schema: {},
    styleHandles: [
      {
        id: "typography",
        label: "Typography",
        group: "typography",
        controls: [
          { property: "fontSize", type: "input" },
          { property: "fontWeight", type: "select", options: { normal: "Normal", bold: "Bold", 600: "Semi Bold" } },
          { property: "lineHeight", type: "input" },
          { property: "color", type: "color" },
          { property: "textAlign", type: "select", options: { left: "Left", center: "Center", right: "Right" } },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
    ],
  },
  {
    key: "content.button",
    category: "content",
    label: "Button",
    description: "Primary call-to-action",
    defaultProps: {
      label: "Click me",
      href: "#",
      variant: "primary",
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [{ property: "width", type: "input" }],
      },
    ],
  },
  {
    key: "content.image",
    category: "media",
    label: "Image",
    description: "Displays an image asset",
    defaultProps: {
      assetId: null,
      alt: "",
      objectFit: "cover",
    },
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "width", type: "input" },
          { property: "height", type: "input" },
          { property: "borderRadius", type: "input" },
        ],
      },
    ],
  },
  {
    key: "forms.input",
    category: "forms",
    label: "Form Input",
    description: "Collect user input",
    defaultProps: {
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      type: "email",
      required: true,
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
    ],
  },
  {
    key: "forms.textarea",
    category: "forms",
    label: "Textarea",
    description: "Multi-line text input",
    defaultProps: {
      name: "message",
      label: "Message",
      placeholder: "Tell us more...",
      rows: 4,
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
    ],
  },
  {
    key: "forms.select",
    category: "forms",
    label: "Select",
    description: "Dropdown input",
    defaultProps: {
      name: "plan",
      label: "Select option",
      options: "Option A\nOption B\nOption C",
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
    ],
  },
  {
    key: "layout.navbar",
    category: "layout",
    label: "Navbar",
    description: "Header navigation bar",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "padding", type: "four-sides" },
        ],
      },
    ],
    allowedChildren: ["content.logo", "layout.navMenu", "content.button"],
  },
  {
    key: "layout.navMenu",
    category: "layout",
    label: "Nav Menu",
    description: "Horizontal navigation list",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "justifyContent", type: "select", options: { "flex-start": "Start", center: "Center", "flex-end": "End", "space-between": "Between" } },
        ],
      },
    ],
    allowedChildren: ["layout.navItem"],
  },
  {
    key: "layout.navItem",
    category: "layout",
    label: "Nav Item",
    description: "Navigation link with optional dropdown",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
        ],
      },
    ],
    allowedChildren: ["content.navLink", "layout.navDropdown"],
  },
  {
    key: "layout.navDropdown",
    category: "layout",
    label: "Dropdown",
    description: "Stack of dropdown links",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
        ],
      },
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "padding", type: "four-sides" }],
      },
    ],
    allowedChildren: ["content.navLink"],
  },
  {
    key: "layout.footer",
    category: "layout",
    label: "Footer",
    description: "Footer container",
    defaultProps: {},
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "gap", type: "input" },
          { property: "padding", type: "four-sides" },
        ],
      },
    ],
    allowedChildren: ["layout.row", "content.richText", "content.button", "content.image", "content.logo"],
  },
  {
    key: "content.logo",
    category: "content",
    label: "Logo",
    description: "Brand logo",
    defaultProps: {
      text: "BakeMentor",
      href: "/",
      url: "",
    },
    schema: {},
    styleHandles: [
      {
        id: "spacing",
        label: "Spacing",
        group: "spacing",
        controls: [{ property: "margin", type: "four-sides" }],
      },
    ],
  },
  {
    key: "content.navLink",
    category: "content",
    label: "Nav Link",
    description: "Navigation link",
    defaultProps: {
      label: "Menu",
      href: "#",
    },
    schema: {},
    styleHandles: [
      {
        id: "typography",
        label: "Typography",
        group: "typography",
        controls: [
          { property: "fontSize", type: "input" },
          { property: "fontWeight", type: "select", options: { normal: "Normal", 500: "Medium", 600: "Semibold" } },
        ],
      },
    ],
  },
  {
    key: "content.stat",
    category: "content",
    label: "Statistic",
    description: "Metric with label",
    defaultProps: {
      value: "120%",
      label: "Growth rate",
      description: "Increase in conversions",
    },
    schema: {},
    styleHandles: [
      {
        id: "typography",
        label: "Typography",
        group: "typography",
        controls: [
          { property: "fontSize", type: "input" },
          { property: "lineHeight", type: "input" },
        ],
      },
    ],
  },
  {
    key: "media.video",
    category: "media",
    label: "Video",
    description: "Upload or embed a video",
    defaultProps: {
      source: "",
      poster: "",
      title: "Product walkthrough",
    },
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "width", type: "input" },
          { property: "height", type: "input" },
          { property: "borderRadius", type: "input" },
        ],
      },
    ],
  },
  {
    key: "media.slider",
    category: "media",
    label: "Image Slider",
    description: "Horizontal carousel of images",
    defaultProps: {
      autoplay: "5000",
    },
    schema: {},
    styleHandles: [
      {
        id: "layout",
        label: "Layout",
        group: "layout",
        controls: [
          { property: "width", type: "input" },
          { property: "height", type: "input" },
          { property: "borderRadius", type: "input" },
        ],
      },
    ],
    allowedChildren: ["content.image"],
  },
];

const initialNodes: Record<string, BuilderNode> = {
  root: {
    id: "root",
    type: "layout",
    component: "layout.section",
    props: {},
    children: [],
    styles: {
      base: {
        backgroundColor: "#ffffff",
        minHeight: "100%",
        width: "100%",
      },
    },
  },
};

export const SAMPLE_DOCUMENT: BuilderDocument = {
  tree: {
    version: "2025-10-01",
    root: "root",
    nodes: initialNodes,
  },
  manifest: BUILDER_MANIFEST,
  assets: [],
  lastSavedAt: new Date().toISOString(),
};
