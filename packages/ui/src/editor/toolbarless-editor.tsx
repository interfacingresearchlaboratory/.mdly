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

import {
  getEditorTheme,
  type TypographyConfig,
} from "./themes/editor-theme";
import { nodes } from "./nodes";
import { HORIZONTAL_RULE } from "./transformers/markdown-horizontal-rule-transformer";
import { SMART_SECTION } from "./transformers/markdown-smart-section-transformer";
import { SmartSectionPlugin } from "./plugins/smart-section-plugin";
import { ColumnsPlugin } from "./plugins/columns-plugin";
import { HorizontalSectionBlockPlugin } from "./plugins/horizontal-section-block-plugin";
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
import { MentionsContextProvider, type MentionEntity } from "./context/mentions-context";
import { MentionsPlugin } from "./plugins/mentions-plugin";
import { SlashCommandMenuPlugin } from "./plugins/slash-command-menu-plugin";
import { CodeBlockLanguagePlugin } from "./plugins/code-block-language-plugin";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { TabIndentationPlugin } from "./plugins/tab-indent-plugin";
import { ListExitPlugin } from "./plugins/list-exit-plugin";
import { ListNumberingPlugin } from "./plugins/list-numbering-plugin";
import { PlaceholderFormatPlugin } from "./plugins/placeholder-format-plugin";

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
  /** Mentionable entities for @mention dropdown; optional getHref and renderIcon for badge link and icon. */
  entities?: MentionEntity[];
  getHref?: (type: string, id: string) => string | undefined;
  renderIcon?: (type: string) => React.ReactNode;
  /** Optional typography overrides (letter spacing, font weight, document font) per block/format (e.g. from document settings). */
  typography?: TypographyConfig;
  /** When true, content is displayed but not editable (no onChange, no edit UI). */
  readOnly?: boolean;
};

const baseEditorConfig: Omit<InitialConfigType, "theme"> = {
  namespace: "ThemeDescriptionEditor",
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
  entities = [],
  getHref,
  renderIcon,
  typography,
  readOnly = false,
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
    ...baseEditorConfig,
    theme: getEditorTheme(typography ?? undefined),
    editable: !readOnly,
    ...(initialContent && isValidEditorState(initialContent)
      ? { editorState: JSON.stringify(initialContent) }
      : {}),
  };
  

  return (
    <div className={className}>
      <MentionsContextProvider entities={entities} getHref={getHref} renderIcon={renderIcon}>
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
                        <div
                          className="w-full pl-6"
                          ref={onRef}
                          style={
                            typography?.fontFamily || typography?.fontSize
                              ? {
                                  ...(typography.fontFamily && {
                                    fontFamily: typography.fontFamily,
                                  }),
                                  ...(typography.fontSize && {
                                    fontSize: typography.fontSize,
                                  }),
                                }
                              : undefined
                          }
                        >
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
                  {!readOnly && (
                    <>
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
                      <TabIndentationPlugin />
                      <SlashCommandMenuPlugin />
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
                      <DropInsertImagePlugin />
                      <HistoryPlugin />
                    </>
                  )}
                  <CodeHighlightPlugin />
                  <ListPlugin />
                  <CheckListPlugin />
                  <ListNumberingPlugin />
                  <ListExitPlugin />
                  <PlaceholderFormatPlugin />

                  <AutoLinkPlugin />
                  <LinkPlugin />
                  <ClickableLinkPlugin />
                  <ImagesPlugin />
                  <InlineImagePlugin />
                  <SmartSectionPlugin />
                  <ColumnsPlugin />
                  <HorizontalSectionBlockPlugin />
                  <MentionsPlugin />
                </div>
              </div>

              {!readOnly && (
                <OnChangePlugin
                  ignoreSelectionChange={true}
                  onChange={(editorState: EditorState) => {
                    onChange?.(editorState.toJSON());
                  }}
                />
              )}
            </CollaborationContextProvider>
          </LexicalComposer>
        </FloatingLinkContext>
      </MentionsContextProvider>
    </div>
  );
}
