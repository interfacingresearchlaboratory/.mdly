"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $isListItemNode,
  $isListNode,
  ListNode,
} from "@lexical/list";

/**
 * Registers a node transform on ListNode that keeps ordered-list
 * item values sequential (1, 2, 3 …) whenever the list is mutated.
 */
export function ListNumberingPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(ListNode, (node) => {
      if (node.getListType() !== "number") return;

      let counter = 1;
      for (const child of node.getChildren()) {
        if ($isListItemNode(child)) {
          if ($isListNode(child.getFirstChild())) continue;
          if (child.getValue() !== counter) {
            child.setValue(counter);
          }
          counter++;
        }
      }
    });
  }, [editor]);

  return null;
}
