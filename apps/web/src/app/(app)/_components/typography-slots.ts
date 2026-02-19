/** Shared typography slot IDs for heading/block formats in the editor theme. */
export type SlotId =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "paragraph"
  | "quote"
  | "code"
  | "listitem"
  | "tableCell"
  | "tableCellHeader"
  | "codeHighlight";

export const TYPOGRAPHY_SLOTS: { id: SlotId; label: string }[] = [
  { id: "h1", label: "Heading 1" },
  { id: "h2", label: "Heading 2" },
  { id: "h3", label: "Heading 3" },
  { id: "h4", label: "Heading 4" },
  { id: "h5", label: "Heading 5" },
  { id: "h6", label: "Heading 6" },
  { id: "paragraph", label: "Paragraph" },
  { id: "quote", label: "Quote" },
  { id: "code", label: "Code block" },
  { id: "listitem", label: "List item" },
  { id: "tableCell", label: "Table cell" },
  { id: "tableCellHeader", label: "Table header" },
  { id: "codeHighlight", label: "Code highlight" },
];
