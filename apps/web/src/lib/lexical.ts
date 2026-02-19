interface LexicalTextNode {
  text?: string;
  children?: LexicalNode[];
}

type LexicalNode = string | LexicalTextNode;

function extractTextFromLexicalNode(node: LexicalNode): string {
  if (typeof node === "string") return node;
  if (node?.text) return node.text;
  if (node?.children) {
    return node.children.map(extractTextFromLexicalNode).join("");
  }
  return "";
}

function extractTextForPreview(node: LexicalNode): string {
  if (typeof node === "string") return node;
  if (node?.text) return node.text;
  if (node?.children) {
    return node.children.map(extractTextForPreview).join(" ").trim();
  }
  return "";
}

export function extractTextPreview(lexicalJson: { root?: LexicalNode } | undefined): string {
  if (!lexicalJson?.root) return "No description";

  const text = extractTextForPreview(lexicalJson.root);
  return text || "No description";
}

/** Returns true if the Lexical state has meaningful content (non-empty text). */
export function hasLexicalContent(lexicalJson: { root?: LexicalNode } | undefined): boolean {
  if (!lexicalJson?.root) return false;
  const text = extractTextFromLexicalNode(lexicalJson.root);
  return text.trim().length > 0;
}

/** Empty Lexical root for initializing an empty section editor. */
export const emptyLexicalState = {
  root: {
    children: [
      {
        children: [],
        direction: "ltr" as const,
        format: "",
        indent: 0,
        type: "paragraph" as const,
        version: 1,
      },
    ],
    direction: "ltr" as const,
    format: "",
    indent: 0,
    type: "root" as const,
    version: 1,
  },
};

/** Parses Lexical JSON string and returns plain-text preview, optionally truncated. */
export function getDescriptionPreview(
  description: string | undefined,
  maxLength = 100
): string {
  if (!description?.trim()) return "—";
  try {
    const parsed = JSON.parse(description) as { root?: unknown };
    const text = extractTextPreview(parsed);
    if (text === "No description") return "—";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  } catch {
    return "—";
  }
}
