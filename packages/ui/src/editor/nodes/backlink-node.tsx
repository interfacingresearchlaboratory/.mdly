import * as React from "react"
import { JSX } from "react"
import type {
  EditorConfig,
  EditorThemeClassName,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { DecoratorNode } from "lexical"

import { useBacklinksContext } from "../context/backlinks-context"
import { cn } from "../../lib/utils"

export type SerializedBacklinkNode = Spread<
  {
    pageName: string
    path: string
  },
  SerializedLexicalNode
>

export class BacklinkNode extends DecoratorNode<JSX.Element> {
  __pageName: string
  __path: string

  static clone(node: BacklinkNode): BacklinkNode {
    return new BacklinkNode(node.__pageName, node.__path, node.__key)
  }

  static getType(): "backlink" {
    return "backlink"
  }

  static importJSON(serializedNode: SerializedBacklinkNode): BacklinkNode {
    const { pageName, path } = serializedNode
    return $createBacklinkNode(pageName, path)
  }

  exportJSON(): SerializedBacklinkNode {
    return {
      ...super.exportJSON(),
      type: "backlink",
      pageName: this.__pageName,
      path: this.__path,
      version: 1,
    }
  }

  constructor(pageName: string, path: string, key?: NodeKey) {
    super(key)
    this.__pageName = pageName
    this.__path = path
  }

  getPageName(): string {
    return this.__pageName
  }

  getPath(): string {
    return this.__path
  }

  setPageName(pageName: string): void {
    const writable = this.getWritable()
    writable.__pageName = pageName
  }

  setPath(path: string): void {
    const writable = this.getWritable()
    writable.__path = path
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    return false
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement("span")
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <BacklinkComponent
        pageName={this.__pageName}
        path={this.__path}
        className={config.theme.backlink}
      />
    )
  }
}

export function $createBacklinkNode(pageName: string, path: string): BacklinkNode {
  return new BacklinkNode(pageName, path)
}

export function $isBacklinkNode(node: LexicalNode | null | undefined): node is BacklinkNode {
  return node instanceof BacklinkNode
}

function BacklinkComponent({
  pageName,
  path,
  className,
}: {
  pageName: string
  path: string
  className: EditorThemeClassName
}): JSX.Element {
  const { onOpenBacklink } = useBacklinksContext()
  const hasPath = path.length > 0

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (hasPath && onOpenBacklink) {
        onOpenBacklink(path)
      }
    },
    [hasPath, onOpenBacklink, path]
  )

  if (hasPath && onOpenBacklink) {
    return (
      <span
        role="button"
        tabIndex={-1}
        className={className}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onOpenBacklink(path)
          }
        }}
      >
        {pageName}
      </span>
    )
  }

  return (
    <span className={cn(className, "opacity-70 cursor-default")}>
      {pageName}
    </span>
  )
}
