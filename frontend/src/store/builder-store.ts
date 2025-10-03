"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { findParentId } from "@/features/builder/utils";
import { produce } from "immer";

import type {
  BuilderAction,
  BuilderDocument,
  BuilderNode,
  BuilderState,
  BreakpointId,
  StyleDeclaration,
} from "@/types/builder";

interface BuilderStore extends BuilderState {
  loadDocument: (document: BuilderDocument) => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  setBreakpoint: (breakpoint: BreakpointId) => void;
  addNode: (args: { parentId: string; component: string; type: BuilderNode["type"]; position?: number }) => void;
  updateNodeProps: (nodeId: string, update: Record<string, unknown>) => void;
  updateNodeStyles: (nodeId: string, breakpoint: BreakpointId | "base", update: Partial<StyleDeclaration>) => void;
  reorderChildren: (parentId: string, children: string[]) => void;
  moveNode: (args: { nodeId: string; targetParentId: string; targetIndex: number }) => void;
  insertBlock: (args: { parentId: string; rootId: string; nodes: Record<string, BuilderNode> }) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  markSaved: () => void;
}

const pushChange = (state: BuilderStore, action: BuilderAction) => {
  state.undoStack.push(action);
  state.redoStack = [];
  state.changes.push(action);
};

export const useBuilderStore = create<BuilderStore>((set) => ({
  document: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  activeBreakpoint: "desktop",
  changes: [],
  undoStack: [],
  redoStack: [],
  isSaving: false,

  loadDocument: (document) =>
    set({
      document,
      selectedNodeId: document.tree.root,
      activeBreakpoint: "desktop",
      undoStack: [],
      redoStack: [],
      changes: [],
    }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),
  setBreakpoint: (breakpoint) => set({ activeBreakpoint: breakpoint }),

  addNode: ({ parentId, component, type, position }) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const parent = state.document.tree.nodes[parentId];
        if (!parent) return;

        const nodeId = nanoid();
        const manifestEntry = state.document.manifest.find((entry) => entry.key === component);

        const newNode: BuilderNode = {
          id: nodeId,
          type,
          component,
          props: manifestEntry ? { ...manifestEntry.defaultProps } : {},
          children: [],
        };

        if (component === "media.slider") {
          newNode.type = "layout";
        }

        if (component === "layout.container") {
          newNode.styles = {
            base: {
              width: "100%",
              maxWidth: "1200px",
              margin: { left: "auto", right: "auto" },
              padding: { left: "24px", right: "24px" },
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            },
          };
        }
        const columnMatch = component.match(/^layout\.columns-(\d)$/);
        if (columnMatch) {
          const columnCount = Number(columnMatch[1]);
          const columnIds = Array.from({ length: columnCount }, () => nanoid());

          newNode.children = columnIds;
          newNode.styles = {
            base: {
              display: "grid",
              gap: "24px",
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            },
            mobile: {
              gridTemplateColumns: "1fr",
            },
          };

          columnIds.forEach((columnId) => {
            state.document!.tree.nodes[columnId] = {
              id: columnId,
              type: "layout",
              component: "layout.column",
              props: {},
              children: [],
              styles: {
                base: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                },
              },
            };
          });
        }

        state.document.tree.nodes[nodeId] = newNode;
        const index = position ?? parent.children.length;
        parent.children = [
          ...parent.children.slice(0, index),
          nodeId,
          ...parent.children.slice(index),
        ];
        state.selectedNodeId = nodeId;
        pushChange(state, { type: "ADD_NODE", payload: { parentId, nodeId, component, type, index } });
      }),
    ),

  updateNodeProps: (nodeId, update) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const node = state.document.tree.nodes[nodeId];
        if (!node) return;
        node.props = { ...node.props, ...update };
        pushChange(state, { type: "UPDATE_NODE_PROPS", payload: { nodeId, update } });
      }),
    ),

  updateNodeStyles: (nodeId, breakpoint, update) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const node = state.document.tree.nodes[nodeId];
        if (!node) return;
        const key = breakpoint === "desktop" ? "base" : breakpoint;
        node.styles = {
          ...node.styles,
          [key]: { ...(node.styles?.[key] ?? {}), ...update },
        };
        pushChange(state, { type: "UPDATE_NODE_STYLES", payload: { nodeId, breakpoint: key, update } });
      }),
    ),

  reorderChildren: (parentId, children) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const parent = state.document.tree.nodes[parentId];
        if (!parent) return;
        parent.children = children;
        pushChange(state, { type: "REORDER_CHILDREN", payload: { parentId, children } });
      }),
    ),

  moveNode: ({ nodeId, targetParentId, targetIndex }) =>
    set(
      produce<BuilderStore>((state) => {
        console.debug("moveNode called", { nodeId, targetParentId, targetIndex });
        if (!state.document) return;
        const doc = state.document;
        if (nodeId === doc.tree.root) return;
        const targetParent = doc.tree.nodes[targetParentId];
        console.debug("targetParent children before", targetParent?.children);
        if (!targetParent) return;

        let insertIndex = Math.max(0, Math.min(targetIndex, targetParent.children.length));
        const currentParentId = findParentId(doc, nodeId);

        if (currentParentId) {
          const currentParent = doc.tree.nodes[currentParentId];
          const currentIndex = currentParent.children.indexOf(nodeId);
          if (currentIndex !== -1) {
            currentParent.children.splice(currentIndex, 1);
            if (currentParentId == targetParentId && currentIndex < insertIndex) {
              insertIndex -= 1;
            }
          }
        }

        if (!targetParent.children.includes(nodeId)) {
          targetParent.children.splice(insertIndex, 0, nodeId);
        }
        console.debug("targetParent children after", targetParent.children);

        state.selectedNodeId = nodeId;
        pushChange(state, { type: "MOVE_NODE", payload: { nodeId, targetParentId, targetIndex: insertIndex } });
      }),
    ),

  insertBlock: ({ parentId, rootId, nodes }) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const parent = state.document.tree.nodes[parentId];
        if (!parent) return;

        Object.values(nodes).forEach((node) => {
          state.document!.tree.nodes[node.id] = node;
        });

        parent.children = [...parent.children, rootId];
        state.selectedNodeId = rootId;
        pushChange(state, { type: "ADD_BLOCK", payload: { parentId, rootId } });
      }),
    ),

  deleteNode:  (nodeId) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        if (nodeId === state.document.tree.root) return;
        const node = state.document.tree.nodes[nodeId];
        if (!node) return;
        const parentId = findParentId(state.document, nodeId);
        if (parentId) {
          const parent = state.document.tree.nodes[parentId];
          parent.children = parent.children.filter((child) => child !== nodeId);
        }
        const removeNodeRecursive = (id: string) => {
          const current = state.document!.tree.nodes[id];
          if (!current) return;
          current.children.forEach(removeNodeRecursive);
          delete state.document!.tree.nodes[id];
        };
        removeNodeRecursive(nodeId);
        state.selectedNodeId = parentId ?? state.document.tree.root;
        pushChange(state, { type: "DELETE_NODE", payload: { nodeId } });
      }),
    ),

  duplicateNode: (nodeId) =>
    set(
      produce<BuilderStore>((state) => {
        if (!state.document) return;
        const node = state.document.tree.nodes[nodeId];
        if (!node) return;

        const cloneNode = (sourceId: string): string => {
          const source = state.document!.tree.nodes[sourceId];
          const newId = nanoid();
          state.document!.tree.nodes[newId] = {
            ...source,
            id: newId,
            children: source.children.map(cloneNode),
            props: JSON.parse(JSON.stringify(source.props ?? {})),
            styles: JSON.parse(JSON.stringify(source.styles ?? {})),
          };
          return newId;
        };

        const newNodeId = cloneNode(nodeId);
        const parentId = findParentId(state.document, nodeId);
        if (parentId) {
          const parent = state.document.tree.nodes[parentId];
          const index = parent.children.indexOf(nodeId) + 1;
          parent.children = [
            ...parent.children.slice(0, index),
            newNodeId,
            ...parent.children.slice(index),
          ];
        }
        state.selectedNodeId = newNodeId;
        pushChange(state, { type: "DUPLICATE_NODE", payload: { nodeId, newNodeId } });
      }),
    ),

  markSaved: () => set({ changes: [], isSaving: false }),
}));

// Global listener for media selection from MediaLibraryModal
if (typeof window !== "undefined") {
  window.addEventListener("bakementor:mediaSelected", (e: Event) => {
    try {
      const detail = (e as CustomEvent).detail as { nodeId?: string; type?: string; file?: { file?: string; file_url?: string; title?: string } } | undefined;
      const nodeId = detail?.nodeId;
      const file = detail?.file;
      const selType = detail?.type; // e.g. 'image' or 'video'
      if (!nodeId || !file) return;
      const store = useBuilderStore.getState();

      const node = store.document?.tree.nodes[nodeId];
      const url = file.file_url || file.file || "";

      // If selecting for a video node, map to 'source' or 'poster' depending on selType
      if (node?.component === "media.video") {
        if (selType === "image") {
          store.updateNodeProps(nodeId, { poster: url, posterAlt: file.title, sourceType: "library" });
        } else {
          // default to video source
          store.updateNodeProps(nodeId, { source: url, title: file.title, sourceType: "library" });
        }
        return;
      }

      // Generic fallback for image/content types or other nodes: set url + alt
      store.updateNodeProps(nodeId, { url, alt: file.title, sourceType: "library" });
    } catch {
      // ignore
    }
  });
}
