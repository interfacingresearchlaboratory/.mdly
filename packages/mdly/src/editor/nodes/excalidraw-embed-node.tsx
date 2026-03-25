import type { JSX } from "react"
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $applyNodeReplacement, DecoratorNode } from "lexical"

import { ExcalidrawEmbedComponent } from "../editor-ui/excalidraw-embed-component"
import { isLikelyExcalidrawSceneUrl, toExcalidrawEmbedUrl } from "../utils/excalidraw"

export type SerializedExcalidrawEmbedNode = Spread<
  {
    embedUrl: string
    sourceUrl: string
  },
  SerializedLexicalNode
>

function $convertIframeElement(domNode: Node): DOMConversionOutput | null {
  const iframe = domNode as HTMLIFrameElement
  const src = iframe.getAttribute("src")
  if (!src || !isLikelyExcalidrawSceneUrl(src)) return null
  const embedUrl = toExcalidrawEmbedUrl(src)
  if (!embedUrl) return null
  return {
    node: $createExcalidrawEmbedNode({
      embedUrl,
      sourceUrl: src,
    }),
  }
}

export class ExcalidrawEmbedNode extends DecoratorNode<JSX.Element> {
  __embedUrl: string
  __sourceUrl: string

  static getType(): string {
    return "excalidraw-embed"
  }

  static clone(node: ExcalidrawEmbedNode): ExcalidrawEmbedNode {
    return new ExcalidrawEmbedNode(node.__embedUrl, node.__sourceUrl, node.__key)
  }

  static importJSON(serializedNode: SerializedExcalidrawEmbedNode): ExcalidrawEmbedNode {
    return $createExcalidrawEmbedNode({
      embedUrl: serializedNode.embedUrl,
      sourceUrl: serializedNode.sourceUrl,
    })
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: () => ({
        conversion: $convertIframeElement,
        priority: 1,
      }),
    }
  }

  constructor(embedUrl: string, sourceUrl: string, key?: NodeKey) {
    super(key)
    this.__embedUrl = embedUrl
    this.__sourceUrl = sourceUrl
  }

  exportJSON(): SerializedExcalidrawEmbedNode {
    return {
      ...super.exportJSON(),
      type: "excalidraw-embed",
      embedUrl: this.__embedUrl,
      sourceUrl: this.__sourceUrl,
      version: 1,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("iframe")
    element.setAttribute("src", this.__embedUrl)
    element.setAttribute("title", "Excalidraw embed")
    return { element }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    const embedTheme = config.theme.embedBlock
    if (typeof embedTheme === "object" && embedTheme?.base) {
      div.className = embedTheme.base
    }
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ExcalidrawEmbedComponent
        embedUrl={this.__embedUrl}
        sourceUrl={this.__sourceUrl}
      />
    )
  }

  getSourceUrl(): string {
    return this.__sourceUrl
  }
}

export function $createExcalidrawEmbedNode({
  embedUrl,
  sourceUrl,
}: {
  embedUrl: string
  sourceUrl: string
}): ExcalidrawEmbedNode {
  return $applyNodeReplacement(new ExcalidrawEmbedNode(embedUrl, sourceUrl))
}

export function $isExcalidrawEmbedNode(
  node: LexicalNode | null | undefined
): node is ExcalidrawEmbedNode {
  return node instanceof ExcalidrawEmbedNode
}
