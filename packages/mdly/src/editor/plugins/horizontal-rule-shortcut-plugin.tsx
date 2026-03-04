"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
} from "lexical";

import { $createHorizontalRuleNode } from "../nodes/horizontal-rule-node";

const HORIZONTAL_RULE_SHORTCUT_REGEXP = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;

export function HorizontalRuleShortcutPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const paragraph = anchorNode.getParent();
        if (!$isParagraphNode(paragraph)) {
          return false;
        }

        const textContent = paragraph.getTextContent().trim();
        if (!HORIZONTAL_RULE_SHORTCUT_REGEXP.test(textContent)) {
          return false;
        }

        event?.preventDefault();

        editor.update(() => {
          const horizontalRuleNode = $createHorizontalRuleNode();
          paragraph.replace(horizontalRuleNode);

          const nextParagraph = $createParagraphNode();
          horizontalRuleNode.insertAfter(nextParagraph);
          nextParagraph.selectStart();
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
