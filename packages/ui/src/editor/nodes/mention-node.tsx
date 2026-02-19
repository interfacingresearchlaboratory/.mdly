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
import { Layers, SquareSlash } from "lucide-react"

export type SerializedMentionNode = Spread<
  {
    id: string
    mentionType: "project" | "task"
    label: string
  },
  SerializedLexicalNode
>

export class MentionNode extends DecoratorNode<JSX.Element> {
  __id: string
  __type: "project" | "task"
  __label: string

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__id, node.__type, node.__label, node.__key)
  }

  static getType(): "mention" {
    return "mention"
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const { id, mentionType, label } = serializedNode
    return $createMentionNode(id, mentionType, label)
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: "mention",
      id: this.__id,
      mentionType: this.__type,
      label: this.__label,
      version: 1,
    }
  }

  constructor(id: string, type: "project" | "task", label: string, key?: NodeKey) {
    super(key)
    this.__id = id
    this.__type = type
    this.__label = label
  }

  getId(): string {
    return this.__id
  }

  getType(): "project" | "task" {
    return this.__type
  }

  getLabel(): string {
    return this.__label
  }

  setId(id: string): void {
    const writable = this.getWritable()
    writable.__id = id
  }

  setType(type: "project" | "task"): void {
    const writable = this.getWritable()
    writable.__type = type
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

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <MentionComponent
        id={this.__id}
        type={this.__type}
        label={this.__label}
        className={config.theme.mention}
      />
    )
  }
}

export function $createMentionNode(
  id: string,
  type: "project" | "task",
  label: string
): MentionNode {
  return new MentionNode(id, type, label)
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode
}

function MentionComponent({
  id,
  type,
  label,
  className,
}: {
  id: string
  type: "project" | "task"
  label: string
  className: EditorThemeClassName
}): JSX.Element {
  const Icon = type === "project" ? Layers : SquareSlash
  const iconSize = 14

  if (type === "project") {
    return (
      <a
        href={`/projects/${id}`}
        className={className}
        onClick={(e) => {
          // Prevent editor from losing focus
          e.stopPropagation()
        }}
      >
        <Icon size={iconSize} className="inline-block mr-1.5 align-middle" />
        <span>{label}</span>
      </a>
    )
  }

  return (
    <span className={className}>
      <Icon size={iconSize} className="inline-block mr-1.5 align-middle" />
      <span>{label}</span>
    </span>
  )
}
