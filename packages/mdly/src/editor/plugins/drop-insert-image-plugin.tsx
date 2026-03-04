"use client"

import type { JSX } from "react"
import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
  PASTE_COMMAND,
} from "lexical"

import { INSERT_IMAGE_COMMAND, insertImageFileFromDrop } from "./images-plugin"
import { useImageUploadConfig } from "../context/image-upload-context"

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

function processImageFiles(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  files: File[],
  config: ReturnType<typeof useImageUploadConfig>
): void {
  if (!config) {
    files.forEach((file) => {
      void insertImageFileFromDrop(editor, file)
    })
    return
  }
  void (async () => {
    for (const file of files) {
      try {
        const url = await config.upload(file)
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: "" })
      } catch (err) {
        config.onUploadError?.(err instanceof Error ? err : new Error(String(err)))
      }
    }
  })()
}

export function DropInsertImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const imageUploadConfig = useImageUploadConfig()

  useEffect(() => {
    const dropUnregister = editor.registerCommand<DragEvent>(
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

        processImageFiles(editor, imageFiles, imageUploadConfig)
        return true
      },
      COMMAND_PRIORITY_HIGH
    )

    const pasteUnregister = editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const files = event.clipboardData?.files
        if (!files?.length) return false
        const imageFiles = Array.from(files).filter(isImageFile)
        if (imageFiles.length === 0) return false

        event.preventDefault()
        processImageFiles(editor, imageFiles, imageUploadConfig)
        return true
      },
      COMMAND_PRIORITY_HIGH
    )

    return () => {
      dropUnregister()
      pasteUnregister()
    }
  }, [editor, imageUploadConfig])

  return null
}


