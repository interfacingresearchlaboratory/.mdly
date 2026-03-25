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
import type { LexicalEditor, NodeKey } from "lexical"
import { $createParagraphNode, $getNodeByKey } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isSmartSectionNode } from "../nodes/smart-section-node"
import { ContentEditable } from "./content-editable"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { ListExitPlugin } from "../plugins/list-exit-plugin"
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
import { FloatingTextFormatToolbarPlugin } from "../plugins/floating-text-format-plugin"
import { ExcalidrawPasteEmbedPlugin } from "../plugins/excalidraw-paste-embed-plugin"
import { cn } from "../../lib/utils"

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
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded)
  const [headerAnchorElem, setHeaderAnchorElem] = useState<HTMLDivElement | null>(null)
  const [contentAnchorElem, setContentAnchorElem] = useState<HTMLDivElement | null>(null)

  // Sync state with node
  useEffect(() => {
    setIsExpanded(initialIsExpanded)
  }, [initialIsExpanded])

  const toggleExpanded = useCallback((nextExpanded?: boolean) => {
    const newExpanded = nextExpanded ?? !isExpanded
    // Update local UI state first so collapse/expand responds immediately.
    setIsExpanded(newExpanded)
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isSmartSectionNode(node)) {
        node.setIsExpanded(newExpanded)
      }
    })
  }, [editor, isExpanded, nodeKey])

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
    <div className="EditorTheme__smartSection border border-border rounded-lg mb-4 overflow-visible">
      {/* Header */}
      <div className="EditorTheme__smartSectionHeader group/header flex items-center gap-2 px-2 py-1">
        <div
          className="flex-shrink-0 cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleExpanded()
          }}
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
          <div ref={setHeaderAnchorElem} className="relative">
            <LexicalNestedComposer initialEditor={headerEditor}>
              <SharedAutocompleteContext>
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
                <FloatingTextFormatToolbarPlugin anchorElem={headerAnchorElem} />
              </SharedAutocompleteContext>
            </LexicalNestedComposer>
          </div>
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
      <div
        className={cn(
          "EditorTheme__smartSectionContent grid overflow-visible transition-[grid-template-rows,opacity] duration-250 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
        )}
        onClick={(e) => {
          // Stop propagation so clicking the editor doesn't toggle expand
          e.stopPropagation()
        }}
      >
        <div className="overflow-hidden border-t border-border">
          <div ref={setContentAnchorElem} className="relative">
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
              <ListExitPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ClickableLinkPlugin />
              <ImagesPlugin />
              <InlineImagePlugin />
              <DropInsertImagePlugin />
              <MentionsPlugin />
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
              <ExcalidrawPasteEmbedPlugin />
              <SlashCommandMenuPlugin />
              <ColumnsPlugin />
              <FloatingTextFormatToolbarPlugin anchorElem={contentAnchorElem} />
            </LexicalNestedComposer>
          </div>
        </div>
      </div>
    </div>
  )
}
