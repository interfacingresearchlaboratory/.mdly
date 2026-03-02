import * as React from "react"
import { JSX } from "react"
import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"
import { $applyNodeReplacement, DecoratorNode } from "lexical"

import { useMentionsContext } from "../context/mentions-context"

export type SerializedMentionNode = Spread<
  {
    id: string
    entityType: string
    label: string
  },
  SerializedLexicalNode
>

export class MentionNode extends DecoratorNode<JSX.Element> {
  __id: string
  __entityType: string
  __label: string

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__id, node.__entityType, node.__label, node.__key)
  }

  static getType(): "mention" {
    return "mention"
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const { id, entityType, label } = serializedNode
    return $createMentionNode(id, entityType, label)
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: "mention",
      id: this.__id,
      entityType: this.__entityType,
      label: this.__label,
      version: 1,
    }
  }

  constructor(id: string, entityType: string, label: string, key?: NodeKey) {
    super(key)
    this.__id = id
    this.__entityType = entityType
    this.__label = label
  }

  getId(): string {
    return this.__id
  }

  getEntityType(): string {
    return this.__entityType
  }

  getLabel(): string {
    return this.__label
  }

  setId(id: string): void {
    const writable = this.getWritable()
    writable.__id = id
  }

  setEntityType(entityType: string): void {
    const writable = this.getWritable()
    writable.__entityType = entityType
  }

  setLabel(label: string): void {
    const writable = this.getWritable()
    writable.__label = label
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

  decorate(): JSX.Element {
    return (
      <MentionComponent
        id={this.__id}
        type={this.__entityType}
        label={this.__label}
      />
    )
  }
}

export function $createMentionNode(
  id: string,
  entityType: string,
  label: string
): MentionNode {
  return $applyNodeReplacement(new MentionNode(id, entityType, label))
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode
}

const mentionBadgeClass =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground text-sm leading-5 no-underline select-none align-baseline"

function MentionComponent({
  id,
  type,
  label,
}: {
  id: string
  type: string
  label: string
}): JSX.Element {
  const { getHref, renderIcon } = useMentionsContext()
  const href = getHref?.(type, id)
  const icon = renderIcon?.(type)

  const content = (
    <>
      {icon != null ? (
        <span className="inline-flex items-center shrink-0 w-3.5 h-3.5">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={`${mentionBadgeClass} text-foreground cursor-pointer hover:bg-accent hover:no-underline`}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {content}
      </a>
    )
  }

  return <span className={`${mentionBadgeClass} cursor-default`}>{content}</span>
}
