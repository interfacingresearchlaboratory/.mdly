"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { NormalizeWikiFileLinksPlugin } from "./plugins/normalize-wiki-file-links-plugin";
import { $generateNodesFromDOM } from "@lexical/html";
import { marked } from "marked";
import { $getRoot } from "lexical";

import {
  getEditorTheme,
  type TypographyConfig,
} from "./themes/editor-theme";
import { nodes } from "./nodes";
import { MARKDOWN_TRANSFORMERS } from "./markdown-transformers";
import { preprocessMarkdownWikiFileLinks } from "./transformers/markdown-wiki-file-link-transformer";
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
import { FileLinkContext } from "./context/file-link-context";
import { FloatingLinkContext } from "./context/floating-link-context";
import { MentionsContextProvider, type MentionEntity, type Project, type Task } from "./context/mentions-context";
import { BacklinksContextProvider, type SameFolderFile } from "./context/backlinks-context";
import { MentionsPlugin } from "./plugins/mentions-plugin";
import { SlashCommandMenuPlugin } from "./plugins/slash-command-menu-plugin";
import { BacklinksTypeaheadPlugin } from "./plugins/backlinks-typeahead-plugin";
import { BacklinkTransformPlugin } from "./plugins/backlink-transform-plugin";
import { UnresolvedWikiLinkStylePlugin } from "./plugins/unresolved-wiki-link-style-plugin";
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
  /** Workspace md/vlm/txt files for Obsidian-style backlinks ([[page name]]). */
  sameFolderMdFiles?: SameFolderFile[];
  /** Current file path (for preferring same-folder when resolving duplicate names). */
  currentFilePath?: string | null;
  /** Called when user clicks a backlink to open that file (e.g. in a new tab). */
  onOpenBacklink?: (path: string) => void;
  /** Optional typography overrides (letter spacing, font weight, document font) per block/format (e.g. from document settings). */
  typography?: TypographyConfig;
  /** Optional id for the editor content root (e.g. pane id) so table-of-contents can target this instance via data-pane-id. */
  tocContentId?: string;
  /** When provided, wiki-style file links [[filename]] are clickable and trigger this with the path string (e.g. for opening in app). */
  onFileLinkClick?: (path: string) => void;
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
  initialMarkdown,
  placeholder = "Add a description…",
  className,
  onChange,
  onFocus,
  onBlur,
  entities = [],
  getHref,
  renderIcon,
  projects,
  tasks,
  sameFolderMdFiles = [],
  currentFilePath = null,
  onOpenBacklink,
  typography,
  tocContentId,
  onFileLinkClick,
  textColor,
  pageMargins,
  pageHeight,
  pageGap = 32,
  onPageCountChange,
  findInFilePaneId = null,
  readOnly = false,
}: ToolbarlessEditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const effectiveMentionEntities = useMemo<MentionEntity[]>(() => {
    if (entities.length > 0) return entities;
    const fromTasks = (tasks ?? []).map((task) => ({
      id: task._id,
      type: "task",
      label: task.title,
    }));
    const fromProjects = (projects ?? []).map((project) => ({
      id: project._id,
      type: "project",
      label: project.title,
    }));
    return [...fromTasks, ...fromProjects];
  }, [entities, projects, tasks]);

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
    ...(initialMarkdown !== undefined
      ? {
          editorState: (editor) => {
            const md = preprocessMarkdownWikiFileLinks(initialMarkdown);
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
  

  return (
    <div className={className}>
      <MentionsContextProvider
        entities={effectiveMentionEntities}
        getHref={getHref}
        renderIcon={renderIcon}
        projects={projects}
        tasks={tasks}
      >
        <BacklinksContextProvider
          sameFolderMdFiles={sameFolderMdFiles}
          currentFilePath={currentFilePath ?? undefined}
          onOpenBacklink={onOpenBacklink ?? undefined}
        >
          <FileLinkContext onFileLinkClick={onFileLinkClick}>
          <FloatingLinkContext>
          <LexicalComposer
            key={String(resetKey ?? "toolbarless-editor")}
            initialConfig={initialConfig}>
            <CollaborationContextProvider isCollabActive={false}>
              <div className="relative flex flex-col">
                {/* Keep left gutter offset so draggable handles align in both normal and paginated layouts */}
                <div className="relative -ml-6">
                  <RichTextPlugin
                    contentEditable={
                      <div className="w-full">
                        {pageMargins ? (
                          <>
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
                                  className="ContentEditable__root relative block min-h-[160px] w-full overflow-visible focus:outline-none"
                                  placeholderClassName="text-muted-foreground pointer-events-none absolute top-0 left-0 pl-6 pt-1 text-sm select-none"
                                  onFocus={() => onFocus?.()}
                                  onBlur={() => onBlur?.()}
                                />
                              </div>
                            </div>
                          </>
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
                              className="ContentEditable__root relative block min-h-[160px] w-full overflow-visible focus:outline-none"
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
                  {onFileLinkClick && <NormalizeWikiFileLinksPlugin />}
                  {!readOnly && <HistoryPlugin />}
                  <ImagesPlugin />
                  <InlineImagePlugin />
                  {!readOnly && <DropInsertImagePlugin />}
                  <SmartSectionPlugin />
                  <ColumnsPlugin />
                  <HorizontalSectionBlockPlugin />
                  {!readOnly && <SlashCommandMenuPlugin />}
                  {!readOnly && <BacklinksTypeaheadPlugin />}
                  {!readOnly && <BacklinkTransformPlugin />}
                  <UnresolvedWikiLinkStylePlugin />
                  {!readOnly && <MentionsPlugin />}
                  {!readOnly && (
                    <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
                  )}
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
          </FileLinkContext>
        </BacklinksContextProvider>
      </MentionsContextProvider>
    </div>
  );
}
