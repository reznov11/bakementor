"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";

import type { BreakpointId, BuilderDocument, BuilderNode } from "@/types/builder";
import { NodeRenderer } from "@/features/builder/components/node-renderer";
import { isLayoutNode } from "@/features/builder/style";
import { createDocumentFromTree } from "@/features/builder/utils";

const PREVIEW_STORAGE_KEY_PREFIX = "bakementor:preview:";

interface PreviewTreeProps {
  node: BuilderNode;
  document: BuilderDocument;
  breakpoint: BreakpointId;
}

function PreviewTree({ node, document, breakpoint }: PreviewTreeProps) {
  const children = node.children.map((childId) => document.tree.nodes[childId]).filter(Boolean) as BuilderNode[];
  const isLayout = isLayoutNode(node);

  return (
    <NodeRenderer node={node} breakpoint={breakpoint} readOnly>
      {isLayout &&
        children.map((child) => (
          <PreviewTree key={child.id} node={child} document={document} breakpoint={breakpoint} />
        ))}
    </NodeRenderer>
  );
}

export default function PreviewPage() {
  const params = useParams<{ pageId: string }>();
  const pageId = params?.pageId;
  if (!pageId) {
    notFound();
  }

  const searchParams = useSearchParams();
  const initialBreakpoint = (searchParams.get("breakpoint") as BreakpointId) ?? "desktop";
  const [document, setDocument] = useState<BuilderDocument | null>(null);
  const [breakpoint, setBreakpoint] = useState<BreakpointId>(initialBreakpoint);

  useEffect(() => {
    const key = `${PREVIEW_STORAGE_KEY_PREFIX}${pageId}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as BuilderDocument | {
        tree?: unknown;
        meta?: Record<string, unknown>;
        assets?: BuilderDocument["assets"];
      };
      if (parsed && typeof parsed === "object" && "tree" in parsed) {
        const snapshot = parsed as {
          tree?: unknown;
          meta?: Record<string, unknown>;
          assets?: BuilderDocument["assets"];
        };
        const rebuilt = createDocumentFromTree(snapshot.tree, snapshot.meta, snapshot.assets);
        setDocument(rebuilt);
      } else {
        setDocument(parsed as BuilderDocument);
      }
    } catch (error) {
      console.error("Failed to load preview", error);
    }
  }, [pageId]);

  useEffect(() => {
    const nextBreakpoint = (searchParams.get("breakpoint") as BreakpointId) ?? "desktop";
    setBreakpoint(nextBreakpoint);
  }, [searchParams]);

  const rootNode = useMemo(() => {
    if (!document) return null;
    const rootId = document.tree.root;
    return document.tree.nodes[rootId] ?? null;
  }, [document]);

  if (!document || !rootNode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-100">
        <div className="text-sm text-surface-500">Nothing to preview yet. Return to the builder and click Preview.</div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-surface-100 p-6">
      <header className="flex w-full max-w-5xl items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-surface-900">Preview</h1>
          <p className="text-xs text-surface-500">Page ID: {pageId}</p>
        </div>
        <div className="flex items-center gap-2">
          {(["desktop", "tablet", "mobile"] as BreakpointId[]).map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setBreakpoint(bp)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                breakpoint === bp ? "bg-primary-600 text-white" : "bg-white text-surface-600 hover:bg-primary-50"
              }`}
            >
              {bp}
            </button>
          ))}
        </div>
      </header>
      <main className="flex w-full flex-1 justify-center overflow-auto">
        <div
          className="relative flex w-full max-w-full flex-col gap-4 overflow-hidden rounded-3xl border border-surface-200 bg-white p-8 shadow-subtle"
          style={{
            width: "100%",
            maxWidth: breakpoint === "desktop" ? "100%" : breakpoint === "tablet" ? "900px" : "420px",
          }}
        >
          <PreviewTree node={rootNode} document={document} breakpoint={breakpoint} />
        </div>
      </main>
    </div>
  );
}
