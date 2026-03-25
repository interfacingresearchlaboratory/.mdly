import {
  $convertToMarkdownString,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { $getRoot } from "lexical"

import { ColumnsNode, $isColumnsNode } from "../nodes/columns-node"
import { HORIZONTAL_RULE } from "./markdown-horizontal-rule-transformer"
import { SMART_SECTION } from "./markdown-smart-section-transformer"
import { TABLE } from "./markdown-table-transformer"
import { IMAGE } from "./markdown-image-transformer"
import { EXCALIDRAW } from "./markdown-excalidraw-transformer"

/** Transformers for column cell export (excludes COLUMNS to avoid circular dependency). */
const COLUMN_CELL_TRANSFORMERS = [
  IMAGE,
  EXCALIDRAW,
  CHECK_LIST,
  HORIZONTAL_RULE,
  SMART_SECTION,
  TABLE,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]

export const COLUMNS: ElementTransformer = {
  dependencies: [ColumnsNode],
  export: (node) => {
    if (!$isColumnsNode(node)) {
      return null
    }
    const count = node.getColumnCount()
    const cells: string[] = []
    for (let i = 0; i < count; i++) {
      const editor = node.getEditorAt(i)
      if (!editor) {
        cells.push("")
        continue
      }
      const md = editor
        .getEditorState()
        .read(() =>
          $convertToMarkdownString(COLUMN_CELL_TRANSFORMERS, $getRoot())
        )
      cells.push(md.replace(/\n/g, "\\n").trim())
    }
    return `| ${cells.join(" | ")} |`
  },
  regExp: /^(?!.)/, // no markdown shortcut for inserting columns
  replace: () => {},
  type: "element",
}
