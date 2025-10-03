"use client";

import type { ReactNode, CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Trash2, Settings, Image as ImageIcon, Film, ChevronUp, ChevronDown } from "lucide-react";

import type { BuilderDocument, BuilderNode, BreakpointId } from "@/types/builder";
import { NodeRenderer } from "@/features/builder/components/node-renderer";
import { isLayoutNode } from "@/features/builder/style";
import { findParentId } from "@/features/builder/utils";
import { BREAKPOINT_VIEWPORTS } from "@/config/builder";
import { useBuilderStore } from "@/store/builder-store";

interface BuilderCanvasProps {
  document: BuilderDocument;
  breakpoint: BreakpointId;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

interface CanvasNodeProps {
  node: BuilderNode;
  parentId: string | null;
  breakpoint: BreakpointId;
  selected: boolean;
  hoveredNodeId: string | null;
  onHover: (nodeId: string | null) => void;
  onDuplicate: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onSettings?: (nodeId: string) => void;
  onMoveUp?: (nodeId: string) => void;
  onMoveDown?: (nodeId: string) => void;
  children?: ReactNode;
}

function CanvasNode({ node, parentId, breakpoint, selected, hoveredNodeId, onHover, onDuplicate, onSelect, onDelete, onSettings, onMoveUp, onMoveDown, children }: CanvasNodeProps) {
  const isLayout = isLayoutNode(node);
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `container-${node.id}`,
    disabled: !isLayout,
    data: {
      type: "container",
      nodeId: node.id,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: "existing-node",
      nodeId: node.id,
      parentId,
    },
    disabled: parentId === null,
  });

  const setRefs = (element: HTMLElement | null) => {
    if (isLayout) {
      setDroppableRef(element);
    }
    setSortableRef(element);
  };

  const sortableStyle =
    parentId === null
      ? undefined
      : {
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
        };

  const isHovered = hoveredNodeId === node.id;
  const ringClass = selected
    ? "ring-2 ring-primary-400 ring-offset-2 ring-offset-white"
    : isHovered
      ? "ring-2 ring-primary-200 ring-offset-2 ring-offset-white"
      : "ring-0";
  const cursorClass = isDragging ? "cursor-grabbing" : parentId === null ? "cursor-default" : "cursor-grab";

  // toolbar buttons should appear for element (non-layout) nodes
  const isElement = !isLayout && parentId !== null;
  const showDuplicateButton = isElement;
  const showDeleteButton = isElement && typeof onDelete === "function";
  const showSettingsButton = isElement && typeof onSettings === "function";
  const showMoveButtons = isLayout && parentId !== null && node.component === "layout.section";

  return (
    <div
      ref={setRefs}
      style={sortableStyle}
      className={`relative h-full w-full rounded-lg transition ${ringClass} ${cursorClass} ${
        isOver ? "bg-primary-50/40" : ""
      }`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={(event) => {
        const nextTarget = (event as unknown as { relatedTarget: EventTarget | null }).relatedTarget as Node | null;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          return;
        }
        onHover(parentId);
      }}
      {...(parentId === null ? {} : { ...listeners, ...attributes })}
    >
      {/* Drag handle for column nodes - attach listeners here to ensure dragging works when inner content captures pointer events */}
      {node.component === "layout.column" && parentId !== null && (
        <div
          {...listeners}
          {...attributes}
          onPointerDown={(e) => e.stopPropagation()}
          className={`pointer-events-auto absolute -top-3 left-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-surface-200 text-surface-400 shadow-sm transition ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          title="Drag column"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M10 6h.01M14 6h.01M10 12h.01M14 12h.01M10 18h.01M14 18h.01" />
          </svg>
        </div>
      )}
      <div
        className={`pointer-events-none absolute -top-2 left-0 translate-y-[-100%] rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm transition ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {node.component}
      </div>
  {showDuplicateButton && (
        <button
          type="button"
          title="Duplicate component"
          className={`pointer-events-auto absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
            selected || isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate(node.id);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
        {showMoveButtons && (
          <div className="pointer-events-auto absolute top-2 left-2 flex items-center gap-2">
            <button
              type="button"
              title="Move section up"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
                selected || isHovered ? "opacity-100" : "opacity-0"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onMoveUp?.(node.id);
              }}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Move section down"
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
                selected || isHovered ? "opacity-100" : "opacity-0"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onMoveDown?.(node.id);
              }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
  {showDeleteButton && (
        <button
          type="button"
          title="Delete component"
          className={`pointer-events-auto absolute top-2 right-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 ${
            selected || isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            try {
              const ok = window.confirm("Delete this component and its children? This action cannot be undone.");
              if (ok) {
                onDelete?.(node.id);
              }
            } catch {
              // If window.confirm is not available, fall back to delete
              onDelete?.(node.id);
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
  {showSettingsButton && (
        <button
          type="button"
          title="Open settings"
          className={`pointer-events-auto absolute top-2 right-18 inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
            selected || isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onSettings(node.id);
          }}
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      )}
    {/* Media library quick access for media nodes */}
      {(
        node.component?.startsWith("media.") || node.component === "content.image" || node.component === "content.file"
      ) && (
          <button
            type="button"
            title="Open media library"
            className={`pointer-events-auto absolute top-2 right-26 inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
              selected || isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              const type = node.component === "media.video" ? "video" : "image";
              window.dispatchEvent(new CustomEvent("bakementor:openMediaLibrary", { detail: { nodeId: node.id, type } }));
            }}
          >
            {node.component === "media.video" ? <Film className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
          </button>
        )}
      <NodeRenderer node={node} breakpoint={breakpoint}>
        {children}
      </NodeRenderer>
    </div>
  );
}

interface CanvasTreeProps {
  node: BuilderNode;
  document: BuilderDocument;
  parentId: string | null;
  breakpoint: BreakpointId;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onHoverNode: (nodeId: string | null) => void;
  onDuplicateNode: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onSettingsNode?: (nodeId: string) => void;
  onMoveUp?: (nodeId: string) => void;
  onMoveDown?: (nodeId: string) => void;
}

function CanvasTree({ node, document, parentId, breakpoint, selectedNodeId, hoveredNodeId, onHoverNode, onDuplicateNode, onSelectNode, onDeleteNode, onSettingsNode, onMoveUp, onMoveDown }: CanvasTreeProps) {
  const children = node.children.map((childId) => document.tree.nodes[childId]).filter(Boolean) as BuilderNode[];
  const isLayout = isLayoutNode(node);
  // allow duplicate/delete/settings for all non-layout component nodes (computed in CanvasNode)

  const renderedChildren = children.map((child) => (
    <CanvasTree
      key={child.id}
      node={child}
      document={document}
      parentId={node.id}
      breakpoint={breakpoint}
      selectedNodeId={selectedNodeId}
      hoveredNodeId={hoveredNodeId}
      onHoverNode={onHoverNode}
      onDuplicateNode={onDuplicateNode}
      onSelectNode={onSelectNode}
      onDeleteNode={onDeleteNode}
      onSettingsNode={onSettingsNode}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    />
  ));

  const content = isLayout ? (
    <SortableContext items={children.map((child) => child.id)} strategy={rectSortingStrategy}>
      {renderedChildren}
      {children.length === 0 && (
        <div className="flex min-h-[160px] w-full items-center justify-center rounded-xl border border-dashed border-surface-300 bg-surface-100 text-xs font-medium uppercase tracking-wide text-surface-400">
          Drop components here
        </div>
      )}
    </SortableContext>
  ) : (
    renderedChildren
  );

  return (
    <CanvasNode
      node={node}
      parentId={parentId}
      breakpoint={breakpoint}
      selected={node.id === selectedNodeId}
      hoveredNodeId={hoveredNodeId}
      onHover={onHoverNode}
  onDuplicate={onDuplicateNode}
      onSelect={onSelectNode}
      onDelete={onDeleteNode}
      onSettings={onSettingsNode}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      {content}
    </CanvasNode>
  );
}

export function BuilderCanvas({ document, breakpoint, selectedNodeId, onSelectNode }: BuilderCanvasProps) {
  const rootNode = document.tree.nodes[document.tree.root];
  const viewport = BREAKPOINT_VIEWPORTS[breakpoint];
  const hoveredNodeId = useBuilderStore((state) => state.hoveredNodeId);
  const setHoveredNode = useBuilderStore((state) => state.setHoveredNode);
  const duplicateNode = useBuilderStore((state) => state.duplicateNode);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const reorderChildren = useBuilderStore((state) => state.reorderChildren);

  const handleMoveUp = (nodeId: string) => {
    const parentId = findParentId(document, nodeId);
    if (!parentId) return;
    const parent = document.tree.nodes[parentId];
    const index = parent.children.indexOf(nodeId);
    if (index <= 0) return;
    // If moving within the same parent, perform a reorder for simplicity
    const currentParentId = findParentId(document, nodeId);
    if (currentParentId === parentId) {
      const newChildren = parent.children.slice();
      newChildren.splice(index, 1);
      newChildren.splice(index - 1, 0, nodeId);
      console.debug("handleMoveUp - reorderChildren", { nodeId, parentId, index, newChildren });
      reorderChildren(parentId, newChildren);
      return;
    }

    const targetIndex = index - 1;
    console.debug("handleMoveUp", { nodeId, parentId, index, targetIndex, parentChildrenBefore: parent.children });
    moveNode({ nodeId, targetParentId: parentId, targetIndex });
  };

  const handleMoveDown = (nodeId: string) => {
    const parentId = findParentId(document, nodeId);
    if (!parentId) return;
    const parent = document.tree.nodes[parentId];
    const index = parent.children.indexOf(nodeId);
    if (index === -1 || index >= parent.children.length - 1) return;
    // moveNode expects a targetIndex in the parent's children array BEFORE removal.
    // When moving down within the same parent we pass index + 2 so that after
    // removal and internal adjustment the node ends up one position lower.
    // If moving within the same parent, reorder children directly
    const currentParentId = findParentId(document, nodeId);
    if (currentParentId === parentId) {
      const newChildren = parent.children.slice();
      newChildren.splice(index, 1);
      newChildren.splice(index + 1, 0, nodeId);
      console.debug("handleMoveDown - reorderChildren", { nodeId, parentId, index, newChildren });
      reorderChildren(parentId, newChildren);
      return;
    }

    const targetIndex = index + 2;
    console.debug("handleMoveDown", { nodeId, parentId, index, targetIndex, parentChildrenBefore: parent.children });
    moveNode({ nodeId, targetParentId: parentId, targetIndex });
  };

  const canvasStyle: CSSProperties = {};
  if (viewport?.width) {
    if (breakpoint === "desktop") {
      canvasStyle.width = "100%";
      canvasStyle.maxWidth = `${viewport.width}px`;
    } else {
      canvasStyle.width = `${viewport.width}px`;
    }
  } else {
    canvasStyle.width = "100%";
  }

  if (viewport?.height) {
    canvasStyle.minHeight = `${viewport.height}px`;
  }

  return (
    <div
      className="relative flex h-full flex-1 justify-center overflow-auto bg-white"
      onClick={() => onSelectNode(document.tree.root)}
    >
      <div
        style={canvasStyle}
        className="theme-light-scope relative flex min-h-full w-full flex-col p-10"
      >
        <CanvasTree
          node={rootNode}
          document={document}
          parentId={null}
          breakpoint={breakpoint}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onHoverNode={setHoveredNode}
          onDuplicateNode={duplicateNode}
          onSelectNode={onSelectNode}
          onDeleteNode={deleteNode}
          onSettingsNode={onSelectNode}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>
    </div>
  );
}
