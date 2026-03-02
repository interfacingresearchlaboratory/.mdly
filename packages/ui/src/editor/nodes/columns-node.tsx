import * as React from "react"
import { JSX, Suspense } from "react"
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $applyNodeReplacement, createEditor, DecoratorNode } from "lexical"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { CustomLinkNode, CustomAutoLinkNode } from "./link-node"
import { AutocompleteNode } from "./autocomplete-node"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { ImageNode } from "./image-node"
import { InlineImageNode } from "./inline-image-node"
import { HorizontalRuleNode } from "./horizontal-rule-node"

const ColumnsComponent = React.lazy(
  () => import("../editor-ui/columns-component")
)

// Lazy so ColumnsNode can be included for nested column editors
function getContentNodes() {
  return [...contentNodesBase, ColumnsNode]
}
const contentNodesBase = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CustomLinkNode,
  {
    replace: LinkNode,
    with: (node: LinkNode) =>
      new CustomLinkNode(node.getURL(), {
        rel: node.getRel(),
        target: node.getTarget(),
        title: node.getTitle(),
      }),
  },
  CustomAutoLinkNode,
  {
    replace: AutoLinkNode,
    with: (node: AutoLinkNode) =>
      new CustomAutoLinkNode(node.getURL(), {
        isUnlinked: node.getIsUnlinked(),
        rel: node.getRel(),
        target: node.getTarget(),
        title: node.getTitle(),
      }),
  },
  ImageNode,
  InlineImageNode,
  AutocompleteNode,
  HorizontalRuleNode,
]

function defaultWidths(count: 1 | 2 | 3 | 4): number[] {
  const frac = 1 / count
  return Array.from({ length: count }, () => frac)
}

export type ColumnsColumnCount = 1 | 2 | 3 | 4

export interface ColumnsPayload {
  columnCount: ColumnsColumnCount
  widths?: number[]
  key?: NodeKey
}

export type SerializedColumnsNode = Spread<
  {
    type: "columns"
    version: 1
    columnCount: ColumnsColumnCount
    widths: number[]
    columnEditors: SerializedEditor[]
  },
  SerializedLexicalNode
>

export class ColumnsNode extends DecoratorNode<JSX.Element> {
  __columnCount: ColumnsColumnCount
  __editors: LexicalEditor[]
  __widths: number[]

  static getType(): string {
    return "columns"
  }

  static clone(node: ColumnsNode): ColumnsNode {
    const cloned = new ColumnsNode(
      node.__columnCount,
      node.__editors,
      [...node.__widths],
      node.__key
    )
    return cloned
  }

  static importJSON(serializedNode: SerializedColumnsNode): ColumnsNode {
    const { columnCount, widths, columnEditors } = serializedNode
    const editors = Array.from({ length: columnCount }, () =>
      createEditor({ nodes: getContentNodes() })
    )
    const w =
      widths?.length === columnCount ? [...widths] : defaultWidths(columnCount)

    columnEditors.forEach((serialized, i) => {
      const ed = editors[i]
      if (ed && serialized?.editorState) {
        const state = ed.parseEditorState(serialized.editorState)
        if (!state.isEmpty()) {
          ed.setEditorState(state)
        }
      }
    })

    return $applyNodeReplacement(
      new ColumnsNode(columnCount, editors, w, undefined)
    )
  }

  static importDOM(): DOMConversionMap | null {
    return null
  }

  constructor(
    columnCount: ColumnsColumnCount,
    editors: LexicalEditor[],
    widths: number[],
    key?: NodeKey
  ) {
    super(key)
    this.__columnCount = columnCount
    this.__editors = editors
    this.__widths = widths.length === columnCount ? widths : defaultWidths(columnCount)
  }

  exportJSON(): SerializedColumnsNode {
    return {
      ...super.exportJSON(),
      type: "columns",
      version: 1,
      columnCount: this.__columnCount,
      widths: [...this.__widths],
      columnEditors: this.__editors.map((ed) => ed.toJSON()),
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.setAttribute("data-columns", String(this.__columnCount))
    return { element }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    const theme = config.theme as EditorConfig["theme"] & { columns?: string }
    const className = theme.columns
    if (className !== undefined) {
      div.className = className
    }
    return div
  }

  updateDOM(): boolean {
    return false
  }

  setWidths(widths: number[]): void {
    const writable = this.getWritable()
    if (widths.length === writable.__columnCount) {
      writable.__widths = [...widths]
    }
  }

  getWidths(): number[] {
    return [...this.__widths]
  }

  getColumnCount(): ColumnsColumnCount {
    return this.__columnCount
  }

  getEditorAt(index: number): LexicalEditor | null {
    return this.__editors[index] ?? null
  }

  /** Removes the column at the given index. Allowed when columnCount >= 2 (so two columns can become one). */
  removeColumnAt(index: number): void {
    if (this.__columnCount < 2 || index < 0 || index >= this.__columnCount) {
      return
    }
    const writable = this.getWritable()
    writable.__editors.splice(index, 1)
    writable.__widths.splice(index, 1)
    const newCount = writable.__editors.length
    writable.__columnCount = newCount as ColumnsColumnCount
    if (writable.__widths.length === newCount) {
      const sum = writable.__widths.reduce((a, b) => a + b, 0)
      if (sum > 0) {
        writable.__widths = writable.__widths.map((w) => w / sum)
      }
    }
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ColumnsComponent
          nodeKey={this.getKey()}
          columnCount={this.__columnCount}
          editors={this.__editors}
          widths={this.__widths}
        />
      </Suspense>
    )
  }
}

export function $createColumnsNode({
  columnCount,
  widths,
  key,
}: ColumnsPayload): ColumnsNode {
  const editors = Array.from({ length: columnCount }, () =>
    createEditor({ nodes: getContentNodes() })
  )
  const w =
    widths && widths.length === columnCount ? widths : defaultWidths(columnCount)
  return $applyNodeReplacement(
    new ColumnsNode(columnCount, editors, w, key)
  )
}

export function $isColumnsNode(
  node: LexicalNode | null | undefined
): node is ColumnsNode {
  return node instanceof ColumnsNode
}
