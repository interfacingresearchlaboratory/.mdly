"use client"

import { JSX, useCallback, useMemo, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { TextNode } from "lexical"
import { createPortal } from "react-dom"
import { FileTextIcon } from "lucide-react"

import { $createBacklinkNode } from "../nodes/backlink-node"
import { useBacklinksContext } from "../context/backlinks-context"
import { Command, CommandItem, CommandList } from "../../command"

const BACKLINK_TRIGGER = "[["

// Match "[[" at end of text, with optional query (no "]" in query)
const BacklinkTriggerRegex = /\[\[([^\]]*)$/

function checkForBacklinkTrigger(text: string): MenuTextMatch | null {
  const match = BacklinkTriggerRegex.exec(text)
  if (match === null) return null
  const matchingString = match[1] ?? ""
  const replaceableString = BACKLINK_TRIGGER + matchingString
  return {
    leadOffset: match.index,
    matchingString,
    replaceableString,
  }
}

const MAX_OPTIONS = 15

class BacklinkMenuOption extends MenuOption {
  path: string
  pageName: string

  constructor(path: string, pageName: string) {
    super(pageName)
    this.path = path
    this.pageName = pageName
  }
}

export function BacklinksTypeaheadPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { sameFolderMdFiles } = useBacklinksContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const triggerFn = useCallback(
    (text: string) => checkForBacklinkTrigger(text),
    []
  )

  const options = useMemo(() => {
    const query = (queryString ?? "").toLowerCase().trim()
    const filtered = sameFolderMdFiles.filter((file) =>
      file.name.toLowerCase().includes(query)
    )
    return filtered.slice(0, MAX_OPTIONS).map(
      (file) =>
        new BacklinkMenuOption(
          file.path,
          file.name.replace(/\.[^.]+$/, "") // display name without extension
        )
    )
  }, [sameFolderMdFiles, queryString])

  const onSelectOption = useCallback(
    (
      selectedOption: BacklinkMenuOption,
      textNodeContainingQuery: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        if (!textNodeContainingQuery) {
          closeMenu()
          return
        }
        const replaceableString = BACKLINK_TRIGGER + (queryString ?? "")
        const text = textNodeContainingQuery.getTextContent()
        const index = text.indexOf(replaceableString)
        if (index === -1) {
          textNodeContainingQuery.replace(
            $createBacklinkNode(selectedOption.pageName, selectedOption.path)
          )
        } else if (index === 0 && text.length === replaceableString.length) {
          textNodeContainingQuery.replace(
            $createBacklinkNode(selectedOption.pageName, selectedOption.path)
          )
        } else {
          const splitResult = textNodeContainingQuery.splitText(index)
          const segmentNode = Array.isArray(splitResult) ? splitResult[1] : splitResult
          if (!segmentNode) return
          if (segmentNode.getTextContent().length > replaceableString.length) {
            segmentNode.splitText(replaceableString.length)
          }
          segmentNode.replace(
            $createBacklinkNode(selectedOption.pageName, selectedOption.path)
          )
        }
        closeMenu()
      })
    },
    [editor, queryString]
  )

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={triggerFn}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        const portalTarget = anchorElementRef.current
        if (!portalTarget) return null
        return createPortal(
          <div className="w-64 z-50 rounded-md border border-border bg-popover shadow-md overflow-auto max-h-80">
            <Command
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null && selectedIndex !== undefined
                      ? (selectedIndex - 1 + options.length) % options.length
                      : options.length - 1
                  )
                } else if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null && selectedIndex !== undefined
                      ? (selectedIndex + 1) % options.length
                      : 0
                  )
                }
              }}
            >
              <CommandList>
                {options.length > 0 ? (
                  options.map((option, index) => (
                    <CommandItem
                      key={option.key}
                      value={option.pageName}
                      onSelect={() => selectOptionAndCleanUp(option)}
                      className={`flex items-center gap-2 ${
                        selectedIndex === index ? "bg-accent" : ""
                      }`}
                    >
                      <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{option.pageName}</span>
                    </CommandItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No matching files in folder
                  </div>
                )}
              </CommandList>
            </Command>
          </div>,
          portalTarget
        )
      }}
    />
  )
}
