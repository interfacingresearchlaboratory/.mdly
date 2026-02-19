import * as React from "react"
import { JSX, useCallback, useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoLinkPlugin } from "../plugins/auto-link-plugin"
import { ClickableLinkPlugin } from "../plugins/clickable-link-plugin"
import { AutocompletePlugin } from "../plugins/autocomplete-plugin"
import { MentionsPlugin } from "../plugins/mentions-plugin"
import { SharedAutocompleteContext } from "../context/shared-autocomplete-context"
import { MentionsContextProvider, useMentionsContext } from "../context/mentions-context"
import type { LexicalEditor, NodeKey } from "lexical"
import { $createParagraphNode, $getNodeByKey } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isSmartSectionNode } from "../nodes/smart-section-node"
import { ContentEditable } from "./content-editable"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { ImagesPlugin } from "../plugins/images-plugin"
import { InlineImagePlugin } from "../plugins/inline-image-plugin"
import { DropInsertImagePlugin } from "../plugins/drop-insert-image-plugin"
import { HORIZONTAL_RULE } from "../transformers/markdown-horizontal-rule-transformer"
import { SlashCommandMenuPlugin } from "../plugins/slash-command-menu-plugin"
import { ColumnsPlugin } from "../plugins/columns-plugin"

export default function SmartSectionComponent({
  headerEditor,
  contentEditor,
  isExpanded: initialIsExpanded,
  nodeKey,
}: {
  headerEditor: LexicalEditor
  contentEditor: LexicalEditor
  isExpanded: boolean
  nodeKey: NodeKey
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { projects, tasks } = useMentionsContext()
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded)

  // Sync state with node
  useEffect(() => {
    setIsExpanded(initialIsExpanded)
  }, [initialIsExpanded])

  const toggleExpanded = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isSmartSectionNode(node)) {
        const newExpanded = !node.getIsExpanded()
        node.setIsExpanded(newExpanded)
        setIsExpanded(newExpanded)
      }
    })
  }, [editor, nodeKey])

  const deleteSection = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isSmartSectionNode(node)) {
        const paragraph = $createParagraphNode()
        node.replace(paragraph)
        paragraph.selectStart()
      }
    })
  }, [editor, nodeKey])

  return (
    <div className="EditorTheme__smartSection border border-border rounded-lg mb-4 overflow-hidden">
      {/* Header */}
      <div className="EditorTheme__smartSectionHeader group/header flex items-center gap-2 px-2 py-1">
        <div
          className="flex-shrink-0 cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            toggleExpanded()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggleExpanded()
            }
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div
          className="flex-1 min-w-0 cursor-text"
          onClick={(e) => {
            e.stopPropagation()
            headerEditor.getRootElement()?.focus()
          }}
        >
          <LexicalNestedComposer initialEditor={headerEditor}>
            <SharedAutocompleteContext>
              <MentionsContextProvider projects={projects} tasks={tasks}>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      placeholder=""
                      className="EditorTheme__smartSectionHeaderEditable outline-none min-h-[1.5rem] cursor-text"
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <AutoFocusPlugin />
                <HistoryPlugin />
                <LinkPlugin />
                <AutoLinkPlugin />
                <ClickableLinkPlugin />
                <AutocompletePlugin />
                <MentionsPlugin />
              </MentionsContextProvider>
            </SharedAutocompleteContext>
          </LexicalNestedComposer>
        </div>
        <div
          className="flex-shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity cursor-pointer hover:bg-muted/50 rounded p-1"
          onClick={deleteSection}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              deleteSection()
            }
          }}
          title="Delete section"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          className="EditorTheme__smartSectionContent animate-accordion-down overflow-hidden"
          onClick={(e) => {
            // Stop propagation so clicking the editor doesn't toggle expand
            e.stopPropagation()
          }}
        >
          <div className="border-t border-border">
            <LexicalNestedComposer initialEditor={contentEditor}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    placeholder=""
                    className="EditorTheme__smartSectionContentEditable outline-none min-h-[100px] w-full px-4 py-3"
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <TablePlugin />
              <ListPlugin />
              <CheckListPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ClickableLinkPlugin />
              <ImagesPlugin />
              <InlineImagePlugin />
              <DropInsertImagePlugin />
              <MarkdownShortcutPlugin
                transformers={[
                  CHECK_LIST,
                  HORIZONTAL_RULE,
                  ...ELEMENT_TRANSFORMERS,
                  ...MULTILINE_ELEMENT_TRANSFORMERS,
                  ...TEXT_FORMAT_TRANSFORMERS,
                  ...TEXT_MATCH_TRANSFORMERS,
                ]}
              />
              <SlashCommandMenuPlugin />
              <ColumnsPlugin />
            </LexicalNestedComposer>
          </div>
        </div>
      )}
    </div>
  )
}
