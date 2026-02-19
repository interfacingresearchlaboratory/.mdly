"use client"

import { useEffect } from "react"
import type { JSX } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $createParagraphNode,
} from "lexical"
import { mergeRegister } from "@lexical/utils"
import {
  $createHorizontalSectionBlockNode,
  HorizontalSectionBlockNode,
} from "../nodes/horizontal-section-block-node"

export type InsertHorizontalSectionBlockPayload = void | Record<string, never>

export const INSERT_HORIZONTAL_SECTION_BLOCK_COMMAND: LexicalCommand<InsertHorizontalSectionBlockPayload> =
  createCommand("INSERT_HORIZONTAL_SECTION_BLOCK_COMMAND")

export function HorizontalSectionBlockPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([HorizontalSectionBlockNode])) {
      throw new Error(
        "HorizontalSectionBlockPlugin: HorizontalSectionBlockNode not registered on editor"
      )
    }

    return mergeRegister(
      editor.registerCommand<InsertHorizontalSectionBlockPayload>(
        INSERT_HORIZONTAL_SECTION_BLOCK_COMMAND,
        () => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return false
          const anchorNode = selection.anchor.getNode()
          let block: ReturnType<typeof anchorNode.getTopLevelElementOrThrow>
          try {
            block = anchorNode.getTopLevelElementOrThrow()
          } catch {
            return false
          }
          if (!$isElementNode(block) || block.isInline()) return false
          const node = $createHorizontalSectionBlockNode()
          block.replace(node)
          const nextParagraph = $createParagraphNode()
          node.insertAfter(nextParagraph)
          nextParagraph.selectStart()
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
