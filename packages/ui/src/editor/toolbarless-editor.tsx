"use client";

import { useState } from "react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { CollaborationContextProvider } from "./context/collaboration-context";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "./plugins/clickable-link-plugin";
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";

import { editorTheme } from "./themes/editor-theme";
import { nodes } from "./nodes";
import { HORIZONTAL_RULE } from "./transformers/markdown-horizontal-rule-transformer";
import { SMART_SECTION } from "./transformers/markdown-smart-section-transformer";
import { SmartSectionPlugin } from "./plugins/smart-section-plugin";
import { ContentEditable } from "./editor-ui/content-editable";
import { DraggableBlockPlugin } from "./plugins/draggable-block-plugin";
import { TableActionMenuPlugin } from "./plugins/table-action-menu-plugin";
import { TableCellResizerPlugin } from "./plugins/table-cell-resizer-plugin";
import { TableHoverActionsPlugin } from "./plugins/table-hover-actions-plugin";
import { FloatingTextFormatToolbarPlugin } from "./plugins/floating-text-format-plugin";
import { ImagesPlugin } from "./plugins/images-plugin";
import { InlineImagePlugin } from "./plugins/inline-image-plugin";
import { AutoLinkPlugin } from "./plugins/auto-link-plugin";
import { DropInsertImagePlugin } from "./plugins/drop-insert-image-plugin";
import { FloatingLinkContext } from "./context/floating-link-context";
import { MentionsContextProvider } from "./context/mentions-context";
import { MentionsPlugin } from "./plugins/mentions-plugin";
import { SlashCommandMenuPlugin } from "./plugins/slash-command-menu-plugin";
import { CodeBlockLanguagePlugin } from "./plugins/code-block-language-plugin";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { TabIndentationPlugin } from "./plugins/tab-indent-plugin";
import { ListNumberingPlugin } from "./plugins/list-numbering-plugin";

type Project = {
  _id: string;
  title: string;
};

type Task = {
  _id: string;
  title: string;
};

/** Accepts Lexical state or a looser JSON shape (e.g. from API); validated at runtime. */
type InitialContentInput = SerializedEditorState | { root?: unknown };

type ToolbarlessEditorProps = {
  /**
   * Controls when the Lexical editor is (re)initialized.
   * Change this value to intentionally reset the editor (e.g. switching entity id,
   * applying a template, clearing content).
   *
   * Important: do NOT tie this to per-keystroke state updates.
   */
  resetKey?: string | number;
  initialContent?: InitialContentInput;
  placeholder?: string;
  className?: string;
  onChange?: (content: SerializedEditorState) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  projects?: Project[] | null;
  tasks?: Task[] | null;
};

const editorConfig: InitialConfigType = {
  namespace: "ThemeDescriptionEditor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

/**
 * Validates that the editor state has a valid root with at least one child.
 * Lexical requires the root node to never be empty.
 */
function isValidEditorState(state: InitialContentInput | undefined): boolean {
  if (!state?.root) return false;
  const root = state.root as { children?: unknown };
  // Check if root has children array with at least one child
  if (Array.isArray(root.children) && root.children.length > 0) {
    return true;
  }
  // Check if root.children exists but is empty
  return false;
}

/**
 * Toolbar-less Lexical editor wrapper for theme descriptions.
 * Uses the same theme, nodes and core plugins as the main editor,
 * but omits the top toolbar and block-insert controls.
 */
export function ToolbarlessEditor({
  resetKey,
  initialContent,
  placeholder = "Add a description…",
  className,
  onChange,
  onFocus,
  onBlur,
  projects,
  tasks,
}: ToolbarlessEditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  // Only set editorState if initialContent is valid (has root with children)
  // Otherwise, let Lexical initialize with a default empty state
  const initialConfig: InitialConfigType = {
    ...editorConfig,
    ...(initialContent && isValidEditorState(initialContent)
      ? { editorState: JSON.stringify(initialContent) }
      : {}),
  };

  return (
    <div className={className}>
      <MentionsContextProvider projects={projects} tasks={tasks}>
        <FloatingLinkContext>
          <LexicalComposer
            key={String(resetKey ?? "toolbarless-editor")}
            initialConfig={initialConfig}>
            <CollaborationContextProvider isCollabActive={false}>
              <div className="relative flex flex-col">
                {/* Negative left margin + internal padding so drag handles sit
              in the gutter and not on top of the text */}
                <div className="relative -ml-6">
                  <RichTextPlugin
                    contentEditable={
                      <div className="w-full">
                        <div className="w-full pl-6" ref={onRef}>
                          <ContentEditable
                            placeholder={placeholder}
                            className="ContentEditable__root relative block min-h-[160px] w-full overflow-visible focus:outline-none"
                            placeholderClassName="text-muted-foreground pointer-events-none absolute top-0 left-0 pl-6 pt-1 text-sm select-none"
                            onFocus={() => onFocus?.()}
                            onBlur={() => onBlur?.()}
                          />
                        </div>
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />

                  <TablePlugin />
                  <TableActionMenuPlugin anchorElem={floatingAnchorElem} />
                  <TableCellResizerPlugin />
                  <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
                  <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                  <FloatingTextFormatToolbarPlugin
                    anchorElem={floatingAnchorElem}
                  />
                  {floatingAnchorElem && (
                    <CodeBlockLanguagePlugin anchorElem={floatingAnchorElem} />
                  )}
                  <CodeHighlightPlugin />
                  <ListPlugin />
                  <CheckListPlugin />
                  <ListNumberingPlugin />
                  <TabIndentationPlugin />

                  <AutoLinkPlugin />
                  <LinkPlugin />
                  <ClickableLinkPlugin />
                  <HistoryPlugin />
                  <ImagesPlugin />
                  <InlineImagePlugin />
                  <DropInsertImagePlugin />
                  <SmartSectionPlugin />
                  <SlashCommandMenuPlugin />
                  <MentionsPlugin />
                  <MarkdownShortcutPlugin
                    transformers={[
                      CHECK_LIST,
                      HORIZONTAL_RULE,
                      SMART_SECTION, // Uses >>section to avoid conflict with blockquote transformer (>)
                      ...ELEMENT_TRANSFORMERS,
                      ...MULTILINE_ELEMENT_TRANSFORMERS,
                      ...TEXT_FORMAT_TRANSFORMERS,
                      ...TEXT_MATCH_TRANSFORMERS,
                    ]}
                  />
                </div>
              </div>

              <OnChangePlugin
                ignoreSelectionChange={true}
                onChange={(editorState: EditorState) => {
                  const next = editorState.toJSON();
                  onChange?.(next);
                }}
              />
            </CollaborationContextProvider>
          </LexicalComposer>
        </FloatingLinkContext>
      </MentionsContextProvider>
    </div>
  );
}
