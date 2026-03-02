"use client"

import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot, $isElementNode } from "lexical"
import type { ElementNode } from "lexical"
import { $isLinkNode } from "@lexical/link"

import { useBacklinksContext } from "../context/backlinks-context"
import { resolvePageNameToPath } from "../utils/resolve-page-name-to-path"
import { VELLUM_FILE_LINK_PREFIX } from "../transformers/markdown-wiki-file-link-transformer"

const UNRESOLVED_CLASS = "EditorTheme__wikiLinkUnresolved"

function walkLinkNodes(
  node: import("lexical").LexicalNode,
  out: { nodeKey: string; url: string }[]
): void {
  if ($isLinkNode(node)) {
    const url = node.getURL()
    if (url.startsWith(VELLUM_FILE_LINK_PREFIX)) {
      out.push({ nodeKey: node.getKey(), url })
    }
    return
  }
  if ($isElementNode(node)) {
    for (const child of (node as ElementNode).getChildren()) {
      walkLinkNodes(child, out)
    }
  }
}

export function UnresolvedWikiLinkStylePlugin(): null {
  const [editor] = useLexicalComposerContext()
  const { sameFolderMdFiles, currentFilePath } = useBacklinksContext()

  useEffect(() => {
    function applyUnresolvedStyles(): void {
      const linkData: { nodeKey: string; url: string }[] = []
      editor.getEditorState().read(() => {
        const root = $getRoot()
        for (const child of root.getChildren()) {
          walkLinkNodes(child, linkData)
        }
      })

      for (const { nodeKey, url } of linkData) {
        const rawPath = url.slice(VELLUM_FILE_LINK_PREFIX.length)
        const path = (() => {
          try {
            return decodeURIComponent(rawPath)
          } catch {
            return rawPath
          }
        })()
        const resolved =
          resolvePageNameToPath(path, sameFolderMdFiles, currentFilePath) !== ""
        const el = editor.getElementByKey(nodeKey)
        if (el instanceof HTMLAnchorElement) {
          if (resolved) {
            el.classList.remove(UNRESOLVED_CLASS)
          } else {
            el.classList.add(UNRESOLVED_CLASS)
          }
        }
      }
    }

    applyUnresolvedStyles()

    return editor.registerUpdateListener(() => {
      applyUnresolvedStyles()
    })
  }, [editor, sameFolderMdFiles, currentFilePath])

  return null
}
