import { ElementTransformer } from "@lexical/markdown"
import { $createParagraphNode, $isParagraphNode } from "lexical"

import {
  $createSmartSectionNode,
  $isSmartSectionNode,
  SmartSectionNode,
} from "../nodes/smart-section-node"

export const SMART_SECTION: ElementTransformer = {
  dependencies: [SmartSectionNode],
  export: (node) => {
    if (!$isSmartSectionNode(node)) {
      return null
    }
    // Export as >section\nHeader\nContent format
    const headerText = node.getHeaderEditor().getEditorState().read(() => {
      return node.getHeaderEditor().getRootElement()?.textContent || ""
    })
    const contentText = node.getContentEditor().getEditorState().read(() => {
      return node.getContentEditor().getRootElement()?.textContent || ""
    })
    return `>>section\n${headerText}\n${contentText}`
  },
  regExp: /^>>section\s*$/,
  replace: (parentNode, _children, _match) => {


    // Check that the paragraph text content matches our pattern
    const textContent = parentNode.getTextContent()
    const matches = /^>>section\s*$/.test(textContent)

    if (!matches) {
      return
    }


    const smartSectionNode = $createSmartSectionNode({
      isExpanded: true,
    })
    parentNode.replace(smartSectionNode)

    // Create a new paragraph after the smart section for continued editing
    const nextSibling = smartSectionNode.getNextSibling()
    if (!nextSibling || !$isParagraphNode(nextSibling)) {
      const paragraph = $createParagraphNode()
      smartSectionNode.insertAfter(paragraph)
      paragraph.selectStart()
    } else {
      nextSibling.selectStart()
    }
  },
  type: "element",
}
