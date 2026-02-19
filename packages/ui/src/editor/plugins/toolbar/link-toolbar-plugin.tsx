"use client"

import { useCallback, useEffect, useState } from "react"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"
import {
  $isRangeSelection,
  BaseSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_MODIFIER_COMMAND,
} from "lexical"
import { LinkIcon } from "lucide-react"

import { useFloatingLinkContext } from "../../context/floating-link-context"
import { useToolbarContext } from "../../context/toolbar-context"
import { useUpdateToolbarHandler } from "../../editor-hooks/use-update-toolbar"
import { getSelectedNode } from "../../utils/get-selected-node"
import { Toggle } from "../../../toggle"

export function LinkToolbarPlugin() {
  const { activeEditor } = useToolbarContext()
  const { setIsLinkEditMode, openLinkDialog } = useFloatingLinkContext()
  const [isLink, setIsLink] = useState(false)

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar)

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload
        const { code, ctrlKey, metaKey } = event

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault()
          if (!isLink) {
            openLinkDialog((url) => {
              activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
            })
          } else {
            setIsLinkEditMode(false)
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_NORMAL
    )
  }, [activeEditor, isLink, setIsLinkEditMode, openLinkDialog])

  const insertLink = useCallback(() => {
    if (!isLink) {
      openLinkDialog((url) => {
        activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
      })
    } else {
      setIsLinkEditMode(false)
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [activeEditor, isLink, setIsLinkEditMode, openLinkDialog])

  return (
    <Toggle
      variant={"outline"}
      size="sm"
      className="!h-8 !w-8"
      aria-label="Toggle link"
      onClick={insertLink}
    >
      <LinkIcon className="h-4 w-4" />
    </Toggle>
  )
}
