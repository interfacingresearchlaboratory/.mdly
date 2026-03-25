"use client"

import { useEffect } from "react"
import type { JSX } from "react"
import { $getSelection, $insertNodes, $isRangeSelection } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { $createExcalidrawEmbedNode } from "../nodes/excalidraw-embed-node"
import {
  extractExcalidrawUrlFromEmbedHtml,
  extractSingleUrlText,
  isLikelyExcalidrawSceneUrl,
  toExcalidrawEmbedUrl,
} from "../utils/excalidraw"

export function ExcalidrawPasteEmbedPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const root = editor.getRootElement()
    if (!root) return undefined

    const handlePaste = (event: ClipboardEvent) => {
      const html = event.clipboardData?.getData("text/html") ?? ""
      const text = event.clipboardData?.getData("text/plain") ?? ""

      const embedUrlFromHtml = html ? extractExcalidrawUrlFromEmbedHtml(html) : null
      const sourceUrlFromHtml = embedUrlFromHtml && isLikelyExcalidrawSceneUrl(embedUrlFromHtml)
        ? embedUrlFromHtml
        : null

      const singleUrl = embedUrlFromHtml ? null : extractSingleUrlText(text)
      const sourceUrlFromText =
        singleUrl && isLikelyExcalidrawSceneUrl(singleUrl) ? singleUrl : null

      const sourceUrl = sourceUrlFromHtml ?? sourceUrlFromText
      if (!sourceUrl) return

      const embedUrl = toExcalidrawEmbedUrl(sourceUrl)
      if (!embedUrl) return

      event.preventDefault()
      event.stopPropagation()

      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        const node = $createExcalidrawEmbedNode({ embedUrl, sourceUrl })
        $insertNodes([node])
      })
    }

    root.addEventListener("paste", handlePaste, true)
    return () => root.removeEventListener("paste", handlePaste, true)
  }, [editor])

  return null
}
