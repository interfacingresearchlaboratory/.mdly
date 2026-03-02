import { createHeadlessEditor } from "@lexical/headless"
import { $convertToMarkdownString } from "@lexical/markdown"
import type { SerializedEditorState } from "lexical"

import { getEditorTheme } from "./themes/editor-theme"
import { nodes } from "./nodes"
import { MARKDOWN_TRANSFORMERS } from "./markdown-transformers"

/** Node types that have no markdown transformer; saving as Markdown would lose structure. */
const NON_MARKDOWN_NODE_TYPES = ["columns", "horizontal-section-block"]

function hasNonMarkdownInNodes(nodes: unknown): boolean {
  if (!Array.isArray(nodes)) return false
  for (const node of nodes) {
    if (node && typeof node === "object" && "type" in node) {
      const type = (node as { type?: string }).type
      if (typeof type === "string" && NON_MARKDOWN_NODE_TYPES.includes(type)) return true
      const withChildren = node as { type?: string; children?: unknown[]; columnEditors?: SerializedEditorState[]; cards?: { editorState?: SerializedEditorState }[] }
      if (Array.isArray(withChildren.children) && hasNonMarkdownInNodes(withChildren.children)) return true
      if (type === "columns" && Array.isArray(withChildren.columnEditors)) {
        for (const ed of withChildren.columnEditors) {
          if (ed && typeof ed === "object" && "root" in ed && hasNonMarkdownInState(ed as SerializedEditorState)) return true
        }
      }
      if (type === "horizontal-section-block" && Array.isArray(withChildren.cards)) {
        for (const card of withChildren.cards) {
          if (card?.editorState && hasNonMarkdownInState(card.editorState)) return true
        }
      }
    }
  }
  return false
}

function hasNonMarkdownInState(state: SerializedEditorState): boolean {
  const root = state?.root
  if (!root || typeof root !== "object" || !("children" in root)) return false
  return hasNonMarkdownInNodes((root as { children?: unknown[] }).children)
}

/**
 * Returns true if the serialized editor state contains any nodes that cannot be
 * represented in Markdown (e.g. columns, horizontal-section-block).
 */
export function lexicalStateHasNonMarkdownNodes(state: SerializedEditorState): boolean {
  return hasNonMarkdownInState(state)
}

/**
 * Converts a serialized Lexical editor state to a markdown string.
 * Uses a headless editor so no DOM is required.
 */
export function lexicalStateToMarkdown(state: SerializedEditorState): string {
  const editor = createHeadlessEditor({
    namespace: "MarkdownExport",
    theme: getEditorTheme(),
    nodes,
    onError: (error: Error) => {
      console.error("[lexicalStateToMarkdown]", error)
    },
  })

  editor.setEditorState(editor.parseEditorState(JSON.stringify(state)))

  let markdown = ""
  editor.getEditorState().read(() => {
    markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS)
  })

  return markdown
}
