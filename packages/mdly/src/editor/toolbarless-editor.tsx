"use client";

import { useState, type ReactNode } from "react";
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
import type { Transformer } from "@lexical/markdown";
import { ClickableLinkPlugin } from "./plugins/clickable-link-plugin";
import { $generateNodesFromDOM } from "@lexical/html";
import { marked } from "marked";
import { $getRoot } from "lexical";

import {
  getEditorTheme,
  type TypographyConfig,
} from "./themes/editor-theme";
import { nodes } from "./nodes";
import { MARKDOWN_TRANSFORMERS } from "./markdown-transformers";
import { preprocessMarkdownTableEscapedNewlines } from "./transformers/markdown-table-transformer";
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
import {
  MentionsContextProvider,
  type MentionEntity,
  type Project,
  type Task,
} from "./context/mentions-context";
import { MentionsPlugin } from "./plugins/mentions-plugin";
import { SlashCommandMenuPlugin } from "./plugins/slash-command-menu-plugin";
import { CodeBlockLanguagePlugin } from "./plugins/code-block-language-plugin";
import { CodeHighlightPlugin } from "./plugins/code-highlight-plugin";
import { TabIndentationPlugin } from "./plugins/tab-indent-plugin";
import { ListNumberingPlugin } from "./plugins/list-numbering-plugin";
import { ListExitPlugin } from "./plugins/list-exit-plugin";
import { PlaceholderFormatPlugin } from "./plugins/placeholder-format-plugin";
import { PageBreakPlugin } from "./plugins/page-break-plugin";
import { FindInFilePlugin } from "./plugins/find-in-file-plugin";

/** Accepts Lexical state or a looser JSON shape (e.g. from API); validated at runtime. */
type InitialContentInput = SerializedEditorState | { root?: unknown };

export type ToolbarlessEditorProps = {
  /**
   * Controls when the Lexical editor is (re)initialized.
   * Change this value to intentionally reset the editor (e.g. switching entity id,
   * applying a template, clearing content).
   *
   * Important: do NOT tie this to per-keystroke state updates.
   */
  resetKey?: string | number;
  initialContent?: InitialContentInput;
  /** Raw markdown string to parse into rich text on first load. */
  initialMarkdown?: string;
  placeholder?: string;
  className?: string;
  onChange?: (content: SerializedEditorState) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Mentionable entities for @mention dropdown; optional getHref and renderIcon for badge link and icon. */
  entities?: MentionEntity[];
  getHref?: (type: string, id: string) => string | undefined;
  renderIcon?: (type: string) => ReactNode;
  projects?: Project[] | null;
  tasks?: Task[] | null;
  /** Optional typography overrides (letter spacing, font weight, document font) per block/format (e.g. from document settings). */
  typography?: TypographyConfig;
  /** Optional id for the editor content root (e.g. pane id) so table-of-contents can target this instance via data-pane-id. */
  tocContentId?: string;
  /** Optional main text colour (e.g. from page settings). Applied to the editor content wrapper. */
  textColor?: string;
  /**
   * Optional page margins in px. When set, the contenteditable is constrained to this box:
   * content is inset by top/right/bottom/left and users can only type within these bounds.
   */
  pageMargins?: { top: number; right: number; bottom: number; left: number };
  /** Page height in px for paper view pagination. When set with pageMargins, enables PageBreakPlugin. */
  pageHeight?: number;
  /** Gap between pages in px. Used with pageHeight for paper view. */
  pageGap?: number;
  /** Called when the computed page count changes (for container height snapping). */
  onPageCountChange?: (count: number) => void;
  /** When set, find-in-file (Cmd+F) is enabled for this editor; plugin only runs when this pane is focused. */
  findInFilePaneId?: string | null;
  /** When true, content is displayed but not editable (no onChange, no edit UI). */
  readOnly?: boolean;
  /** Optional Lexical nodes override/additions for wrapper/editor variants. */
  editorNodes?: InitialConfigType["nodes"];
  /** Optional markdown transformers override (defaults to core set). */
  markdownTransformers?: Transformer[];
  /** Optional preprocessor for initial markdown after core table newline normalization. */
  preprocessInitialMarkdown?: (markdown: string) => string;
  /** Optional wrapper for the editor tree (e.g. local-only providers). */
  wrapEditor?: (children: ReactNode) => ReactNode;
  /** Optional additional plugins injected by wrappers. */
  renderAdditionalPlugins?: (args: {
    floatingAnchorElem: HTMLDivElement | null;
    readOnly: boolean;
  }) => ReactNode;
};

/**
 * Validates that the editor state has a valid root with at least one child.
 * Lexical requires the root node to never be empty.
 */
function isValidEditorState(state: InitialContentInput | undefined): boolean {
  if (!state?.root) return false;
  const root = state.root as { children?: unknown };
  if (Array.isArray(root.children) && root.children.length > 0) {
    return true;
  }
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
  initialMarkdown,
  placeholder = "Add a description…",
  className,
  onChange,
  onFocus,
  onBlur,
  entities = [],
  getHref,
  renderIcon,
  projects = null,
  tasks = null,
  typography,
  tocContentId,
  textColor,
  pageMargins,
  pageHeight,
  pageGap = 32,
  onPageCountChange,
  findInFilePaneId = null,
  readOnly = false,
  editorNodes,
  markdownTransformers,
  preprocessInitialMarkdown,
  wrapEditor,
  renderAdditionalPlugins,
}: ToolbarlessEditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const initialConfig: InitialConfigType = {
    namespace: "ThemeDescriptionEditor",
    nodes: editorNodes ?? nodes,
    onError: (error: Error) => {
      console.error(error);
    },
    theme: getEditorTheme(typography ?? undefined),
    editable: !readOnly,
    ...(initialMarkdown !== undefined
      ? {
          editorState: (editor) => {
            const withTableBreaks = preprocessMarkdownTableEscapedNewlines(initialMarkdown);
            const md = preprocessInitialMarkdown
              ? preprocessInitialMarkdown(withTableBreaks)
              : withTableBreaks;
            const html = marked.parse(md, { async: false }) as string;
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, "text/html");
            const lexicalNodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            root.append(...lexicalNodes);
          },
        }
      : initialContent && isValidEditorState(initialContent)
        ? { editorState: JSON.stringify(initialContent) }
        : {}),
  };

  const editorTree = (
    <FloatingLinkContext>
      <LexicalComposer
        key={String(resetKey ?? "toolbarless-editor")}
        initialConfig={initialConfig}>
        <CollaborationContextProvider isCollabActive={false}>
          <div className="relative flex flex-col">
            <div className="relative -ml-6">
              <RichTextPlugin
                contentEditable={
                  <div className="w-full">
                    {pageMargins ? (
                      <div
                        className="w-full pl-6"
                        style={{
                          paddingTop: pageMargins.top,
                          paddingRight: pageMargins.right,
                          paddingBottom: pageMargins.bottom,
                          paddingLeft: pageMargins.left,
                        }}
                      >
                        <div
                          ref={onRef}
                          className="w-full min-w-0"
                          data-toc-content
                          {...(tocContentId != null && { "data-pane-id": tocContentId })}
                          style={
                            typography?.fontFamily || typography?.fontSize || textColor
                              ? {
                                  ...(typography?.fontFamily && {
                                    fontFamily: typography.fontFamily,
                                  }),
                                  ...(typography?.fontSize && {
                                    fontSize: typography.fontSize,
                                  }),
                                  ...(textColor && { color: textColor }),
                                }
                              : undefined
                          }
                        >
                          <ContentEditable
                            placeholder={placeholder}
                            className="ContentEditable__root relative block flow-root min-h-[160px] w-full overflow-visible focus:outline-none"
                            placeholderClassName="text-muted-foreground pointer-events-none absolute top-0 left-0 pl-6 pt-1 text-sm select-none"
                            onFocus={() => onFocus?.()}
                            onBlur={() => onBlur?.()}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full pl-6"
                        ref={onRef}
                        data-toc-content
                        {...(tocContentId != null && { "data-pane-id": tocContentId })}
                        style={
                          typography?.fontFamily || typography?.fontSize || textColor
                            ? {
                                ...(typography?.fontFamily && {
                                  fontFamily: typography.fontFamily,
                                }),
                                ...(typography?.fontSize && {
                                  fontSize: typography.fontSize,
                                }),
                                ...(textColor && { color: textColor }),
                              }
                            : undefined
                        }
                      >
                        <ContentEditable
                          placeholder={placeholder}
                          className="ContentEditable__root relative block flow-root min-h-[160px] w-full overflow-visible focus:outline-none"
                          placeholderClassName="text-muted-foreground pointer-events-none absolute top-0 left-0 pl-6 pt-1 text-sm select-none"
                          onFocus={() => onFocus?.()}
                          onBlur={() => onBlur?.()}
                        />
                      </div>
                    )}
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
                </>
              )}
              <CodeHighlightPlugin />
              <ListPlugin />
              <CheckListPlugin />
              <ListNumberingPlugin />
              {!readOnly && <ListExitPlugin />}
              {!readOnly && <TabIndentationPlugin />}
              <PlaceholderFormatPlugin />

              <AutoLinkPlugin />
              <LinkPlugin />
              <ClickableLinkPlugin />
              {!readOnly && <HistoryPlugin />}
              <ImagesPlugin />
              <InlineImagePlugin />
              {!readOnly && <DropInsertImagePlugin />}
              <SmartSectionPlugin />
              <ColumnsPlugin />
              <HorizontalSectionBlockPlugin />
              {!readOnly && <SlashCommandMenuPlugin />}
              {!readOnly && <MentionsPlugin />}
              {!readOnly && (
                <MarkdownShortcutPlugin transformers={markdownTransformers ?? MARKDOWN_TRANSFORMERS} />
              )}
              {renderAdditionalPlugins?.({ floatingAnchorElem, readOnly })}
              {pageHeight != null && pageMargins != null && (
                <PageBreakPlugin
                  pageHeight={pageHeight}
                  pageGap={pageGap}
                  topMargin={pageMargins.top}
                  bottomMargin={pageMargins.bottom}
                  onPageCountChange={onPageCountChange}
                />
              )}
              {findInFilePaneId != null && findInFilePaneId !== "" && (
                <FindInFilePlugin paneId={findInFilePaneId} />
              )}
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
  );

  return (
    <div className={className}>
      <MentionsContextProvider
        entities={entities}
        getHref={getHref}
        renderIcon={renderIcon}
        projects={projects}
        tasks={tasks}
      >
        {wrapEditor ? wrapEditor(editorTree) : editorTree}
      </MentionsContextProvider>
    </div>
  );
}
