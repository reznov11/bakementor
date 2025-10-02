"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { BuilderDocument, BuilderNode, BreakpointId } from "@/types/builder";
import { NodeRenderer } from "@/features/builder/components/node-renderer";
import { isLayoutNode } from "@/features/builder/style";

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
  onSelect: (nodeId: string) => void;
  children?: ReactNode;
}

function CanvasNode({ node, parentId, breakpoint, selected, onSelect, children }: CanvasNodeProps) {
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

  return (
    <div
      ref={setRefs}
      style={sortableStyle}
      className={`relative h-full w-full rounded-lg transition ${
        selected ? "ring-2 ring-primary-400 ring-offset-2 ring-offset-white" : "ring-0"
      } ${isOver ? "bg-primary-50/40" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      {...(parentId === null ? {} : { ...listeners, ...attributes })}
    >
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
  onSelectNode: (nodeId: string) => void;
}

function CanvasTree({ node, document, parentId, breakpoint, selectedNodeId, onSelectNode }: CanvasTreeProps) {
  const children = node.children.map((childId) => document.tree.nodes[childId]).filter(Boolean) as BuilderNode[];
  const isLayout = isLayoutNode(node);

  const renderedChildren = children.map((child) => (
    <CanvasTree
      key={child.id}
      node={child}
      document={document}
      parentId={node.id}
      breakpoint={breakpoint}
      selectedNodeId={selectedNodeId}
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
      onSelect={onSelectNode}
    >
      {content}
    </CanvasNode>
  );
}

export function BuilderCanvas({ document, breakpoint, selectedNodeId, onSelectNode }: BuilderCanvasProps) {
  const rootNode = document.tree.nodes[document.tree.root];

  return (
    <div
      className="relative flex h-full flex-1 overflow-auto bg-surface-100 p-12"
      onClick={() => onSelectNode(document.tree.root)}
    >
      <div className="relative flex min-h-full w-full flex-1 flex-col rounded-3xl border border-surface-200 bg-white p-10 shadow-subtle">
        <CanvasTree
          node={rootNode}
          document={document}
          parentId={null}
          breakpoint={breakpoint}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
}

