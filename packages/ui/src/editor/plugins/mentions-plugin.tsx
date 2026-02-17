"use client"

import * as React from "react"
import { JSX, useCallback, useMemo, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { TextNode, $setSelection } from "lexical"
import { createPortal } from "react-dom"
import { Layers, SquareSlash } from "lucide-react"

import { $createMentionNode } from "../nodes/mention-node"
import { useMentionsContext } from "../context/mentions-context"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../command"

const TRIGGERS = ["@"].join("")

// Simple regex to match @ followed by non-whitespace characters
const AtSignMentionsRegex = new RegExp(
  "(^|\\s|\\()(" + // Start of line, whitespace, or opening paren
    "[" +
    TRIGGERS +
    "]" +
    "([^\\s@]*)" + // Any non-whitespace, non-@ characters
    ")$"
)

// At most, 7 suggestions are shown (5 tasks + 2 projects)
const SUGGESTION_LIST_LENGTH_LIMIT = 7

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  const match = AtSignMentionsRegex.exec(text)
  if (match === null) {
    return null
  }

  // The strategy ignores leading whitespace but we need to know its length
  const maybeLeadingWhitespace = match[1] || ""
  const matchingString = match[3]

  if (matchingString && matchingString.length >= minMatchLength) {
    return {
      leadOffset: match.index + maybeLeadingWhitespace.length,
      matchingString,
      replaceableString: match[2] || "",
    }
  }
  return null
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 1)
}

class MentionTypeaheadOption extends MenuOption {
  id: string
  type: "project" | "task"
  label: string

  constructor(id: string, type: "project" | "task", label: string) {
    super(label)
    this.id = id
    this.type = type
    this.label = label
  }
}

export function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { projects, tasks } = useMentionsContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  // Filter and build options from projects and tasks
  const options = useMemo(() => {
    const allOptions: MentionTypeaheadOption[] = []

    // Filter tasks by query string
    const filteredTasks = (tasks || []).filter((task) => {
      if (!queryString) return true
      return (task.title || "Unnamed Task")
        .toLowerCase()
        .includes(queryString.toLowerCase())
    })

    // Add tasks (max 5)
    filteredTasks.slice(0, 5).forEach((task) => {
      allOptions.push(
        new MentionTypeaheadOption(
          task._id,
          "task",
          task.title || "Unnamed Task"
        )
      )
    })

    // Filter projects by query string
    const filteredProjects = (projects || []).filter((project) => {
      if (!queryString) return true
      return (project.title || "Unnamed Project")
        .toLowerCase()
        .includes(queryString.toLowerCase())
    })

    // Add projects (max 2)
    filteredProjects.slice(0, 2).forEach((project) => {
      allOptions.push(
        new MentionTypeaheadOption(
          project._id,
          "project",
          project.title || "Unnamed Project"
        )
      )
    })

    return allOptions.slice(0, SUGGESTION_LIST_LENGTH_LIMIT)
  }, [projects, tasks, queryString])

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  })

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      if (slashMatch !== null) {
        return null
      }
      return getPossibleQueryMatch(text)
    },
    [checkForSlashTriggerMatch, editor]
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
        // Move selection after the mention node
        $setSelection(null)
        closeMenu()
      })
    },
    [editor]
  )

  // Separate tasks and projects for rendering
  const taskOptions = options.filter((opt) => opt.type === "task")
  const projectOptions = options.filter((opt) => opt.type === "project")

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
        if (!anchorElementRef.current || options.length === 0) {
          return null
        }

        // Calculate which option is selected
        const selectedOption = selectedIndex !== null && selectedIndex !== undefined ? options[selectedIndex] : null

        return createPortal(
          <div className="fixed z-50 w-64 max-h-80 overflow-auto bg-popover border border-border rounded-md shadow-md">
            <Command
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null
                      ? (selectedIndex - 1 + options.length) % options.length
                      : options.length - 1
                  )
                } else if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setHighlightedIndex(
                    selectedIndex !== null
                      ? (selectedIndex + 1) % options.length
                      : 0
                  )
                }
              }}
            >
              <CommandList>
                {/* Tasks Section */}
                <CommandGroup>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                    Tasks
                  </div>
                  {taskOptions.length > 0 ? (
                    taskOptions.map((option, index) => {
                      const globalIndex = index
                      const isSelected =
                        selectedIndex === globalIndex &&
                        selectedOption?.type === "task"
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
                          <SquareSlash
                            size={14}
                            className="flex-shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      )
                    })
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No tasks found
                    </div>
                  )}
                </CommandGroup>

                {/* Projects Section */}
                <CommandGroup>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t border-b border-border">
                    Projects
                  </div>
                  {projectOptions.length > 0 ? (
                    projectOptions.map((option, index) => {
                      const globalIndex = taskOptions.length + index
                      const isSelected =
                        selectedIndex === globalIndex &&
                        selectedOption?.type === "project"
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
                          <Layers
                            size={14}
                            className="flex-shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      )
                    })
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No projects found
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>,
          anchorElementRef.current
        )
      }}
    />
  )
}
