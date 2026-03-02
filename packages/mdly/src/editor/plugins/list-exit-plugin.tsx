"use client"

import {
  $getListDepth,
  $isListItemNode,
  $isListNode,
  REMOVE_LIST_COMMAND,
  type ListItemNode,
} from "@lexical/list"
import { $findMatchingParent, mergeRegister } from "@lexical/utils"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical"
import { useEffect } from "react"
import type { JSX } from "react"

function $isEmptyListItem(listItem: ListItemNode): boolean {
  const size = listItem.getChildrenSize()
  if (size === 0) return true
  const children = listItem.getChildren()
  return children.every(
    (node) => $isTextNode(node) && node.getTextContent().trim() === ""
  )
}

export function ListExitPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent | null>(
        KEY_ENTER_COMMAND,
        () => {
          let handled = false
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return
            }
            const anchorNode = selection.anchor.getNode()
            const listItem = $findMatchingParent(anchorNode, $isListItemNode)
            if (listItem === null || !$isEmptyListItem(listItem)) {
              return
            }
            editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
            handled = true
          })
          return handled
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        OUTDENT_CONTENT_COMMAND,
        () => {
          let handled = false
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return
            }
            const anchorNode = selection.anchor.getNode()
            const listItem = $findMatchingParent(anchorNode, $isListItemNode)
            if (listItem === null || !$isEmptyListItem(listItem)) {
              return
            }
            const parent = listItem.getParent()
            const depth =
              parent !== null && $isListNode(parent)
                ? $getListDepth(parent)
                : 0
            if (depth === 0) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
              handled = true
            } else {
              listItem.setIndent(listItem.getIndent() - 1)
              handled = true
            }
          })
          return handled
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
