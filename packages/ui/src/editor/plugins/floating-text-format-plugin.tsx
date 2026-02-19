import { Dispatch, JSX, useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $createHeadingNode } from "@lexical/rich-text";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  SquarePen,
  UnderlineIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
} from "lucide-react";
import { createPortal } from "react-dom";

import { useFloatingLinkContext } from "../context/floating-link-context";
import { getDOMRangeRect } from "../utils/get-dom-range-rect";
import { getSelectedNode } from "../utils/get-selected-node";
import { setFloatingElemPosition } from "../utils/set-floating-elem-position";
import {
  $createPlaceholderTextNode,
  $isPlaceholderTextNode,
} from "../nodes/placeholder-text-node";
import { Separator } from "../../separator";
import { Button } from "../../button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../tooltip";
import { cn } from "../../lib/utils";

function FloatingTextFormat({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  isPlaceholder,
  isSubscript,
  isSuperscript,
  headingLevel,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isPlaceholder: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
  headingLevel: "paragraph" | "h1" | "h2" | "h3" | "h4";
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  function mouseMoveListener(e: MouseEvent) {
    if (
      popupCharStylesEditorRef?.current &&
      (e.buttons === 1 || e.buttons === 3)
    ) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "none") {
        const x = e.clientX;
        const y = e.clientY;
        const elementUnderMouse = document.elementFromPoint(x, y);

        if (!popupCharStylesEditorRef.current.contains(elementUnderMouse)) {
          // Mouse is not over the target element => not a normal click, but probably a drag
          popupCharStylesEditorRef.current.style.pointerEvents = "none";
        }
      }
    }
  }
  function mouseUpListener(e: MouseEvent) {
    if (popupCharStylesEditorRef?.current) {
      if (popupCharStylesEditorRef.current.style.pointerEvents !== "auto") {
        popupCharStylesEditorRef.current.style.pointerEvents = "auto";
      }
    }
  }

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      document.addEventListener("mousemove", mouseMoveListener);
      document.addEventListener("mouseup", mouseUpListener);

      return () => {
        document.removeEventListener("mousemove", mouseMoveListener);
        document.removeEventListener("mouseup", mouseUpListener);
      };
    }
  }, [popupCharStylesEditorRef]);

  const $updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection();

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
    const nativeSelection = window.getSelection();

    if (popupCharStylesEditorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isLink
      );
    }
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        $updateTextFormatFloatingToolbar();
      });
    };

    window.addEventListener("resize", update);
    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);
      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [editor, $updateTextFormatFloatingToolbar, anchorElem]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateTextFormatFloatingToolbar();
    });
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateTextFormatFloatingToolbar();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateTextFormatFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, $updateTextFormatFloatingToolbar]);

  return (
    <div
      ref={popupCharStylesEditorRef}
      className="bg-background absolute top-0 left-0 z-10 flex gap-1 rounded-md border p-1 opacity-0 shadow-md transition-opacity duration-300 will-change-transform">
      {editor.isEditable() && (
        <>
          {/* Headings (single-select) */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant={headingLevel === "h1" ? "default" : "outline"}
              size="sm"
              aria-label="Heading 1"
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if (!$isRangeSelection(selection)) return;
                  if (headingLevel === "h1") {
                    $setBlocksType(selection, () => $createParagraphNode());
                  } else {
                    $setBlocksType(selection, () => $createHeadingNode("h1"));
                  }
                });
              }}
            >
              <Heading1Icon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={headingLevel === "h2" ? "default" : "outline"}
              size="sm"
              aria-label="Heading 2"
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if (!$isRangeSelection(selection)) return;
                  if (headingLevel === "h2") {
                    $setBlocksType(selection, () => $createParagraphNode());
                  } else {
                    $setBlocksType(selection, () => $createHeadingNode("h2"));
                  }
                });
              }}
            >
              <Heading2Icon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={headingLevel === "h3" ? "default" : "outline"}
              size="sm"
              aria-label="Heading 3"
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if (!$isRangeSelection(selection)) return;
                  if (headingLevel === "h3") {
                    $setBlocksType(selection, () => $createParagraphNode());
                  } else {
                    $setBlocksType(selection, () => $createHeadingNode("h3"));
                  }
                });
              }}
            >
              <Heading3Icon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={headingLevel === "h4" ? "default" : "outline"}
              size="sm"
              aria-label="Heading 4"
              onClick={() => {
                editor.update(() => {
                  const selection = $getSelection();
                  if (!$isRangeSelection(selection)) return;
                  if (headingLevel === "h4") {
                    $setBlocksType(selection, () => $createParagraphNode());
                  } else {
                    $setBlocksType(selection, () => $createHeadingNode("h4"));
                  }
                });
              }}
            >
              <Heading4Icon className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" />

          {/* Inline text styles, link, lists (multi-select) */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant={isBold ? "default" : "outline"}
              size="sm"
              aria-label="Toggle bold"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              }}
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={isItalic ? "default" : "outline"}
              size="sm"
              aria-label="Toggle italic"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              }}
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={isUnderline ? "default" : "outline"}
              size="sm"
              aria-label="Toggle underline"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              }}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={isStrikethrough ? "default" : "outline"}
              size="sm"
              aria-label="Toggle strikethrough"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
              }}
            >
              <StrikethroughIcon className="h-4 w-4" />
            </Button>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isPlaceholder ? "default" : "outline"}
                    size="sm"
                    aria-label="Toggle placeholder"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.update(() => {
                        const selection = $getSelection();
                        if (!$isRangeSelection(selection)) return;
                        if (selection.isCollapsed()) return;

                        const extracted = selection.extract();
                        if (extracted.length === 0) return;

                        const allPlaceholders = extracted.every(
                          $isPlaceholderTextNode
                        );

                        if (allPlaceholders) {
                          for (const node of extracted) {
                            if ($isPlaceholderTextNode(node)) {
                              const textNode = $createTextNode(
                                node.getTextContent()
                              );
                              textNode.setFormat(node.getFormat());
                              node.replace(textNode);
                              textNode.select();
                            }
                          }
                        } else {
                          for (const node of extracted) {
                            if (
                              $isTextNode(node) &&
                              !$isPlaceholderTextNode(node)
                            ) {
                              const placeholder =
                                $createPlaceholderTextNode(
                                  node.getTextContent()
                                );
                              placeholder.setFormat(node.getFormat());
                              node.replace(placeholder);
                            }
                          }
                        }
                      });
                    }}
                  >
                    <SquarePen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Placeholder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" />

            {/* Link */}
            <Button
              type="button"
              variant={isLink ? "default" : "outline"}
              size="sm"
              aria-label="Toggle link"
              onClick={insertLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />

            {/* Lists */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Numbered list"
              onClick={() => {
                editor.dispatchCommand(
                  INSERT_ORDERED_LIST_COMMAND,
                  undefined
                );
              }}
            >
              <ListOrderedIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Bulleted list"
              onClick={() => {
                editor.dispatchCommand(
                  INSERT_UNORDERED_LIST_COMMAND,
                  undefined
                );
              }}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Check list"
              onClick={() => {
                editor.dispatchCommand(
                  INSERT_CHECK_LIST_COMMAND,
                  undefined
                );
              }}
            >
              <ListTodoIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />

            {/* Subscript/Superscript */}
            <Button
              type="button"
              variant={isSubscript ? "default" : "outline"}
              size="sm"
              aria-label="Toggle subscript"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
              }}
            >
              <SubscriptIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={isSuperscript ? "default" : "outline"}
              size="sm"
              aria-label="Toggle superscript"
              onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
              }}
            >
              <SuperscriptIcon className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  setIsLinkEditMode: Dispatch<boolean>
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [headingLevel, setHeadingLevel] = useState<
    "paragraph" | "h1" | "h2" | "h3" | "h4"
  >("paragraph");

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return;
      }
      const selection = $getSelection();
      const nativeSelection = window.getSelection();
      const rootElement = editor.getRootElement();

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false);
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const node = getSelectedNode(selection);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsPlaceholder(selection.getNodes().some($isPlaceholderTextNode));

      // Update heading level
      const blockParent = node.getTopLevelElementOrThrow();
      const blockType = blockParent.getType();
      if (blockType === "heading") {
        // Lexical rich-text heading nodes store the tag as a property
        // @ts-expect-error internal Lexical API
        const tag: string | undefined = blockParent.getTag?.();
        if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
          setHeadingLevel(tag);
        } else {
          setHeadingLevel("paragraph");
        }
      } else {
        setHeadingLevel("paragraph");
      }

      // Update links
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (
        !$isCodeHighlightNode(selection.anchor.getNode()) &&
        selection.getTextContent() !== ""
      ) {
        setIsText($isTextNode(node) || $isParagraphNode(node));
      } else {
        setIsText(false);
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, "");
      if (!selection.isCollapsed() && rawTextContent === "") {
        setIsText(false);
        return;
      }
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePopup);
    return () => {
      document.removeEventListener("selectionchange", updatePopup);
    };
  }, [updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup();
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false);
        }
      })
    );
  }, [editor, updatePopup]);

  if (!isText || !anchorElem) {
    return null;
  }

  return createPortal(
    <FloatingTextFormat
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isStrikethrough={isStrikethrough}
      isPlaceholder={isPlaceholder}
      isSubscript={isSubscript}
      isSuperscript={isSuperscript}
      isUnderline={isUnderline}
      isCode={isCode}
      headingLevel={headingLevel}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  );
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
}: {
  anchorElem: HTMLDivElement | null;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { setIsLinkEditMode } = useFloatingLinkContext();

  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
