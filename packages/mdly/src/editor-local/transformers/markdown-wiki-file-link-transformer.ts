import { TextMatchTransformer } from "@lexical/markdown"
import { $createTextNode } from "lexical"
import { $isLinkNode } from "@lexical/link"

import { CustomLinkNode } from "../../editor/nodes/link-node"
import { VELLUM_FILE_LINK_PREFIX } from "../../editor/utils/vellum-file-constants"

export { VELLUM_FILE_LINK_PREFIX }

export const WIKI_FILE_LINK_REGEX = /\[\[([^\]]+)\]\]/

/** Global regex for replacing all [[...]] in markdown (marked truncates URLs at unencoded spaces). */
const WIKI_FILE_LINK_REGEX_G = new RegExp(WIKI_FILE_LINK_REGEX.source, "g")

/**
 * Converts wiki-style file links [[filename]] to markdown links [filename](vellum-file:encodedPath)
 * so that marked + $generateNodesFromDOM produce link nodes. Paths are URL-encoded because
 * marked truncates link URLs at unencoded spaces.
 */
export function preprocessMarkdownWikiFileLinks(markdown: string): string {
  return markdown
    .replace(WIKI_FILE_LINK_REGEX_G, (_, path: string) => {
      const p = path.trim()
      return p ? `[${p}](vellum-file:${encodeURIComponent(p)})` : `[[${path}]]`
    })
    .replace(/\[([^\]]*)\]\(vellum-file:([^)]+)\)/g, (_, text: string, path: string) => {
      const trimmed = path.trim()
      if (!trimmed) return `[${text}](vellum-file:${path})`
      try {
        const decoded = decodeURIComponent(trimmed)
        return `[${text}](vellum-file:${encodeURIComponent(decoded)})`
      } catch {
        return `[${text}](vellum-file:${trimmed})`
      }
    })
}

export const WIKI_FILE_LINK: TextMatchTransformer = {
  dependencies: [CustomLinkNode],
  export: (node) => {
    if (!$isLinkNode(node)) return null
    const url = node.getURL()
    if (!url.startsWith(VELLUM_FILE_LINK_PREFIX)) return null
    const path = url.slice(VELLUM_FILE_LINK_PREFIX.length)
    return `[[${path}]]`
  },
  importRegExp: WIKI_FILE_LINK_REGEX,
  regExp: new RegExp(`^${WIKI_FILE_LINK_REGEX.source}$`),
  replace: (textNode, match) => {
    const raw = match[1]
    if (!raw) return
    const fileName = raw.trim()
    if (!fileName) return
    const linkNode = new CustomLinkNode(`${VELLUM_FILE_LINK_PREFIX}${fileName}`)
    linkNode.append($createTextNode(fileName))
    textNode.replace(linkNode)
  },
  trigger: "]",
  type: "text-match",
}
