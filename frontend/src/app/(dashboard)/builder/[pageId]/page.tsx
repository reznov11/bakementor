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

import { BuilderToolbar } from "@/features/builder/components/builder-toolbar";
import { ComponentPalette } from "@/features/builder/components/component-palette";
import { BlockPalette } from "@/features/builder/components/block-palette";
import { BuilderCanvas } from "@/features/builder/components/builder-canvas";
import { StyleInspector } from "@/features/builder/components/style-inspector";
import { PropsInspector } from "@/features/builder/components/props-inspector";
import { BLOCK_TEMPLATES } from "@/features/builder/blocks";
import type { BuilderNode, ComponentManifestEntry, StyleDeclaration } from "@/types/builder";
import { useBuilderStore } from "@/store/builder-store";
import { createDocumentFromTree, findNode, findParentId, serializeDocumentTree } from "@/features/builder/utils";
import { useCreatePageVersion, usePage, usePublishPage } from "@/features/pages/hooks";
import type { PageVersionPayload } from "@/types/pages";

const PREVIEW_STORAGE_KEY_PREFIX = "bakementor:preview:";

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
  const [paletteTab, setPaletteTab] = useState<"elements" | "blocks">("elements");
  const [publishFlowActive, setPublishFlowActive] = useState(false);

  const handleSelectBlock = (blockId: string) => {
    if (!document) return;
    const template = BLOCK_TEMPLATES.find((block) => block.id === blockId);
    if (!template) return;

    const { rootId, nodes } = template.create();
    insertBlock({ parentId: document.tree.root, rootId, nodes });
    showToast(template.name + " added");
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

  const showToast = (message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  };

  const formatErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
      const message = (error as { message: string }).message;
      return message ? `${fallback}: ${message}` : fallback;
    }
    return fallback;
  };

  const buildVersionPayload = (): PageVersionPayload | null => {
    if (!document || !page) return null;
    const currentVersion = page.current_version;
    const payload: PageVersionPayload = {
      title: currentVersion?.title ?? page.title ?? "Untitled page",
      component_tree: serializeDocumentTree(document),
    };

    if (currentVersion?.notes) {
      payload.notes = currentVersion.notes;
    }

    const metadata = (currentVersion?.metadata as Record<string, unknown> | undefined) ?? {};
    if (Object.keys(metadata).length > 0) {
      payload.metadata = { ...metadata };
    }

    return payload;
  };

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

  const handlePreview = () => {
    if (!document) {
      showToast("Nothing to preview yet");
      return;
    }

    persistPreviewSnapshot();

    if (typeof window !== "undefined") {
      const url = `/preview/${pageId}?breakpoint=${activeBreakpoint}`;
      window.open(url, "_blank", "noopener");
    }
  };

  const handleSaveDraft = async () => {
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
  };

  const handlePublish = async () => {
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
  };

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
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
      />
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid flex-1 grid-cols-[280px_1fr_320px] overflow-hidden bg-surface-100">
          <aside className="hidden h-full min-h-0 flex-col border-r border-surface-200 bg-white xl:flex">
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
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
              {paletteTab === "elements" ? (
                <ComponentPalette manifest={document.manifest} />
              ) : (
                <BlockPalette blocks={BLOCK_TEMPLATES} onSelect={handleSelectBlock} />
              )}
            </div>
          </aside>
          <div className="flex flex-1 flex-col overflow-hidden">
            <BuilderCanvas
              document={document}
              breakpoint={activeBreakpoint}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
            />
          </div>
          <aside className="hidden h-full flex-col gap-6 overflow-y-auto border-l border-surface-200 bg-white p-5 lg:flex">
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
          </aside>
        </div>
        <DragOverlay>
          {activeComponent ? (
            <div className="rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-subtle">
              {activeComponent.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {toast && (
        <div className="pointer-events-auto fixed bottom-6 right-6 min-w-[220px] rounded-lg bg-surface-900 px-4 py-3 text-sm font-medium text-white shadow-subtle">
          {toast.message}
        </div>
      )}
    </div>
  );
}
