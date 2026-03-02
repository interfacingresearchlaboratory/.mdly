"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect, useRef } from "react"
import {
  $getRoot,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
  $createTextNode,
  type TextNode,
  type NodeKey,
  type LexicalNode,
} from "lexical"

import { CustomLinkNode } from "../../editor/nodes/link-node"
import {
  VELLUM_FILE_LINK_PREFIX,
  WIKI_FILE_LINK_REGEX,
} from "../transformers/markdown-wiki-file-link-transformer"

/** Regex with global and Unicode flags for matching [[path]] in any text (supports Unicode filenames). */
const WIKI_LINK_RE = new RegExp(WIKI_FILE_LINK_REGEX.source, "gu")

function runNormalization(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  keysToFix: NodeKey[]
): void {
  if (keysToFix.length === 0) return
  editor.update(
    () => {
      const re = new RegExp(WIKI_FILE_LINK_REGEX.source, "gu")
      for (const key of keysToFix) {
        const node = $getNodeByKey(key)
        if (!node || !$isTextNode(node)) continue
        const current = node as TextNode
        for (;;) {
          const text = current.getTextContent()
          re.lastIndex = 0
          let lastMatch: {
            start: number
            end: number
            path: string
          } | null = null
          let m: RegExpExecArray | null
          while ((m = re.exec(text)) !== null) {
            const path = m[1]?.trim()
            if (path)
              lastMatch = {
                start: m.index,
                end: m.index + m[0].length,
                path,
              }
          }
          if (!lastMatch) break
          const { start, end, path } = lastMatch
          const len = end - start
          const splitResult = current.splitText(start)
          const rightNode: TextNode | null = Array.isArray(splitResult)
            ? splitResult[1] ?? splitResult[0] ?? null
            : splitResult
          if (!rightNode) break
          rightNode.splitText(len)
          const linkNode = new CustomLinkNode(
            `${VELLUM_FILE_LINK_PREFIX}${path}`
          )
          linkNode.append($createTextNode(path))
          rightNode.replace(linkNode)
        }
      }
    },
    { discrete: true }
  )
}

/**
 * One-time normalization: converts plain-text wiki file links [[path]] in
 * TextNodes into CustomLinkNode (vellum-file:path) so they are clickable.
 * Runs after a short delay and also on the first editor update that has
 * matches, so content in tables (and other late-mounted nodes) is covered.
 */
export function NormalizeWikiFileLinksPlugin(): null {
  const [editor] = useLexicalComposerContext()
  const hasNormalized = useRef(false)

  useEffect(() => {
    function collectKeys(editorState: import("lexical").EditorState): NodeKey[] {
      const keysToFix: NodeKey[] = []
      editorState.read(() => {
        const root = $getRoot()
        function visit(node: LexicalNode): void {
          if ($isTextNode(node)) {
            WIKI_LINK_RE.lastIndex = 0
            if (WIKI_LINK_RE.test(node.getTextContent())) keysToFix.push(node.getKey())
            return
          }
          if ($isElementNode(node)) {
            for (const child of node.getChildren()) visit(child)
          }
        }
        visit(root)
      })
      return keysToFix
    }

    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      if (hasNormalized.current) return
      const keysToFix = collectKeys(editorState)
      if (keysToFix.length === 0) return
      hasNormalized.current = true
      runNormalization(editor, keysToFix)
      removeListener()
    })

    const timeoutId = setTimeout(() => {
      if (hasNormalized.current) return
      const keysToFix = collectKeys(editor.getEditorState())
      if (keysToFix.length > 0) {
        hasNormalized.current = true
        runNormalization(editor, keysToFix)
      }
      removeListener()
    }, 150)

    return () => {
      clearTimeout(timeoutId)
      removeListener()
    }
  }, [editor])

  return null
}
