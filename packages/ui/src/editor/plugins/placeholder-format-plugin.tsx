"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  KEY_DOWN_COMMAND,
  LexicalCommand,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { createPortal } from "react-dom";
import { Pencil } from "lucide-react";

import {
  $createPlaceholderTextNode,
  $isPlaceholderTextNode,
  PlaceholderTextNode,
} from "../nodes/placeholder-text-node";
import { cn } from "../../lib/utils";

export const TOGGLE_PLACEHOLDER_COMMAND: LexicalCommand<void> =
  createCommand("TOGGLE_PLACEHOLDER_COMMAND");

function isPrintableKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function isSelectionInPlaceholder(editor: LexicalEditor): boolean {
  let result = false;
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const anchorNode = selection.anchor.getNode();
    result =
      $isPlaceholderTextNode(anchorNode) ||
      selection.getNodes().some($isPlaceholderTextNode);
  });
  return result;
}

function updatePlaceholderEditingAttribute(editor: LexicalEditor): void {
  const root = editor.getRootElement();
  if (!root) return;

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      root.removeAttribute("data-placeholder-editing");
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const inPlaceholder =
      $isPlaceholderTextNode(anchorNode) ||
      selection.getNodes().some($isPlaceholderTextNode);

    if (inPlaceholder) {
      root.setAttribute("data-placeholder-editing", "true");
    } else {
      root.removeAttribute("data-placeholder-editing");
    }
  });
}

function PlaceholderContextMenu({
  x,
  y,
  onEditPlaceholder,
  onClose,
}: {
  x: number;
  y: number;
  onEditPlaceholder: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out"
      )}
      style={{
        position: "fixed",
        left: x,
        top: y,
      }}
    >
      <button
        type="button"
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        )}
        onClick={(e) => {
          e.preventDefault();
          onEditPlaceholder();
        }}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit placeholder
      </button>
    </div>,
    document.body
  );
}

export function PlaceholderFormatPlugin(): ReactNode {
  const [editor] = useLexicalComposerContext();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleEditPlaceholder = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const nodes = selection.getNodes().filter($isPlaceholderTextNode);
      const first = nodes[0];
      if (!first) return;

      first.selectStart();
    });
    setContextMenu(null);
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (editor.isComposing() || !isPrintableKey(event)) return false;

          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return false;

          const anchorNode = selection.anchor.getNode();
          if (!$isPlaceholderTextNode(anchorNode)) return false;

          event.preventDefault();

          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const nodes = selection.getNodes().filter($isPlaceholderTextNode);
            if (nodes.length === 0) return;

            const firstNode = nodes[0] as PlaceholderTextNode;
            const format = firstNode.getFormat();
            const newTextNode = $createTextNode(event.key);
            newTextNode.setFormat(format);

            firstNode.replace(newTextNode);
            newTextNode.selectNext(0, 0);
          });

          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),

      editor.registerCommand(
        TOGGLE_PLACEHOLDER_COMMAND,
        (_payload) => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || selection.isCollapsed()) return;

            const extracted = selection.extract();
            if (extracted.length === 0) return;

            const allPlaceholders = extracted.every($isPlaceholderTextNode);

            if (allPlaceholders) {
              for (const node of extracted) {
                if ($isPlaceholderTextNode(node)) {
                  const textNode = $createTextNode(node.getTextContent());
                  textNode.setFormat(node.getFormat());
                  node.replace(textNode);
                }
              }
            } else {
              for (const node of extracted) {
                if ($isTextNode(node) && !$isPlaceholderTextNode(node)) {
                  const placeholder = $createPlaceholderTextNode(
                    node.getTextContent()
                  );
                  placeholder.setFormat(node.getFormat());
                  node.replace(placeholder);
                }
              }
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePlaceholderEditingAttribute(editor);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerUpdateListener(() => {
        updatePlaceholderEditingAttribute(editor);
      })
    );
  }, [editor]);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleContextMenu = (e: MouseEvent) => {
      if (!isSelectionInPlaceholder(editor)) return;
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    root.addEventListener("contextmenu", handleContextMenu);
    return () => root.removeEventListener("contextmenu", handleContextMenu);
  }, [editor]);

  if (contextMenu) {
    return (
      <PlaceholderContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        onEditPlaceholder={handleEditPlaceholder}
        onClose={() => setContextMenu(null)}
      />
    );
  }

  return null;
}
