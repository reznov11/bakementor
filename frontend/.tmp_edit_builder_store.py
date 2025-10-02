from pathlib import Path

path = Path("src/store/builder-store.ts")
text = path.read_text()

import_block = "  BuilderAction,\n  BuilderDocument,\n  BuilderNode,\n  BuilderState,\n  BreakpointId,\n  StyleDeclaration,\n"
replacement_import_block = "  BuilderAction,\n  BuilderDocument,\n  BuilderNode,\n  BuilderState,\n  BreakpointId,\n  BuilderTree,\n  StyleDeclaration,\n"
if import_block not in text:
    raise SystemExit("Import block not found in builder-store.ts")
text = text.replace(import_block, replacement_import_block, 1)

interface_anchor = "  insertBlock: (args: { parentId: string; rootId: string; nodes: Record<string, BuilderNode> }) => void;\n  deleteNode"
interface_replacement = (
    "  insertBlock: (args: { parentId: string; rootId: string; nodes: Record<string, BuilderNode> }) => void;\n"
    "  applyTemplate: (args: { tree: BuilderTree; assets?: BuilderDocument[\"assets\"]; meta?: Record[str, unknown]; templateId?: string }) => void;\n"
    "  deleteNode"
)
if interface_anchor not in text:
    raise SystemExit("Interface anchor not found in builder-store.ts")
text = text.replace(interface_anchor, interface_replacement, 1)

method_anchor = "),\n\n  deleteNode"
apply_method = (
    "),\n\n  applyTemplate: ({ tree, assets, meta, templateId }) =>\n    set(\n      produce<BuilderStore>((state) => {\n        if (!state.document) return;\n\n        const clonedTree = JSON.parse(JSON.stringify(tree)) as BuilderTree;\n        state.document.tree = clonedTree;\n        state.selectedNodeId = clonedTree.root;\n        state.hoveredNodeId = null;\n\n        if (typeof assets !== \"undefined\") {\n          state.document.assets = JSON.parse(JSON.stringify(assets));\n        }\n\n        const currentMeta = state.document.meta ?? {};\n        state.document.meta = {\n          ...currentMeta,\n          ...(meta ?? {}),\n          ...(templateId ? { templateId } : {}),\n        };\n\n        pushChange(state, { type: \"REPLACE_TREE\", payload: { tree: clonedTree } });\n      }),\n    ),\n\n  deleteNode"
)
if method_anchor not in text:
    raise SystemExit("Method anchor not found in builder-store.ts")
text = text.replace(method_anchor, apply_method, 1)

path.write_text(text)
