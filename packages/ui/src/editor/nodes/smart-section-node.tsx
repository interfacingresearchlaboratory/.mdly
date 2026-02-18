import * as React from "react"
import { JSX, Suspense } from "react"
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $applyNodeReplacement, createEditor, DecoratorNode, ParagraphNode, TextNode } from "lexical"
import { CustomLinkNode, CustomAutoLinkNode } from "./link-node"
import { AutocompleteNode } from "./autocomplete-node"
import { MentionNode } from "./mention-node"
import {
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { ImageNode } from "./image-node"
import { InlineImageNode } from "./inline-image-node"
import { HorizontalRuleNode } from "./horizontal-rule-node"

const SmartSectionComponent = React.lazy(
  () => import("../editor-ui/smart-section-component")
)

// Header editor nodes: only ParagraphNode, TextNode, CustomLinkNode, CustomAutoLinkNode, AutocompleteNode, MentionNode
const headerNodes = [ParagraphNode, TextNode, CustomLinkNode, CustomAutoLinkNode, AutocompleteNode, MentionNode]

// Content editor nodes: full feature set
const contentNodes = [
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
  CustomAutoLinkNode,
  ImageNode,
  InlineImageNode,
  AutocompleteNode,
  HorizontalRuleNode,
]

export interface SmartSectionPayload {
  headerEditor?: LexicalEditor
  contentEditor?: LexicalEditor
  isExpanded?: boolean
  key?: NodeKey
}

export type SerializedSmartSectionNode = Spread<
  {
    type: "smartsection"
    version: 1
    headerEditor: SerializedEditor
    contentEditor: SerializedEditor
    isExpanded: boolean
  },
  SerializedLexicalNode
>

export class SmartSectionNode extends DecoratorNode<JSX.Element> {
  __headerEditor: LexicalEditor
  __contentEditor: LexicalEditor
  __isExpanded: boolean

  static getType(): string {
    return "smartsection"
  }

  static clone(node: SmartSectionNode): SmartSectionNode {
    return new SmartSectionNode(
      node.__headerEditor,
      node.__contentEditor,
      node.__isExpanded,
      node.__key
    )
  }

  static importJSON(
    serializedNode: SerializedSmartSectionNode
  ): SmartSectionNode {
    const { headerEditor, contentEditor, isExpanded } = serializedNode
    const node = $createSmartSectionNode({
      headerEditor: createEditor({
        nodes: headerNodes,
      }),
      contentEditor: createEditor({
        nodes: contentNodes,
      }),
      isExpanded,
    })

    // Restore header editor state
    const headerEditorState = node.__headerEditor.parseEditorState(
      headerEditor.editorState
    )
    if (!headerEditorState.isEmpty()) {
      node.__headerEditor.setEditorState(headerEditorState)
    }

    // Restore content editor state
    const contentEditorState = node.__contentEditor.parseEditorState(
      contentEditor.editorState
    )
    if (!contentEditorState.isEmpty()) {
      node.__contentEditor.setEditorState(contentEditorState)
    }

    return node
  }

  static importDOM(): DOMConversionMap | null {
    return null
  }

  constructor(
    headerEditor: LexicalEditor,
    contentEditor: LexicalEditor,
    isExpanded: boolean,
    key?: NodeKey
  ) {
    super(key)
    this.__headerEditor = headerEditor
    this.__contentEditor = contentEditor
    this.__isExpanded = isExpanded
  }

  exportJSON(): SerializedSmartSectionNode {
    return {
      ...super.exportJSON(),
      type: "smartsection",
      version: 1,
      headerEditor: this.__headerEditor.toJSON(),
      contentEditor: this.__contentEditor.toJSON(),
      isExpanded: this.__isExpanded,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.setAttribute("data-smart-section", "true")
    return { element }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    const theme = config.theme
    const className = theme.smartSection
    if (className !== undefined) {
      div.className = className
    }
    return div
  }

  updateDOM(): boolean {
    return false
  }

  setIsExpanded(isExpanded: boolean): void {
    const writable = this.getWritable()
    writable.__isExpanded = isExpanded
  }

  getIsExpanded(): boolean {
    return this.__isExpanded
  }

  getHeaderEditor(): LexicalEditor {
    return this.__headerEditor
  }

  getContentEditor(): LexicalEditor {
    return this.__contentEditor
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <SmartSectionComponent
          headerEditor={this.__headerEditor}
          contentEditor={this.__contentEditor}
          isExpanded={this.__isExpanded}
          nodeKey={this.getKey()}
        />
      </Suspense>
    )
  }
}

export function $createSmartSectionNode({
  headerEditor,
  contentEditor,
  isExpanded = true,
  key,
}: SmartSectionPayload): SmartSectionNode {
  return $applyNodeReplacement(
    new SmartSectionNode(
      headerEditor ||
        createEditor({
          nodes: headerNodes,
        }),
      contentEditor ||
        createEditor({
          nodes: contentNodes,
        }),
      isExpanded,
      key
    )
  )
}

export function $isSmartSectionNode(
  node: LexicalNode | null | undefined
): node is SmartSectionNode {
  return node instanceof SmartSectionNode
}
