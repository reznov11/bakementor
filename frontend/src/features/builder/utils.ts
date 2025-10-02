import type { BuilderDocument, BuilderNode, BuilderTree } from "@/types/builder";
import { BUILDER_MANIFEST, SAMPLE_DOCUMENT } from "@/features/builder/manifest";

export const findNode = (document: BuilderDocument | null, nodeId: string | null): BuilderNode | null => {
  if (!document || !nodeId) return null;
  return document.tree.nodes[nodeId] ?? null;
};

export const findParentId = (document: BuilderDocument | null, nodeId: string): string | null => {
  if (!document) return null;
  const entry = Object.values(document.tree.nodes).find((node) => node.children.includes(nodeId));
  return entry?.id ?? null;
};

export const isLayoutComponent = (componentKey: string): boolean => componentKey.startsWith("layout.");

export const canAcceptChild = (
  parent: BuilderNode,
  childComponentKey: string,
  manifest: BuilderDocument["manifest"],
): boolean => {
  const parentDefinition = manifest.find((item) => item.key === parent.component);
  if (!parentDefinition) return true;
  if (!parentDefinition.allowedChildren?.length) return true;
  return parentDefinition.allowedChildren.includes(childComponentKey);
};

export const getManifestEntry = (
  manifest: BuilderDocument["manifest"],
  key: string,
): BuilderDocument["manifest"][number] | undefined => manifest.find((entry) => entry.key === key);

export const ensureDefaultProps = (node: BuilderNode, manifestEntry?: BuilderDocument["manifest"][number]) => {
  if (!manifestEntry) return node;
  node.props = { ...manifestEntry.defaultProps, ...node.props };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBuilderTree = (value: unknown): value is BuilderTree =>
  isRecord(value) && typeof value.root === "string" && isRecord(value.nodes);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createDocumentFromTree = (
  tree: unknown,
  meta?: Record<string, unknown>,
  assets?: BuilderDocument["assets"],
): BuilderDocument => {
  const sourceTree = isBuilderTree(tree) ? tree : SAMPLE_DOCUMENT.tree;
  const clonedTree = clone(sourceTree);

  Object.values(clonedTree.nodes).forEach((node) => {
    if (node.component === "media.slider") {
      node.type = "layout";
    }
    if (node.component === "layout.container") {
      node.type = "layout";
      if (!node.styles?.base) {
        node.styles = {
          ...node.styles,
          base: {
            width: "100%",
            maxWidth: "1200px",
            margin: { left: "auto", right: "auto" },
            padding: { left: "24px", right: "24px" },
          },
        };
      }
    }
  });

  return {
    tree: clonedTree,
    manifest: BUILDER_MANIFEST,
    assets: assets ? clone(assets) : [],
    lastSavedAt: undefined,
    ...(meta ? { meta } : {}),
  };
};

export const serializeDocumentTree = (document: BuilderDocument): BuilderTree => clone(document.tree);
