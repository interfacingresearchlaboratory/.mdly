import { TextMatchTransformer } from "@lexical/markdown"

import { $createBacklinkNode, $isBacklinkNode, BacklinkNode } from "../nodes/backlink-node"

const BACKLINK_REGEX = /\[\[([^\]]+)\]\]/

export const BACKLINK: TextMatchTransformer = {
  dependencies: [BacklinkNode],
  export: (node) => {
    if (!$isBacklinkNode(node)) {
      return null
    }
    return `[[${node.getPageName()}]]`
  },
  importRegExp: BACKLINK_REGEX,
  regExp: BACKLINK_REGEX,
  replace: (textNode, match) => {
    const pageName = match[1]?.trim() ?? ""
    if (!pageName) return
    textNode.replace($createBacklinkNode(pageName, ""))
  },
  type: "text-match",
}
