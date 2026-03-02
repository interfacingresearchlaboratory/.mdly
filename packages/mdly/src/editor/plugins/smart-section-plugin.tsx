"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
  $createParagraphNode,
  KEY_ENTER_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $getRoot,
  $getNodeByKey,
} from "lexical";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createSmartSectionNode,
  SmartSectionNode,
} from "../nodes/smart-section-node";

export interface InsertSmartSectionPayload {
  isExpanded?: boolean;
}

export const INSERT_SMART_SECTION_COMMAND: LexicalCommand<InsertSmartSectionPayload> =
  createCommand("INSERT_SMART_SECTION_COMMAND");

export function SmartSectionPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([SmartSectionNode])) {
      throw new Error(
        "SmartSectionPlugin: SmartSectionNode not registered on editor"
      );
    }

    return mergeRegister(
      editor.registerCommand<InsertSmartSectionPayload>(
        INSERT_SMART_SECTION_COMMAND,
        (payload) => {
          const smartSectionNode = $createSmartSectionNode({
            isExpanded: payload?.isExpanded ?? true,
          });
          $insertNodes([smartSectionNode]);
          if ($isRootOrShadowRoot(smartSectionNode.getParentOrThrow())) {
            $wrapNodeInElement(
              smartSectionNode,
              $createParagraphNode
            ).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      // Handle Enter key to check for >>section pattern
      editor.registerCommand(
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

          // Get the full paragraph text content BEFORE Enter processes
          const textContent = paragraph.getTextContent();

          // Check if the line matches >>section pattern
          const matches = /^>>section\s*$/.test(textContent.trim());

          if (matches) {
            event?.preventDefault();

            editor.update(() => {
              const smartSectionNode = $createSmartSectionNode({
                isExpanded: true,
              });
              paragraph.replace(smartSectionNode);
              const nextParagraph = $createParagraphNode();
              smartSectionNode.insertAfter(nextParagraph);
              nextParagraph.selectStart();
            });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      // Listen for updates to detect and transform >>section pattern
      editor.registerUpdateListener(({ editorState }) => {
        let paragraphKeyToTransform: string | null = null;

        editorState.read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          console.log(
            "[SMART_SECTION] Update listener triggered, checking",
            children.length,
            "children"
          );

          for (const child of children) {
            if ($isParagraphNode(child)) {
              const textContent = child.getTextContent().trim();
           
              if (/^>>section\s*$/.test(textContent)) {
                console.log(
                  "[SMART_SECTION] Found >>section pattern in update listener"
                );
                paragraphKeyToTransform = child.getKey();
                break;
              }
            }
          }
        });

        if (paragraphKeyToTransform) {
          console.log(
            "[SMART_SECTION] Transforming paragraph to smart section, key:",
            paragraphKeyToTransform
          );
          editor.update(() => {
            // Get the node by key in the update context
            const paragraph = $getNodeByKey(paragraphKeyToTransform!);
            if (paragraph && $isParagraphNode(paragraph)) {
              console.log(
                "[SMART_SECTION] Replacing paragraph with smart section"
              );
              const smartSectionNode = $createSmartSectionNode({
                isExpanded: true,
              });
              paragraph.replace(smartSectionNode);
              const nextParagraph = $createParagraphNode();
              smartSectionNode.insertAfter(nextParagraph);
              nextParagraph.selectStart();
            } else {
              console.log(
                "[SMART_SECTION] Could not find paragraph node by key"
              );
            }
          });
        }
      })
    );
  }, [editor]);

  return null;
}
