"use client";

import { $createCodeNode, registerCodeHighlighting } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
} from "lexical";
import { useEffect } from "react";

export function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      registerCodeHighlighting(editor),

      // Convert ``` to a code block immediately on the third backtick
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (event.key !== "`") return false;

          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

          const anchorNode = selection.anchor.getNode();
          if (!$isTextNode(anchorNode)) return false;

          const text = anchorNode.getTextContent();
          const offset = selection.anchor.offset;

          // Check if text up to cursor is "``" — next backtick makes it "```"
          const textBeforeCursor = text.slice(0, offset);
          if (textBeforeCursor !== "``") return false;
          // Ensure nothing else after cursor in this node
          const textAfterCursor = text.slice(offset);
          if (textAfterCursor.length > 0) return false;

          const parent = anchorNode.getParent();
          if (!$isParagraphNode(parent)) return false;
          if (parent.getChildrenSize() !== 1) return false;

          event.preventDefault();

          const codeNode = $createCodeNode();
          parent.replace(codeNode);
          codeNode.selectStart();
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor]);

  return null;
}
