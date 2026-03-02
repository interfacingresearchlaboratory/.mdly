"use client"

import type { JSX } from "react"
import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
} from "lexical"

import { insertImageFileFromDrop } from "./images-plugin"

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

export function DropInsertImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<DragEvent>(
      DROP_COMMAND,
      (event) => {
        const dataTransfer = event.dataTransfer
        if (!dataTransfer) return false

        // Ignore internal Lexical drag operations – let ImagesPlugin/InlineImagePlugin handle them
        if (dataTransfer.types.includes("application/x-lexical-drag")) {
          return false
        }

        const files = Array.from(dataTransfer.files || [])
        const imageFiles = files.filter(isImageFile)
        if (imageFiles.length === 0) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        const rootElement = editor.getRootElement()
        if (!rootElement) return false

        // Map drop point to a DOM range inside the editor, then let Lexical
        // derive a RangeSelection from that DOM selection.
        const range =
          document.caretRangeFromPoint?.(event.clientX, event.clientY) ||
          ((): Range | null => {
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return null
            return selection.getRangeAt(0)
          })()

        if (!range) return false

        const domSelection = window.getSelection()
        if (!domSelection) return false
        domSelection.removeAllRanges()
        domSelection.addRange(range)

        // Insert images at the computed selection
        editor.update(() => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return
          }
        })

        // Perform uploads / inserts outside the update block; each insert
        // will dispatch INSERT_IMAGE_COMMAND back into Lexical.
        imageFiles.forEach((file) => {
          void insertImageFileFromDrop(editor, file)
        })

        return true
      },
      COMMAND_PRIORITY_HIGH
    )
  }, [editor])

  return null
}


