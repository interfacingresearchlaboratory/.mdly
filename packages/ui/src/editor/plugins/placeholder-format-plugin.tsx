"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  KEY_DOWN_COMMAND,
  LexicalCommand,
} from "lexical";

import {
  $createPlaceholderTextNode,
  $isPlaceholderTextNode,
  PlaceholderTextNode,
} from "../nodes/placeholder-text-node";

export const TOGGLE_PLACEHOLDER_COMMAND: LexicalCommand<void> =
  createCommand("TOGGLE_PLACEHOLDER_COMMAND");

function isPrintableKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}

function $getContiguousPlaceholderSiblings(
  anchor: PlaceholderTextNode
): PlaceholderTextNode[] {
  const siblings: PlaceholderTextNode[] = [anchor];

  let prev = anchor.getPreviousSibling();
  while (prev && $isPlaceholderTextNode(prev)) {
    siblings.unshift(prev);
    prev = prev.getPreviousSibling();
  }

  let next = anchor.getNextSibling();
  while (next && $isPlaceholderTextNode(next)) {
    siblings.push(next);
    next = next.getNextSibling();
  }

  return siblings;
}

export function PlaceholderFormatPlugin(): ReactNode {
  const [editor] = useLexicalComposerContext();

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
            const sel = $getSelection();
            if (!$isRangeSelection(sel)) return;

            const anchor = sel.anchor.getNode();
            if (!$isPlaceholderTextNode(anchor)) return;

            const contiguous = $getContiguousPlaceholderSiblings(anchor);
            const first = contiguous[0]!;
            const newTextNode = $createTextNode(event.key);
            newTextNode.setFormat(first.getFormat());

            first.replace(newTextNode);
            for (let i = 1; i < contiguous.length; i++) {
              contiguous[i]!.remove();
            }
            newTextNode.selectNext(0, 0);
          });

          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),

      editor.registerCommand(
        TOGGLE_PLACEHOLDER_COMMAND,
        () => {
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
      )
    );
  }, [editor]);

  return null;
}
