import { ElementTransformer } from "@lexical/markdown"
import { $createParagraphNode, $isParagraphNode } from "lexical"

import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "../nodes/horizontal-rule-node"

export const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    if (!$isHorizontalRuleNode(node)) {
      return null
    }
    return "---"
  },
  regExp: /^(-{3,})\s*$/,
  replace: (parentNode, _children, match) => {
    console.log("[HORIZONTAL_RULE] replace called", {
      isParagraph: $isParagraphNode(parentNode),
      textContent: parentNode.getTextContent(),
      match: match,
    })
    
    if (!$isParagraphNode(parentNode)) {
      console.log("[HORIZONTAL_RULE] Not a paragraph node")
      return
    }
    
    // Check that the paragraph text content matches our pattern
    const textContent = parentNode.getTextContent()
    const matches = /^-{3,}\s*$/.test(textContent)
    console.log("[HORIZONTAL_RULE] Pattern test:", { textContent, matches })
    
    if (!matches) {
      return
    }
    
    console.log("[HORIZONTAL_RULE] Creating horizontal rule node")
    const horizontalRuleNode = $createHorizontalRuleNode()
    parentNode.replace(horizontalRuleNode)
    
    // Create a new paragraph after the horizontal rule for continued editing
    const nextSibling = horizontalRuleNode.getNextSibling()
    if (!nextSibling || !$isParagraphNode(nextSibling)) {
      const paragraph = $createParagraphNode()
      horizontalRuleNode.insertAfter(paragraph)
      paragraph.selectStart()
    } else {
      nextSibling.selectStart()
    }
  },
  type: "element",
}
