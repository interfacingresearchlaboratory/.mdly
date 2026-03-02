"use client"

import { $getSelection, $isRangeSelection } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react"

import { useFileLinkContext } from "../context/file-link-context"
import { VELLUM_FILE_PATH_ATTR } from "../nodes/link-node"

/**
 * Makes links in the editor actually navigate when clicked.
 * Respects the anchor's target attribute (e.g. target="_blank" for external links
 * set by CustomLinkNode).
 * Wiki-style file links [[filename]] use vellum-file: URL; if onFileLinkClick is
 * provided (e.g. by desktop app), those clicks are delegated instead of opening in browser.
 */
export function ClickableLinkPlugin(): null {
  const [editor] = useLexicalComposerContext()
  const { onFileLinkClick } = useFileLinkContext()

  useEffect(() => {
    return editor.registerRootListener((rootElement, prevRootElement) => {
      const opts: AddEventListenerOptions = { capture: true }
      if (prevRootElement !== null) {
        prevRootElement.removeEventListener("click", onClick, opts)
      }
      if (rootElement !== null) {
        rootElement.addEventListener("click", onClick, opts)
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
      if (event.button !== 0) return

      // Wiki-style file link: delegate to host if handler is provided
      const dataPath = anchor.getAttribute(VELLUM_FILE_PATH_ATTR)
      if (dataPath !== null && dataPath !== "" && onFileLinkClick) {
        event.preventDefault()
        const path = (() => {
          try {
            return decodeURIComponent(dataPath)
          } catch {
            return dataPath
          }
        })()
        onFileLinkClick(path)
        return
      }
      const prefixIndex = href.indexOf("vellum-file:")
      if (prefixIndex !== -1 && onFileLinkClick) {
        event.preventDefault()
        const rawPath = href.slice(prefixIndex + "vellum-file:".length)
        const path = (() => {
          try {
            return decodeURIComponent(rawPath)
          } catch {
            return rawPath
          }
        })()
        onFileLinkClick(path)
        return
      }

      // Default: open using the anchor's target (CustomLinkNode sets _blank for external)
      const targetAttr = anchor.target && anchor.target !== "_self" ? anchor.target : "_self"
      window.open(href, targetAttr, "noopener,noreferrer")
      event.preventDefault()
    }
  }, [editor, onFileLinkClick])

  return null
}
