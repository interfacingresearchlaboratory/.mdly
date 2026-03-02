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
  SerializedEditorState,
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
import { ColumnsNode } from "./columns-node"

const HorizontalSectionBlockComponent = React.lazy(
  () => import("../editor-ui/horizontal-section-block-component")
)

class HorizontalSectionBlockErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError = () => ({ hasError: true })
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function HorizontalSectionBlockDecorator(props: {
  nodeKey: NodeKey
  defaultStyle: CardStyle
  cards: HorizontalSectionCard[]
}): JSX.Element {
  const fallback = (
    <div
      className="EditorTheme__horizontalSectionBlock my-4 min-h-[120px] w-full rounded-lg border border-border bg-muted animate-pulse"
      contentEditable={false}
    />
  )
  return (
    <HorizontalSectionBlockErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <HorizontalSectionBlockComponent
          nodeKey={props.nodeKey}
          defaultStyle={props.defaultStyle}
          cards={props.cards}
        />
      </Suspense>
    </HorizontalSectionBlockErrorBoundary>
  )
}

/** Content nodes for each card; do not include HorizontalSectionBlockNode to avoid infinite nesting */
function getCardContentNodes() {
  return [
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
    ColumnsNode,
  ]
}

export type CornerType = "none" | "rounded" | "rounded-lg" | "rounded-full"
export type BorderWeight =
  | "none"
  | "super-fine"
  | "thin"
  | "medium"
  | "thick"

export interface PaddingEdges {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface CardStyle {
  cornerType?: CornerType
  borderWeight?: BorderWeight
  bgColor?: string
  paddingInner?: PaddingEdges | number
  paddingOuter?: PaddingEdges | number
}

export const DEFAULT_CARD_STYLE: CardStyle = {
  cornerType: "rounded",
  borderWeight: "super-fine",
  bgColor: "grey",
  paddingInner: 12,
}

const DEFAULT_MIN_HEIGHT_PX = 120

export interface HorizontalSectionCard {
  editor: LexicalEditor
  styleOverrides?: Partial<CardStyle>
  minHeightPx?: number
}

export interface SerializedHorizontalSectionCard {
  editorState: SerializedEditor
  styleOverrides?: Partial<CardStyle>
  minHeightPx?: number
}

export type SerializedHorizontalSectionBlockNode = Spread<
  {
    type: "horizontal-section-block"
    version: 1
    defaultStyle: CardStyle
    cards: SerializedHorizontalSectionCard[]
  },
  SerializedLexicalNode
>

export interface HorizontalSectionBlockPayload {
  defaultStyle?: CardStyle
  cards?: HorizontalSectionCard[]
  key?: NodeKey
}

export class HorizontalSectionBlockNode extends DecoratorNode<JSX.Element> {
  __defaultStyle: CardStyle
  __cards: HorizontalSectionCard[]

  static getType(): string {
    return "horizontal-section-block"
  }

  static clone(node: HorizontalSectionBlockNode): HorizontalSectionBlockNode {
    return new HorizontalSectionBlockNode(
      { ...node.__defaultStyle },
      node.__cards.map((c) => ({
        editor: c.editor,
        styleOverrides: c.styleOverrides ? { ...c.styleOverrides } : undefined,
        minHeightPx: c.minHeightPx,
      })),
      node.__key
    )
  }

  static importJSON(
    serializedNode: SerializedHorizontalSectionBlockNode
  ): HorizontalSectionBlockNode {
    const { defaultStyle, cards } = serializedNode
    const style = defaultStyle
      ? { ...DEFAULT_CARD_STYLE, ...defaultStyle }
      : { ...DEFAULT_CARD_STYLE }
    const cardItems: HorizontalSectionCard[] = (cards ?? []).map((ser) => {
      const editor = createEditor({ nodes: getCardContentNodes() })
      if (ser.editorState) {
        const state = editor.parseEditorState(
          ser.editorState as unknown as SerializedEditorState
        )
        if (!state.isEmpty()) {
          editor.setEditorState(state)
        }
      }
      return {
        editor,
        styleOverrides: ser.styleOverrides,
        minHeightPx: ser.minHeightPx ?? DEFAULT_MIN_HEIGHT_PX,
      }
    })
    if (cardItems.length === 0) {
      cardItems.push({
        editor: createEditor({ nodes: getCardContentNodes() }),
        minHeightPx: DEFAULT_MIN_HEIGHT_PX,
      })
    }
    return $applyNodeReplacement(
      new HorizontalSectionBlockNode(style, cardItems, undefined)
    )
  }

  static importDOM(): DOMConversionMap | null {
    return null
  }

  constructor(
    defaultStyle: CardStyle,
    cards: HorizontalSectionCard[],
    key?: NodeKey
  ) {
    super(key)
    this.__defaultStyle = { ...DEFAULT_CARD_STYLE, ...defaultStyle }
    this.__cards =
      cards.length > 0 ? cards : [createDefaultCard()]
  }

  exportJSON(): SerializedHorizontalSectionBlockNode {
    return {
      ...super.exportJSON(),
      type: "horizontal-section-block",
      version: 1,
      defaultStyle: { ...this.__defaultStyle },
      cards: this.__cards.map((c) => ({
        editorState: c.editor.toJSON(),
        styleOverrides: c.styleOverrides,
        minHeightPx: c.minHeightPx ?? DEFAULT_MIN_HEIGHT_PX,
      })),
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div")
    element.setAttribute("data-horizontal-section-block", "true")
    return { element }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    const theme = config.theme as EditorConfig["theme"] & {
      horizontalSectionBlock?: string
    }
    const className = theme.horizontalSectionBlock
    if (className !== undefined) {
      div.className = className
    }
    div.style.minHeight = "120px"
    div.style.width = "100%"
    return div
  }

  updateDOM(): boolean {
    return false
  }

  getDefaultStyle(): CardStyle {
    return { ...this.__defaultStyle }
  }

  setDefaultStyle(style: Partial<CardStyle>): void {
    const writable = this.getWritable()
    writable.__defaultStyle = { ...writable.__defaultStyle, ...style }
  }

  getCards(): HorizontalSectionCard[] {
    return this.__cards
  }

  getCardAt(index: number): HorizontalSectionCard | null {
    return this.__cards[index] ?? null
  }

  setCardStyleAt(index: number, overrides: Partial<CardStyle> | null): void {
    if (index < 0 || index >= this.__cards.length) return
    const writable = this.getWritable()
    const card = writable.__cards[index]
    if (!card) return
    writable.__cards[index] = {
      ...card,
      styleOverrides: overrides ?? undefined,
    }
  }

  setCardMinHeightAt(index: number, minHeightPx: number): void {
    if (index < 0 || index >= this.__cards.length) return
    const writable = this.getWritable()
    const card = writable.__cards[index]
    if (!card) return
    writable.__cards[index] = { ...card, minHeightPx }
  }

  addCard(index?: number): void {
    const writable = this.getWritable()
    const newCard = createDefaultCard()
    const i = index ?? writable.__cards.length
    writable.__cards.splice(i, 0, newCard)
  }

  removeCardAt(index: number): boolean {
    if (this.__cards.length <= 1 || index < 0 || index >= this.__cards.length) {
      return false
    }
    const writable = this.getWritable()
    writable.__cards.splice(index, 1)
    return true
  }

  decorate(): JSX.Element {
    return (
      <HorizontalSectionBlockDecorator
        nodeKey={this.getKey()}
        defaultStyle={this.__defaultStyle}
        cards={this.__cards}
      />
    )
  }
}

function createDefaultCard(): HorizontalSectionCard {
  return {
    editor: createEditor({ nodes: getCardContentNodes() }),
    minHeightPx: DEFAULT_MIN_HEIGHT_PX,
  }
}

export function $createHorizontalSectionBlockNode(
  payload?: HorizontalSectionBlockPayload
): HorizontalSectionBlockNode {
  const defaultStyle = payload?.defaultStyle
    ? { ...DEFAULT_CARD_STYLE, ...payload.defaultStyle }
    : { ...DEFAULT_CARD_STYLE }
  const cards =
    payload?.cards && payload.cards.length > 0
      ? payload.cards
      : [createDefaultCard()]
  return $applyNodeReplacement(
    new HorizontalSectionBlockNode(defaultStyle, cards, payload?.key)
  )
}

export function $isHorizontalSectionBlockNode(
  node: LexicalNode | null | undefined
): node is HorizontalSectionBlockNode {
  return node instanceof HorizontalSectionBlockNode
}
