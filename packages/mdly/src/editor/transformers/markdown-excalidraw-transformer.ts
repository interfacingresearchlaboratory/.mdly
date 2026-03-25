import { TextMatchTransformer } from "@lexical/markdown"

import {
  $createExcalidrawEmbedNode,
  $isExcalidrawEmbedNode,
  ExcalidrawEmbedNode,
} from "../nodes/excalidraw-embed-node"
import { isLikelyExcalidrawSceneUrl, toExcalidrawEmbedUrl } from "../utils/excalidraw"

export const EXCALIDRAW: TextMatchTransformer = {
  dependencies: [ExcalidrawEmbedNode],
  export: (node) => {
    if (!$isExcalidrawEmbedNode(node)) {
      return null
    }
    return node.getSourceUrl()
  },
  // No shortcut syntax for insertion from typing markdown; this transformer
  // exists primarily for markdown export.
  importRegExp: /$^/,
  regExp: /$^/,
  replace: (textNode, match) => {
    const [, maybeUrl] = match
    if (!maybeUrl || !isLikelyExcalidrawSceneUrl(maybeUrl)) {
      return
    }
    const embedUrl = toExcalidrawEmbedUrl(maybeUrl)
    if (!embedUrl) return
    textNode.replace(
      $createExcalidrawEmbedNode({
        embedUrl,
        sourceUrl: maybeUrl,
      })
    )
  },
  trigger: " ",
  type: "text-match",
}
