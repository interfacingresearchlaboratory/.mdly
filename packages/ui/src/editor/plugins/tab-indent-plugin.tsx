"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode } from "@lexical/code";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_NORMAL,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";

/** Runs after AutocompletePlugin (priority LOW) so Tab still accepts suggestions when active. */
const TAB_INDENT_PRIORITY = COMMAND_PRIORITY_NORMAL;

export function TabIndentationPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<KeyboardEvent>(
      KEY_TAB_COMMAND,
      (event) => {
        const shift = event.shiftKey;

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return;
          }

          const anchorNode = selection.anchor.getNode();
          const codeNode = $findMatchingParent(anchorNode, $isCodeNode);

          if (codeNode) {
            if (shift) {
              const node = selection.anchor.getNode();
              if ($isTextNode(node)) {
                const offset = selection.anchor.offset;
                const text = node.getTextContent();
                if (offset > 0 && text[offset - 1] === "\t") {
                  const newText =
                    text.slice(0, offset - 1) + text.slice(offset);
                  node.setTextContent(newText);
                  selection.anchor.set(node.getKey(), offset - 1, "text");
                  selection.focus.set(node.getKey(), offset - 1, "text");
                  $setSelection(selection);
                }
              }
            } else {
              $insertNodes([$createTextNode("\t")]);
            }
          } else {
            const cmd = shift
              ? OUTDENT_CONTENT_COMMAND
              : INDENT_CONTENT_COMMAND;
            queueMicrotask(() => {
              editor.dispatchCommand(cmd, undefined);
            });
          }
        });

        event.preventDefault();
        return true;
      },
      TAB_INDENT_PRIORITY
    );
  }, [editor]);

  return null;
}
