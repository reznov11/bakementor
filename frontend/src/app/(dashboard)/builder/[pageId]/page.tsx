"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { ArrowLeft } from "lucide-react";

import { BuilderToolbar } from "@/features/builder/components/builder-toolbar";
import { ComponentPalette } from "@/features/builder/components/component-palette";
import { BlockPalette } from "@/features/builder/components/block-palette";
import { TemplatePalette } from "@/features/builder/components/template-palette";
import { AiPalette } from "@/features/builder/components/ai-palette";
import { BuilderCanvas } from "@/features/builder/components/builder-canvas";
import { StyleInspector } from "@/features/builder/components/style-inspector";
import { PropsInspector } from "@/features/builder/components/props-inspector";
import { BLOCK_TEMPLATES } from "@/features/builder/blocks";
import { PAGE_TEMPLATES } from "@/features/builder/templates.extra";
import type { BuilderNode, ComponentManifestEntry, StyleDeclaration, BuilderDocument } from "@/types/builder";
import { useBuilderStore } from "@/store/builder-store";
import { createDocumentFromTree, findNode, findParentId, serializeDocumentTree } from "@/features/builder/utils";
import { useCreatePageVersion, usePage, usePublishPage } from "@/features/pages/hooks";
import type { PageVersionPayload } from "@/types/pages";
import { Button } from "@/components/ui/button";

const PREVIEW_STORAGE_KEY_PREFIX = "bakementor:preview:";

const KEYBOARD_SHORTCUTS: Array<{ combo: string; description: string }> = [
  { combo: "Ctrl + /", description: "Open shortcuts" },
  { combo: "Ctrl + S", description: "Save draft" },
  { combo: "Ctrl + P", description: "Publish page" },
  { combo: "Ctrl + R", description: "Preview current page" },
  { combo: "Ctrl + B", description: "Open block library" },
  { combo: "Ctrl + E", description: "Open element library" },
];

export default function BuilderPage() {
  const params = useParams<{ pageId: string }>();
  const pageId = params?.pageId;
  if (!pageId) {
    notFound();
  }

  const router = useRouter();

  const document = useBuilderStore((state) => state.document);
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const activeBreakpoint = useBuilderStore((state) => state.activeBreakpoint);
  const loadDocument = useBuilderStore((state) => state.loadDocument);
  const selectNode = useBuilderStore((state) => state.selectNode);
  const setBreakpoint = useBuilderStore((state) => state.setBreakpoint);
  const updateNodeStyles = useBuilderStore((state) => state.updateNodeStyles);
  const updateNodeProps = useBuilderStore((state) => state.updateNodeProps);
  const addNode = useBuilderStore((state) => state.addNode);
  const moveNode = useBuilderStore((state) => state.moveNode);
  const insertBlock = useBuilderStore((state) => state.insertBlock);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const markSaved = useBuilderStore((state) => state.markSaved);

  const { data: page, isLoading: isPageLoading, isError: isPageError, error: pageError } = usePage(pageId);
  const createPageVersion = useCreatePageVersion(pageId);
  const publishPageMutation = usePublishPage(pageId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const [activeComponent, setActiveComponent] = useState<ComponentManifestEntry | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [paletteTab, setPaletteTab] = useState<"elements" | "blocks" | "templates" | "ai">("elements");
  const [publishFlowActive, setPublishFlowActive] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConfigPanelVisible, setIsConfigPanelVisible] = useState(false);
  const [lastDismissedNodeId, setLastDismissedNodeId] = useState<string | null>(null);

  const openShortcuts = useCallback(() => setIsShortcutsOpen(true), []);
  const closeShortcuts = useCallback(() => setIsShortcutsOpen(false), []);

  const handleSelectBlock = (blockId: string) => {
    if (!document) return;
    const template = BLOCK_TEMPLATES.find((block) => block.id === blockId);
    if (!template) return;

    const { rootId, nodes } = template.create();
    insertBlock({ parentId: document.tree.root, rootId, nodes });
    showToast(template.name + " added");
  };

  const handleAiComplete = (definition: { tree: unknown; assets?: unknown; meta?: Record<string, unknown> }) => {
    const newDocument = createDocumentFromTree(definition.tree, { ...(document?.meta ?? {}), ...(definition.meta ?? {}) }, definition.assets as BuilderDocument["assets"] | undefined);
    loadDocument(newDocument);
    showToast("AI template applied");
  };

  const handleSelectTemplate = (templateId: string) => {
    const selected = PAGE_TEMPLATES.find((t) => t.id === templateId);
    if (!selected) return;
    const { tree, assets, meta } = selected.create();
    const newDocument = createDocumentFromTree(tree, { ...(document?.meta ?? {}), ...(meta ?? {}), templateId }, assets);
    loadDocument(newDocument);
    showToast(selected.name + " applied");
  };

  useEffect(() => {
    if (!page) return;
    const loadedForSamePage = document?.meta?.pageId === page.id;
    if (loadedForSamePage) return;

    const builderDocument = createDocumentFromTree(page.current_version?.component_tree, {
      pageId: page.id,
      pageTitle: page.title,
    });
    loadDocument(builderDocument);
  }, [page, document, loadDocument]);

  const selectedNode = useMemo(() => findNode(document, selectedNodeId), [document, selectedNodeId]);
  const selectedNodeDefinition = useMemo(() => {
    if (!document || !selectedNode) return null;
    return document.manifest.find((entry) => entry.key === selectedNode.component) ?? null;
  }, [document, selectedNode]);
  const rootNodeId = document?.tree.root ?? null;

  useEffect(() => {
    if (!rootNodeId) {
      setIsConfigPanelVisible(false);
      setLastDismissedNodeId(null);
      return;
    }

    if (!selectedNodeId) {
      setIsConfigPanelVisible(false);
      setLastDismissedNodeId(null);
      return;
    }

    if (selectedNodeId === rootNodeId) {
      setIsConfigPanelVisible(false);
      return;
    }

    if (!isConfigPanelVisible && lastDismissedNodeId === selectedNodeId) {
      return;
    }

    setIsConfigPanelVisible(true);
    if (lastDismissedNodeId) {
      setLastDismissedNodeId(null);
    }
  }, [rootNodeId, selectedNodeId, isConfigPanelVisible, lastDismissedNodeId]);

  const handleHideConfigPanel = () => {
    setIsConfigPanelVisible(false);
    if (selectedNodeId) {
      setLastDismissedNodeId(selectedNodeId);
    }
  };

  const handleSelectNode = (nodeId: string) => {
    selectNode(nodeId);

    if (!rootNodeId) {
      return;
    }

    if (!nodeId || nodeId === rootNodeId) {
      setIsConfigPanelVisible(false);
      setLastDismissedNodeId(null);
      return;
    }

    setLastDismissedNodeId(null);
    setIsConfigPanelVisible(true);
  };

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      if (detail?.message) showToast(detail.message);
    };
    window.addEventListener("bakementor:showToast", handler as EventListener);
    return () => window.removeEventListener("bakementor:showToast", handler as EventListener);
  }, [showToast]);

  const formatErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
      const message = (error as { message: string }).message;
      return message ? `${fallback}: ${message}` : fallback;
    }
    return fallback;
  };

  const buildVersionPayload = useCallback((): PageVersionPayload | null => {
    if (!document || !page) return null;
    const currentVersion = page.current_version;
    const payload: PageVersionPayload = {
      title: currentVersion?.title ?? page.title ?? "Untitled page",
      component_tree: serializeDocumentTree(document) as unknown as Record<string, unknown>,
    };

    if (currentVersion?.notes) {
      payload.notes = currentVersion.notes;
    }

    const metadata = (currentVersion?.metadata as Record<string, unknown> | undefined) ?? {};
    if (Object.keys(metadata).length > 0) {
      payload.metadata = { ...metadata };
    }

    return payload;
  }, [document, page]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const previewStorageKey = pageId ? `${PREVIEW_STORAGE_KEY_PREFIX}${pageId}` : null;

  const persistPreviewSnapshot = useCallback(() => {
    if (!document || !previewStorageKey) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      const snapshot = {
        tree: serializeDocumentTree(document),
        meta: document.meta ?? {},
        assets: document.assets ?? [],
      };
      window.localStorage.setItem(previewStorageKey, JSON.stringify(snapshot));
    } catch (error) {
      console.error("Failed to persist preview snapshot", error);
    }
  }, [document, previewStorageKey]);

  useEffect(() => {
    persistPreviewSnapshot();
  }, [persistPreviewSnapshot]);

  const handlePreview = useCallback(() => {
    if (!document) {
      showToast("Nothing to preview yet");
      return;
    }

    persistPreviewSnapshot();

    if (typeof window !== "undefined") {
      const url = `/preview/${pageId}?breakpoint=${activeBreakpoint}`;
      window.open(url, "_blank", "noopener");
    }
  }, [activeBreakpoint, document, pageId, persistPreviewSnapshot, showToast]);

  const handleSaveDraft = useCallback(async () => {
    if (!document) {
      showToast("Nothing to save yet");
      return;
    }
    if (!page) {
      showToast("Page data is still loading");
      return;
    }
    if (createPageVersion.isPending || publishFlowActive || publishPageMutation.isPending) {
      return;
    }

    const payload = buildVersionPayload();
    if (!payload) {
      showToast("No changes to save");
      return;
    }

    try {
      await createPageVersion.mutateAsync(payload);
      markSaved();
      showToast("Draft saved");
    } catch (error) {
      console.error("Failed to save draft", error);
      showToast(formatErrorMessage(error, "Failed to save draft"));
    }
  }, [buildVersionPayload, createPageVersion, document, markSaved, page, publishFlowActive, publishPageMutation, showToast]);

  const handlePublish = useCallback(async () => {
    if (!document) {
      showToast("Nothing to publish yet");
      return;
    }
    if (!page) {
      showToast("Page data is still loading");
      return;
    }
    if (publishFlowActive || createPageVersion.isPending || publishPageMutation.isPending) {
      return;
    }

    const payload = buildVersionPayload();
    if (!payload) {
      showToast("No changes to publish");
      return;
    }

    setPublishFlowActive(true);
    let createdVersionId: string | null = null;
    try {
      const version = await createPageVersion.mutateAsync(payload);
      createdVersionId = version.id;
      await publishPageMutation.mutateAsync({ versionId: version.id });
      markSaved();
      showToast("Page published");
    } catch (error) {
      console.error("Failed to publish page", error);
      if (createdVersionId) {
        markSaved();
        showToast(formatErrorMessage(error, "Draft saved but publish failed"));
      } else {
        showToast(formatErrorMessage(error, "Failed to publish"));
      }
    } finally {
      setPublishFlowActive(false);
    }
  }, [buildVersionPayload, createPageVersion, document, markSaved, page, publishFlowActive, publishPageMutation, showToast]);

  const handleStyleChange = (style: Partial<StyleDeclaration>) => {
    if (!selectedNodeId) return;
    updateNodeStyles(selectedNodeId, activeBreakpoint, style);
  };

  const handlePropChange = (props: Record<string, unknown>) => {
    if (!selectedNodeId) return;
    updateNodeProps(selectedNodeId, props);
  };

  const handleDeleteSelected = () => {
    if (!document || !selectedNode) return;
    if (selectedNode.id === document.tree.root) return;
    deleteNode(selectedNode.id);
    showToast("Component removed");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMod && event.key === "/") {
        event.preventDefault();
        openShortcuts();
        return;
      }

      if (isMod && key === "s") {
        event.preventDefault();
        void handleSaveDraft();
        return;
      }

      if (isMod && key === "p") {
        event.preventDefault();
        void handlePublish();
        return;
      }

      if (isMod && key === "r") {
        event.preventDefault();
        handlePreview();
        return;
      }

      if (isMod && key === "b") {
        event.preventDefault();
        setPaletteTab("blocks");
        return;
      }

      if (isMod && key === "e") {
        event.preventDefault();
        setPaletteTab("elements");
        return;
      }

      if (isMod && key === "t") {
        event.preventDefault();
        setPaletteTab("templates");
        return;
      }

      if (isMod && key === "i") {
        event.preventDefault();
        setPaletteTab("ai");
        return;
      }

      if (event.key === "Escape") {
        closeShortcuts();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeShortcuts, handlePreview, handlePublish, handleSaveDraft, openShortcuts, setPaletteTab]);

  const handleDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current;
    if (payload?.type === "palette") {
      setActiveComponent(payload.component as ComponentManifestEntry);
    } else {
      setActiveComponent(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;
    const overData = over?.data?.current;

    console.debug("dragEnd", { active: activeData, over: overData });

    if (!over || !document || !activeData) {
      setActiveComponent(null);
      return;
    }

    if (activeData.type === "palette") {
      const component = activeData.component as ComponentManifestEntry;
      const nodeType: BuilderNode["type"] = component.key.startsWith("layout") ? "layout" : "component";

      if (overData?.type === "container") {
        const parentId = overData.nodeId as string;
        const parent = document.tree.nodes[parentId];
        const position = parent ? parent.children.length : 0;
        addNode({ parentId, component: component.key, type: nodeType, position });
      } else if (overData?.type === "existing-node") {
        const parentId = overData.parentId as string | null;
        if (parentId) {
          const parent = document.tree.nodes[parentId];
          const overId = overData.nodeId as string;
          const position = parent.children.indexOf(overId);
          addNode({ parentId, component: component.key, type: nodeType, position: position === -1 ? undefined : position });
        }
      }
    } else if (activeData.type === "existing-node") {
      const activeId = String(activeData.nodeId ?? active.id);
      if (activeId === document.tree.root) {
        setActiveComponent(null);
        return;
      }

      if (overData?.type === "container") {
        const targetParentId = overData.nodeId as string;
        if (targetParentId === activeId) {
          setActiveComponent(null);
          return;
        }
        let ancestor: string | null = targetParentId;
        while (ancestor) {
          if (ancestor === activeId) {
            setActiveComponent(null);
            return;
          }
          ancestor = findParentId(document, ancestor);
        }
        const targetParent = document.tree.nodes[targetParentId];
        const index = targetParent ? targetParent.children.length : 0;
        moveNode({ nodeId: activeId, targetParentId, targetIndex: index });
      } else if (overData?.type === "existing-node") {
        const targetParentId = overData.parentId as string | null;
        const overId = overData.nodeId as string;
        if (targetParentId) {
          let ancestor = targetParentId;
          while (ancestor) {
            if (ancestor === activeId) {
              setActiveComponent(null);
              return;
            }
            ancestor = findParentId(document, ancestor)!;
          }
          const targetParent = document.tree.nodes[targetParentId];
          let index = targetParent.children.indexOf(overId);
          if (index === -1) {
            index = targetParent.children.length;
          }
          moveNode({ nodeId: activeId, targetParentId, targetIndex: index });
        }
      }
    }

    setActiveComponent(null);
  };

  const isPublishing = publishFlowActive || publishPageMutation.isPending;
  const isSavingDraft = createPageVersion.isPending && !publishFlowActive;

  if (isPageError) {
    console.error("Failed to load page", pageError);
    return (
      <main className="flex h-full items-center justify-center bg-surface-100">
        <div className="rounded-lg border border-surface-200 bg-white px-6 py-4 text-sm text-surface-500 shadow-subtle">
          Failed to load page. Please return to the dashboard and try again.
        </div>
      </main>
    );
  }

  if (!document || isPageLoading) {
    return (
      <main className="flex h-full items-center justify-center bg-surface-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </main>
    );
  }

  const rootId = document.tree.root;
  const canDeleteSelected = Boolean(selectedNode && selectedNode.id !== rootId);

  return (
    <div className="flex h-screen flex-col bg-surface-100">
      <BuilderToolbar
        activeBreakpoint={activeBreakpoint}
        onBreakpointChange={setBreakpoint}
        onBack={handleBack}
        onPreview={handlePreview}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onOpenShortcuts={openShortcuts}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
      />
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-[300px_1fr] overflow-hidden bg-surface-100">
          <aside className="hidden h-full min-h-0 flex-col border-r border-surface-200 bg-white xl:flex">
            {isConfigPanelVisible ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-2 border-b border-surface-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={handleHideConfigPanel}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-surface-500 transition hover:text-primary-600"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Library
                  </button>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-surface-400">Content config</span>
                </div>
                <div className="border-b border-surface-200 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wide text-surface-400">Selected</p>
                  <p className="text-sm font-semibold text-surface-800">
                    {selectedNodeDefinition?.label ?? selectedNode?.component ?? "Nothing selected"}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {selectedNode ? (
                    <div className="flex flex-col gap-6 pb-6">
                      <PropsInspector
                        node={selectedNode}
                        onChange={handlePropChange}
                        canDelete={canDeleteSelected}
                        onDelete={handleDeleteSelected}
                      />
                      <StyleInspector
                        node={selectedNode}
                        activeBreakpoint={activeBreakpoint}
                        onChange={handleStyleChange}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-surface-500">
                      Select a component to configure its content and styling.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPaletteTab("elements")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      paletteTab === "elements" ? "bg-primary-600 text-white" : "text-surface-500 hover:text-primary-600"
                    }`}
                  >
                    Elements
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteTab("blocks")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      paletteTab === "blocks" ? "bg-primary-600 text-white" : "text-surface-500 hover:text-primary-600"
                    }`}
                  >
                    Blocks
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteTab("templates")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      paletteTab === "templates" ? "bg-primary-600 text-white" : "text-surface-500 hover:text-primary-600"
                    }`}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteTab("ai")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      paletteTab === "ai" ? "bg-primary-600 text-white" : "text-surface-500 hover:text-primary-600"
                    }`}
                  >
                    AI
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
                  {paletteTab === "elements" && <ComponentPalette manifest={document.manifest} />}
                  {paletteTab === "blocks" && (
                    <BlockPalette blocks={BLOCK_TEMPLATES} onSelect={handleSelectBlock} />
                  )}
                  {paletteTab === "templates" && (
                    <TemplatePalette templates={PAGE_TEMPLATES} onSelect={handleSelectTemplate} />
                  )}
                  {paletteTab === "ai" && (
                    <AiPalette onComplete={handleAiComplete} />
                  )}
                </div>
              </div>
            )}
          </aside>
          <div className="flex flex-1 flex-col overflow-hidden">
            <BuilderCanvas
              document={document}
              breakpoint={activeBreakpoint}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
            />
          </div>
        </div>
        <DragOverlay>
          {activeComponent ? (
            <div className="rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-subtle">
              {activeComponent.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {isShortcutsOpen && (
        <div
          className="theme-light-scope fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 p-4 backdrop-blur-sm"
          onClick={closeShortcuts}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-surface-200 bg-white p-6 shadow-subtle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Keyboard shortcuts</h2>
                <p className="text-sm text-surface-500">Boost your workflow with these quick commands.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeShortcuts}>
                Close
              </Button>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {KEYBOARD_SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.combo}
                  className="flex items-center justify-between rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-surface-700">{shortcut.description}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-surface-500">
                    {shortcut.combo.split("+").map((part, index, array) => (
                      <span key={`${shortcut.combo}-${part}-${index}`} className="flex items-center gap-1">
                        <kbd className="rounded bg-surface-200 px-2 py-0.5 text-[11px] uppercase text-surface-600">{part.trim()}</kbd>
                        {index < array.length - 1 ? <span className="text-surface-400">+</span> : null}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="pointer-events-auto fixed bottom-6 right-6 min-w-[220px] rounded-lg bg-surface-900 px-4 py-3 text-sm font-medium text-white shadow-subtle">
          {toast.message}
        </div>
      )}
    </div>
  );
}
