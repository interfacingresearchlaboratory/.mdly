import { createHeadlessEditor } from "@lexical/headless"
import { $generateHtmlFromNodes } from "@lexical/html"
import type { SerializedEditorState } from "lexical"

import { getEditorTheme } from "./themes/editor-theme"
import { nodes } from "./nodes"

/**
 * Converts a serialized Lexical editor state to an HTML string.
 * Uses a headless editor; custom nodes' exportDOM() are used for the output.
 */
export function lexicalStateToHtml(state: SerializedEditorState): string {
  const editor = createHeadlessEditor({
    namespace: "HtmlExport",
    theme: getEditorTheme(),
    nodes,
    onError: (error: Error) => {
      console.error("[lexicalStateToHtml]", error)
    },
  })

  editor.setEditorState(editor.parseEditorState(JSON.stringify(state)))

  let html = ""
  editor.update(
    () => {
      html = $generateHtmlFromNodes(editor, null)
    },
    { discrete: true }
  )

  return html
}
