"use client"

import * as React from "react"
import { JSX, useCallback, useMemo, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { TextNode, $setSelection } from "lexical"
import { createPortal } from "react-dom"

import { $createMentionNode } from "../nodes/mention-node"
import { useMentionsContext } from "../context/mentions-context"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../command"

const SUGGESTION_LIST_LENGTH_LIMIT = 15
const CHARS_BEYOND_SUGGESTION_THRESHOLD = 3

function formatTypeLabel(type: string): string {
  if (type.length === 0) return type
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

class MentionTypeaheadOption extends MenuOption {
  id: string
  type: string
  label: string

  constructor(id: string, type: string, label: string) {
    super(label)
    this.id = id
    this.type = type
    this.label = label
  }
}

export function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { entities, renderIcon } = useMentionsContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const options = useMemo(() => {
    const query = (queryString ?? "").trim().toLowerCase()
    const filtered = entities.filter((e) =>
      e.label.toLowerCase().includes(query)
    )

    if (filtered.length > 0) {
      const maxLabelLength = Math.max(...filtered.map((e) => e.label.length))
      if (query.length > maxLabelLength + CHARS_BEYOND_SUGGESTION_THRESHOLD) {
        return []
      }
    }

    return filtered
      .slice(0, SUGGESTION_LIST_LENGTH_LIMIT)
      .map((e) => new MentionTypeaheadOption(e.id, e.type, e.label))
  }, [entities, queryString])

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })
  const checkForAtTriggerMatch = useBasicTypeaheadTriggerMatch("@", {
    minLength: 0,
    allowWhitespace: true,
  })

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      if (slashMatch !== null) return null
      return checkForAtTriggerMatch(text, editor)
    },
    [checkForSlashTriggerMatch, checkForAtTriggerMatch, editor]
  )

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(
          selectedOption.id,
          selectedOption.type,
          selectedOption.label
        )
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode)
        }
        $setSelection(null)
        closeMenu()
      })
    },
    [editor]
  )

  const optionsByType = useMemo(() => {
    const map = new Map<string, MentionTypeaheadOption[]>()
    for (const opt of options) {
      const list = map.get(opt.type) ?? []
      list.push(opt)
      map.set(opt.type, list)
    }
    return map
  }, [options])

  const typeOrder = useMemo(() => {
    const seen = new Set<string>()
    const order: string[] = []
    for (const opt of options) {
      if (!seen.has(opt.type)) {
        seen.add(opt.type)
        order.push(opt.type)
      }
    }
    return order
  }, [options])

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        if (!anchorElementRef.current) {
          return null
        }

        const optionsCount = options.length
        let globalIndex = 0

        return createPortal(
          <div className="fixed z-50 w-64 max-h-80 overflow-auto bg-popover border border-border rounded-md shadow-md">
            <Command
              onKeyDown={(e) => {
                if (optionsCount === 0) return
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null
                      ? (selectedIndex - 1 + optionsCount) % optionsCount
                      : optionsCount - 1
                  )
                } else if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null
                      ? (selectedIndex + 1) % optionsCount
                      : 0
                  )
                }
              }}
            >
              <CommandList>
                {typeOrder.length > 0 ? (
                  typeOrder.map((type) => {
                    const typeOptions = optionsByType.get(type) ?? []
                    const typeIcon = renderIcon?.(type)
                    const sectionTitle = formatTypeLabel(type)
                    const startIndex = globalIndex
                    globalIndex += typeOptions.length

                    return (
                      <CommandGroup key={type}>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                          {sectionTitle}
                        </div>
                        {typeOptions.length > 0 ? (
                          typeOptions.map((option, index) => {
                            const idx = startIndex + index
                            const isSelected = selectedIndex === idx
                            return (
                              <CommandItem
                                key={option.key}
                                value={option.label}
                                onSelect={() => {
                                  selectOptionAndCleanUp(option)
                                }}
                                className={`flex items-center gap-2 ${
                                  isSelected ? "bg-accent" : ""
                                }`}
                              >
                                {typeIcon !== undefined && typeIcon !== null ? (
                                  <span className="flex-shrink-0 text-muted-foreground [&>svg]:size-3.5">
                                    {typeIcon}
                                  </span>
                                ) : null}
                                <span className="truncate">{option.label}</span>
                              </CommandItem>
                            )
                          })
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No results
                          </div>
                        )}
                      </CommandGroup>
                    )
                  })
                ) : (
                  <CommandGroup>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {entities.length === 0
                        ? "No mentionable items"
                        : "No matches"}
                    </div>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>,
          anchorElementRef.current
        )
      }}
    />
  )
}
