import type { EditorConfig, LexicalNode, SerializedTextNode, Spread } from "lexical";
import { $applyNodeReplacement, TextNode } from "lexical";

export type SerializedPlaceholderTextNode = Spread<
  { type: "placeholder-text" },
  SerializedTextNode
>;

export class PlaceholderTextNode extends TextNode {
  static getType(): string {
    return "placeholder-text";
  }

  static clone(node: PlaceholderTextNode): PlaceholderTextNode {
    return new PlaceholderTextNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedPlaceholderTextNode): PlaceholderTextNode {
    const node = $createPlaceholderTextNode(serializedNode.text ?? "");
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedPlaceholderTextNode {
    return {
      ...super.exportJSON(),
      type: "placeholder-text",
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.classList.add("EditorTheme__placeholder");
    return dom;
  }

  updateDOM(
    prevNode: PlaceholderTextNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    // @ts-expect-error TextNode.updateDOM has polymorphic this
    const needsRecreate = super.updateDOM(prevNode, dom, config);
    if (!needsRecreate) {
      dom.classList.add("EditorTheme__placeholder");
    }
    return needsRecreate;
  }
}

export function $createPlaceholderTextNode(text: string): PlaceholderTextNode {
  return $applyNodeReplacement(new PlaceholderTextNode(text));
}

export function $isPlaceholderTextNode(
  node: LexicalNode | null | undefined
): node is PlaceholderTextNode {
  return node instanceof PlaceholderTextNode;
}
