"use client"

import * as React from "react"
import { JSX, useCallback, useMemo, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { $createHeadingNode } from "@lexical/rich-text"
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list"
import { INSERT_TABLE_COMMAND } from "@lexical/table"
import { $createQuoteNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  TextNode,
} from "lexical"
import { createPortal } from "react-dom"
import {
  ColumnsIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  LayoutIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  TableIcon,
} from "lucide-react"

import { Command, CommandItem, CommandList } from "../../command"
import { INSERT_COLUMNS_COMMAND } from "./columns-plugin"
import { INSERT_HORIZONTAL_SECTION_BLOCK_COMMAND } from "./horizontal-section-block-plugin"

type SlashCommandKey =
  | "table"
  | "h1"
  | "h2"
  | "h3"
  | "bulleted-list"
  | "numbered-list"
  | "quote"
  | "columns-2"
  | "columns-3"
  | "columns-4"
  | "horizontal-section"

const SLASH_COMMANDS: ReadonlyArray<{
  key: SlashCommandKey
  label: string
  icon: JSX.Element
}> = [
  { key: "table", label: "Table", icon: <TableIcon className="size-4" /> },
  { key: "h1", label: "Heading 1", icon: <Heading1Icon className="size-4" /> },
  { key: "h2", label: "Heading 2", icon: <Heading2Icon className="size-4" /> },
  { key: "h3", label: "Heading 3", icon: <Heading3Icon className="size-4" /> },
  {
    key: "bulleted-list",
    label: "Bulleted List",
    icon: <ListIcon className="size-4" />,
  },
  {
    key: "numbered-list",
    label: "Numbered List",
    icon: <ListOrderedIcon className="size-4" />,
  },
  { key: "quote", label: "Quote", icon: <QuoteIcon className="size-4" /> },
  {
    key: "columns-2",
    label: "Columns 2",
    icon: <ColumnsIcon className="size-4" />,
  },
  {
    key: "columns-3",
    label: "Columns 3",
    icon: <ColumnsIcon className="size-4" />,
  },
  {
    key: "columns-4",
    label: "Columns 4",
    icon: <ColumnsIcon className="size-4" />,
  },
  {
    key: "horizontal-section",
    label: "Card section",
    icon: <LayoutIcon className="size-4" />,
  },
]

class SlashCommandOption extends MenuOption {
  key: SlashCommandKey
  label: string
  icon: JSX.Element

  constructor(key: SlashCommandKey, label: string, icon: JSX.Element) {
    super(label)
    this.key = key
    this.label = label
    this.icon = icon
  }
}

function filterSlashOptions(
  query: string | null
): SlashCommandOption[] {
  if (!query || query.trim() === "") {
    return SLASH_COMMANDS.map(
      (c) => new SlashCommandOption(c.key, c.label, c.icon)
    )
  }
  const lower = query.toLowerCase()
  return SLASH_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(lower)
  ).map((c) => new SlashCommandOption(c.key, c.label, c.icon))
}

export function SlashCommandMenuPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForSlashMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })

  const options = useMemo(
    () => filterSlashOptions(queryString),
    [queryString]
  )

  const onSelectOption = useCallback(
    (
      selectedOption: SlashCommandOption,
      textNodeContainingQuery: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const parent = textNodeContainingQuery?.getParent()
        if (textNodeContainingQuery) {
          textNodeContainingQuery.remove()
        }
        if (parent && $isElementNode(parent)) {
          parent.selectStart()
        }
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          closeMenu()
          return
        }
        const key = selectedOption.key
        if (key === "table") {
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: "3",
            rows: "3",
          })
        } else if (key === "h1") {
          $setBlocksType(selection, () => $createHeadingNode("h1"))
        } else if (key === "h2") {
          $setBlocksType(selection, () => $createHeadingNode("h2"))
        } else if (key === "h3") {
          $setBlocksType(selection, () => $createHeadingNode("h3"))
        } else if (key === "bulleted-list") {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        } else if (key === "numbered-list") {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        } else if (key === "quote") {
          $setBlocksType(selection, () => $createQuoteNode())
        } else if (key === "columns-2") {
          editor.dispatchCommand(INSERT_COLUMNS_COMMAND, { columnCount: 2 })
        } else if (key === "columns-3") {
          editor.dispatchCommand(INSERT_COLUMNS_COMMAND, { columnCount: 3 })
        } else if (key === "columns-4") {
          editor.dispatchCommand(INSERT_COLUMNS_COMMAND, { columnCount: 4 })
        } else if (key === "horizontal-section") {
          editor.dispatchCommand(INSERT_HORIZONTAL_SECTION_BLOCK_COMMAND, undefined)
        }
        closeMenu()
      })
    },
    [editor]
  )

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForSlashMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        if (options.length === 0) {
          return null
        }
        const portalTarget =
          typeof document !== "undefined"
            ? document.body
            : anchorElementRef.current
        if (!portalTarget) {
          return null
        }
        return createPortal(
          <div className="fixed left-1/2 top-[20%] z-100 w-56 -translate-x-1/2 rounded-md border border-border bg-popover shadow-md overflow-auto max-h-80">
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
                {options.map((option, index) => (
                  <CommandItem
                    key={option.key}
                    value={option.label}
                    onSelect={() => {
                      selectOptionAndCleanUp(option)
                    }}
                    className={`flex items-center gap-2 ${
                      selectedIndex === index ? "bg-accent" : ""
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </div>,
          portalTarget
        )
      }}
    />
  )
}
