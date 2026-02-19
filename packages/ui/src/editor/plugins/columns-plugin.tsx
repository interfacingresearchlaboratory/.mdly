"use client"

import { useEffect } from "react"
import type { JSX } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  $createParagraphNode,
} from "lexical"
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils"
import {
  $createColumnsNode,
  ColumnsNode,
  type ColumnsColumnCount,
} from "../nodes/columns-node"

export interface InsertColumnsPayload {
  columnCount: ColumnsColumnCount
}

export const INSERT_COLUMNS_COMMAND: LexicalCommand<InsertColumnsPayload> =
  createCommand("INSERT_COLUMNS_COMMAND")

export function ColumnsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ColumnsNode])) {
      throw new Error(
        "ColumnsPlugin: ColumnsNode not registered on editor"
      )
    }

    return mergeRegister(
      editor.registerCommand<InsertColumnsPayload>(
        INSERT_COLUMNS_COMMAND,
        (payload) => {
          const columnCount = payload?.columnCount ?? 2
          const columnsNode = $createColumnsNode({ columnCount })
          $insertNodes([columnsNode])
          if ($isRootOrShadowRoot(columnsNode.getParentOrThrow())) {
            $wrapNodeInElement(
              columnsNode,
              $createParagraphNode
            ).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
