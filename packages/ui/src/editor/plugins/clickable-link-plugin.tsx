"use client"

import { $getSelection, $isRangeSelection } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"

/**
 * Makes links in the editor actually navigate when clicked.
 * Respects the anchor's target attribute (e.g. target="_blank" for external links
 * set by CustomLinkNode).
 */
export function ClickableLinkPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement !== null) {
        prevRootElement.removeEventListener("click", onClick)
      }
      if (rootElement !== null) {
        rootElement.addEventListener("click", onClick)
      }
    })

    function onClick(event: MouseEvent): void {
      const target = event.target
      if (!(target instanceof Node)) return
      const anchor = (target as Element).closest?.("a[href]")
      if (!(anchor instanceof HTMLAnchorElement)) return
      const href = anchor.href
      if (!href || href === "" || href.startsWith("javascript:")) return
      // Allow selection: if user has a non-collapsed range selection, don't navigate
      const hasSelection = editor.getEditorState().read(() => {
        const selection = $getSelection()
        return $isRangeSelection(selection) && !selection.isCollapsed()
      })
      if (hasSelection) return
      // Left click: open using the anchor's target (CustomLinkNode sets _blank for external)
      if (event.button === 0) {
        const targetAttr = anchor.target && anchor.target !== "_self" ? anchor.target : "_self"
        window.open(href, targetAttr, "noopener,noreferrer")
        event.preventDefault()
      }
    }
  }, [editor])

  return null
}
