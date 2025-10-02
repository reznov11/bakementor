"use client";

import type { ReactNode, CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy } from "lucide-react";

import type { BuilderDocument, BuilderNode, BreakpointId } from "@/types/builder";
import { NodeRenderer } from "@/features/builder/components/node-renderer";
import { isLayoutNode } from "@/features/builder/style";
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
  canDuplicate: boolean;
  onSelect: (nodeId: string) => void;
  children?: ReactNode;
}

function CanvasNode({ node, parentId, breakpoint, selected, hoveredNodeId, onHover, onDuplicate, canDuplicate, onSelect, children }: CanvasNodeProps) {
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
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={(event) => {
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          return;
        }
        onHover(parentId);
      }}
      {...(parentId === null ? {} : { ...listeners, ...attributes })}
    >
      <div
        className={`pointer-events-none absolute -top-2 left-0 translate-y-[-100%] rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm transition ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {node.component}
      </div>
      {canDuplicate && (
        <button
          type="button"
          className={`pointer-events-auto absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-surface-200 bg-white text-surface-500 shadow-sm transition hover:bg-primary-50 hover:text-primary-600 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate(node.id);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
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
}

function CanvasTree({ node, document, parentId, breakpoint, selectedNodeId, hoveredNodeId, onHoverNode, onDuplicateNode, onSelectNode }: CanvasTreeProps) {
  const children = node.children.map((childId) => document.tree.nodes[childId]).filter(Boolean) as BuilderNode[];
  const isLayout = isLayoutNode(node);
  const canDuplicate = !isLayout && (node.component.startsWith("content.") || node.component.startsWith("forms."));

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
      canDuplicate={canDuplicate}
      onSelect={onSelectNode}
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
        />
      </div>
    </div>
  );
}
