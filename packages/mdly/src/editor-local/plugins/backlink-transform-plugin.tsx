"use client"

import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot, $getNodeByKey, $isTextNode, $isElementNode } from "lexical"
import type { ElementNode, TextNode } from "lexical"

import { $createBacklinkNode, $isBacklinkNode } from "../nodes/backlink-node"
import { useBacklinksContext } from "../context/backlinks-context"
import { resolvePageNameToPath } from "../utils/resolve-page-name-to-path"

const BACKLINK_REGEX = /\[\[([^\]]+)\]\]/g

function walkTextNodes(
  node: import("lexical").LexicalNode,
  out: { nodeKey: string; matches: { index: number; length: number; pageName: string }[] }[]
): void {
  if ($isTextNode(node)) {
    const text = (node as TextNode).getTextContent()
    const matches: { index: number; length: number; pageName: string }[] = []
    let m: RegExpExecArray | null
    BACKLINK_REGEX.lastIndex = 0
    while ((m = BACKLINK_REGEX.exec(text)) !== null) {
      const pageName = m[1]?.trim() ?? ""
      if (!pageName) continue
      matches.push({
        index: m.index,
        length: m[0].length,
        pageName,
      })
    }
    if (matches.length > 0) {
      out.push({ nodeKey: (node as TextNode).getKey(), matches })
    }
    return
  }
  if ($isElementNode(node)) {
    for (const child of (node as ElementNode).getChildren()) {
      walkTextNodes(child, out)
    }
  }
}

function walkBacklinkNodes(
  node: import("lexical").LexicalNode,
  out: import("lexical").NodeKey[]
): void {
  if ($isBacklinkNode(node)) {
    out.push(node.getKey())
    return
  }
  if ($isElementNode(node)) {
    for (const child of (node as ElementNode).getChildren()) {
      walkBacklinkNodes(child, out)
    }
  }
}

export function BacklinkTransformPlugin(): null {
  const [editor] = useLexicalComposerContext()
  const { sameFolderMdFiles, currentFilePath } = useBacklinksContext()

  useEffect(() => {
    editor.update(
      () => {
        const root = $getRoot()

        // Pass 1: Update existing BacklinkNodes' path when index has changed
        const backlinkKeys: import("lexical").NodeKey[] = []
        for (const child of root.getChildren()) {
          walkBacklinkNodes(child, backlinkKeys)
        }
        for (const nodeKey of backlinkKeys) {
          const node = $getNodeByKey(nodeKey)
          if (!$isBacklinkNode(node)) continue
          const path = resolvePageNameToPath(
            node.getPageName(),
            sameFolderMdFiles,
            currentFilePath
          )
          if (path !== node.getPath()) {
            node.setPath(path)
          }
        }

        // Pass 2: Replace text nodes containing [[...]] with BacklinkNodes
        const toTransform: {
          nodeKey: string
          matches: { index: number; length: number; pageName: string }[]
        }[] = []
        for (const child of root.getChildren()) {
          walkTextNodes(child, toTransform)
        }

        for (const { nodeKey, matches } of toTransform) {
          const node = $getNodeByKey(nodeKey)
          if (!node || !$isTextNode(node)) continue
          const textNode = node as TextNode
          const sortedMatches = [...matches].sort((a, b) => b.index - a.index)
          for (const m of sortedMatches) {
            const path = resolvePageNameToPath(
              m.pageName,
              sameFolderMdFiles,
              currentFilePath
            )
            const splitResult = textNode.splitText(m.index)
            const rest = Array.isArray(splitResult) ? splitResult[1] : splitResult
            if (!rest) continue
            if (rest.getTextContent().length > m.length) {
              rest.splitText(m.length)
            }
            rest.replace($createBacklinkNode(m.pageName, path))
          }
        }
      },
      { tag: "backlink-transform" }
    )
  }, [editor, sameFolderMdFiles, currentFilePath])

  return null
}
