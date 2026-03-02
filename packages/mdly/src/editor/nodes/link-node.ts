"use client"

import type { EditorConfig } from "lexical"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import type { SerializedLinkNode, SerializedAutoLinkNode } from "@lexical/link"
import { isHTMLAnchorElement } from "@lexical/utils"

import { VELLUM_FILE_LINK_PREFIX } from "../utils/vellum-file-constants"

export const VELLUM_FILE_PATH_ATTR = "data-vellum-file-path"

function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}

function isVellumFileUrl(url: string): boolean {
  return url.startsWith(VELLUM_FILE_LINK_PREFIX)
}

function applyExternalLinkAttributes(anchor: HTMLAnchorElement, url: string): void {
  if (isExternalUrl(url)) {
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
  } else {
    anchor.removeAttribute("target")
    anchor.removeAttribute("rel")
  }
}

function applyVellumFileAttributes(anchor: HTMLAnchorElement, url: string): void {
  if (!isVellumFileUrl(url)) return
  const path = url.slice(VELLUM_FILE_LINK_PREFIX.length)
  anchor.href = "#"
  anchor.setAttribute(VELLUM_FILE_PATH_ATTR, path)
}

type LinkHTMLElementType = HTMLAnchorElement | HTMLSpanElement

const CUSTOM_LINK_TYPE = "custom-link"
const CUSTOM_AUTOLINK_TYPE = "custom-autolink"

/**
 * Custom LinkNode that opens external links (http/https) in a new tab.
 * Uses a distinct type so it can be registered alongside the LinkNode replacement.
 */
export class CustomLinkNode extends LinkNode {
  static getType(): string {
    return CUSTOM_LINK_TYPE
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(
      node.getURL(),
      {
        rel: node.getRel(),
        target: node.getTarget(),
        title: node.getTitle(),
      },
      node.getKey()
    )
  }

  static importJSON(serializedNode: SerializedLinkNode & { type: string }): CustomLinkNode {
    const node = new CustomLinkNode(serializedNode.url, {
      rel: serializedNode.rel ?? null,
      target: serializedNode.target ?? null,
      title: serializedNode.title ?? null,
    })
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportJSON(): SerializedLinkNode & { type: string } {
    return {
      ...super.exportJSON(),
      type: CUSTOM_LINK_TYPE,
    }
  }

  override updateLinkDOM(
    prevNode: LinkNode | null,
    anchor: LinkHTMLElementType,
    config: EditorConfig
  ): void {
    super.updateLinkDOM(prevNode as this | null, anchor, config)
    if (isHTMLAnchorElement(anchor)) {
      const url = this.getURL()
      if (isVellumFileUrl(url)) {
        applyVellumFileAttributes(anchor, url)
      } else {
        anchor.removeAttribute(VELLUM_FILE_PATH_ATTR)
        applyExternalLinkAttributes(anchor, url)
      }
    }
  }

  override createDOM(config: EditorConfig): LinkHTMLElementType {
    const element = super.createDOM(config)
    if (isHTMLAnchorElement(element)) {
      const url = this.getURL()
      if (isVellumFileUrl(url)) {
        applyVellumFileAttributes(element, url)
      } else {
        applyExternalLinkAttributes(element, url)
      }
    }
    return element
  }
}

/**
 * Custom AutoLinkNode that opens external links (http/https) in a new tab.
 * Uses a distinct type so it can be registered alongside the AutoLinkNode replacement.
 */
export class CustomAutoLinkNode extends AutoLinkNode {
  static getType(): string {
    return CUSTOM_AUTOLINK_TYPE
  }

  static clone(node: CustomAutoLinkNode): CustomAutoLinkNode {
    return new CustomAutoLinkNode(
      node.getURL(),
      {
        isUnlinked: node.getIsUnlinked(),
        rel: node.getRel(),
        target: node.getTarget(),
        title: node.getTitle(),
      },
      node.getKey()
    )
  }

  static importJSON(serializedNode: SerializedAutoLinkNode & { type: string }): CustomAutoLinkNode {
    const node = new CustomAutoLinkNode(serializedNode.url, {
      isUnlinked: serializedNode.isUnlinked ?? false,
      rel: serializedNode.rel ?? null,
      target: serializedNode.target ?? null,
      title: serializedNode.title ?? null,
    })
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportJSON(): SerializedAutoLinkNode & { type: string } {
    return {
      ...super.exportJSON(),
      type: CUSTOM_AUTOLINK_TYPE,
    }
  }

  override createDOM(config: EditorConfig): LinkHTMLElementType {
    const element = super.createDOM(config)
    if (isHTMLAnchorElement(element)) {
      applyExternalLinkAttributes(element, this.getURL())
    }
    return element
  }

  override updateDOM(
    prevNode: AutoLinkNode,
    anchor: LinkHTMLElementType,
    config: EditorConfig
  ): boolean {
    const result = super.updateDOM(prevNode as this, anchor, config)
    if (isHTMLAnchorElement(anchor)) {
      applyExternalLinkAttributes(anchor, this.getURL())
    }
    return result
  }
}
