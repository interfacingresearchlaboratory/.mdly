import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import {
  $applyNodeReplacement,
  $createParagraphNode,
  ElementNode,
} from "lexical"

export type SerializedHorizontalRuleNode = Spread<
  {
    type: "horizontalrule"
    version: 1
  },
  SerializedElementNode<SerializedLexicalNode>
>

function $convertHorizontalRuleElement(_domNode: Node): DOMConversionOutput {
  const node = $createHorizontalRuleNode()
  return { node }
}

export class HorizontalRuleNode extends ElementNode {
  static getType(): string {
    return "horizontalrule"
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  static importJSON(
    _serializedNode: SerializedHorizontalRuleNode
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode()
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertHorizontalRuleElement,
        priority: 0,
      }),
    }
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      ...super.exportJSON(),
      type: "horizontalrule",
      version: 1,
    }
  }

  exportDOM(): DOMExportOutput {
    return {
      element: document.createElement("hr"),
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const hr = document.createElement("hr")
    const className = config.theme.hr
    if (className !== undefined) {
      hr.className = className
    }
    return hr
  }

  updateDOM(): boolean {
    return false
  }

  insertNewAfter(): null {
    return null
  }

  collapseAtStart(): boolean {
    const paragraph = $createParagraphNode()
    const parent = this.getParentOrThrow()
    parent.insertBefore(paragraph)
    paragraph.select()
    this.remove()
    return true
  }

  // Horizontal rule is a block-level leaf node (cannot have children)
  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  isInline(): boolean {
    return false
  }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}
