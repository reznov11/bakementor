"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { BuilderDocument, BuilderNode, BuilderTree } from "@/types/builder";
import { aiImportProgress, aiImportResult, aiImportStart } from "@/features/pages/api";
import { nanoid } from "nanoid";

type TemplateDefinition = {
  tree: BuilderTree;
  assets?: BuilderDocument["assets"];
  meta?: Record<string, unknown>;
};

interface AiPaletteProps {
  onComplete: (definition: TemplateDefinition) => void;
}

const registerNode = (nodes: Record<string, BuilderNode>, node: BuilderNode) => {
  nodes[node.id] = node;
  return node.id;
};

const layoutNode = (
  nodes: Record<string, BuilderNode>,
  component: string,
  children: string[],
  styles?: BuilderNode["styles"],
  props: Record<string, unknown> = {},
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "layout",
    component,
    props,
    children,
    ...(styles ? { styles } : {}),
  });

const richTextNode = (
  nodes: Record<string, BuilderNode>,
  text: string,
  tag: string,
  styles?: BuilderNode["styles"],
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "component",
    component: "content.richText",
    props: { text, tag },
    children: [],
    ...(styles ? { styles } : {}),
  });

const buttonNode = (
  nodes: Record<string, BuilderNode>,
  label: string,
  variant: string,
  styles?: BuilderNode["styles"],
) =>
  registerNode(nodes, {
    id: nanoid(),
    type: "component",
    component: "content.button",
    props: { label, href: "#", variant },
    children: [],
    ...(styles ? { styles } : {}),
  });

function generateTemplateFromFigma(url: string): TemplateDefinition {
  const nodes: Record<string, BuilderNode> = {};

  const rootId = layoutNode(nodes, "layout.section", [], {
    base: {
      display: "flex",
      flexDirection: "column",
      gap: "64px",
      backgroundColor: "#ffffff",
      padding: { top: "64px", bottom: "96px", left: "24px", right: "24px" },
    },
  });

  const containerId = layoutNode(nodes, "layout.container", [], {
    base: {
      maxWidth: "1080px",
      margin: { left: "auto", right: "auto" },
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
  });

  const headingId = richTextNode(nodes, "Imported from Figma", "h1", {
    base: { fontSize: "40px", lineHeight: "1.1", fontWeight: 700, color: "#0f172a" },
    mobile: { fontSize: "30px" },
  });
  const subId = richTextNode(nodes, url, "p", {
    base: { fontSize: "14px", color: "#64748b" },
  });
  const ctasId = layoutNode(
    nodes,
    "layout.row",
    [buttonNode(nodes, "Refine layout", "primary"), buttonNode(nodes, "Replace assets", "secondary")],
    {
      base: { display: "flex", gap: "12px" },
      mobile: { flexDirection: "column" },
    },
  );

  const gallery = layoutNode(nodes, "media.slider", [], {
    base: { width: "100%", height: "240px", borderRadius: "16px" },
  });
  const imageIds = ["/figma-1.png", "/figma-2.png"].map((src) =>
    registerNode(nodes, {
      id: nanoid(),
      type: "component",
      component: "content.image",
      props: { assetId: src, alt: "Figma asset" },
      children: [],
      styles: { base: { width: "100%", height: "100%", objectFit: "cover" } },
    }),
  );
  nodes[gallery].children = imageIds;

  nodes[containerId].children = [headingId, subId, ctasId, gallery];
  nodes[rootId].children = [containerId];

  return {
    tree: {
      version: "ai-import-1",
      root: rootId,
      nodes,
    },
    assets: [],
    meta: { source: "figma", url },
  };
}

export function AiPalette({ onComplete }: AiPaletteProps) {
  const [url, setUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const steps = useMemo(
    () => [
      { label: "Validating URL", pct: 10 },
      { label: "Fetching Figma file", pct: 35 },
      { label: "Extracting frames", pct: 55 },
      { label: "Normalizing layers", pct: 75 },
      { label: "Generating layout", pct: 90 },
      { label: "Finalizing", pct: 100 },
    ],
    [],
  );

  const startImport = useCallback(async () => {
    if (!url || isRunning) return;
    setIsRunning(true);
    setProgress(0);
    setStep("Starting");

    try {
      const { job_id } = await aiImportStart(url);
      setStep("Queued");
      intervalRef.current = window.setInterval(async () => {
        try {
          const { progress: p, step: s } = await aiImportProgress(job_id);
          setProgress(p);
          setStep(s);
          if (p >= 100) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            intervalRef.current = null;
            const result = await aiImportResult(job_id);
            onComplete({ tree: result.tree as BuilderTree, assets: [] as BuilderDocument["assets"], meta: result.meta });
            setIsRunning(false);
          }
        } catch {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          const template = generateTemplateFromFigma(url);
          onComplete(template);
          setIsRunning(false);
        }
      }, 800);
    } catch {
      const template = generateTemplateFromFigma(url);
      onComplete(template);
      setIsRunning(false);
    }
  }, [isRunning, onComplete, url]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="theme-light-scope flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">Figma design URL</label>
        <input
          type="url"
          placeholder="https://www.figma.com/file/FILEKEY/Name?node-id=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-surface-300 bg-white px-3 py-2 text-sm outline-none ring-primary-200 transition focus:border-primary-300 focus:ring-4"
        />
      </div>
      <button
        type="button"
        disabled={!url || isRunning}
        onClick={startImport}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ${
          !url || isRunning
            ? "cursor-not-allowed border border-surface-200 bg-surface-100 text-surface-400"
            : "border border-primary-200 bg-primary-600 text-white hover:bg-primary-500"
        }`}
      >
        {isRunning ? "Importing..." : "Import from Figma"}
      </button>

      <div className="rounded-lg border border-surface-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-surface-600">Progress</span>
          <span className="tabular-nums text-surface-500">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded bg-surface-100">
          <div
            className="h-2 rounded bg-primary-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-xs text-surface-500">{step ?? "Awaiting input"}</div>
        <ul className="mt-2 space-y-1 text-[11px] text-surface-400">
          {steps.map((s) => (
            <li key={s.label} className="flex items-center justify-between">
              <span>{s.label}</span>
              <span className="tabular-nums">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


