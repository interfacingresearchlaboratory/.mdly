/**
 * Editor and page shortcut definitions for the shortcuts directory.
 * Rendered with Kbd/KbdGroup in the UI; Shift shown as ArrowBigUp per hotkey-hints.
 */

/** Key combo: meta (⌘), optional shift, and key. */
export interface KeyCombo {
  meta?: boolean;
  shift?: boolean;
  key: string;
}

/** One row in the shortcuts list: label on the left, keys or slash example on the right. */
export interface ShortcutEntry {
  label: string;
  /** Key combination (e.g. Bold ⌘B). */
  keys?: KeyCombo;
  /** Slash command example shown on the right (e.g. "/h1"). */
  example?: string;
}

/** Group heading (optional). */
export interface ShortcutGroup {
  heading?: string;
  entries: ShortcutEntry[];
}

const FORMATTING: ShortcutEntry[] = [
  { label: "Bold", keys: { meta: true, key: "b" } },
  { label: "Italic", keys: { meta: true, key: "i" } },
  { label: "Underline", keys: { meta: true, key: "u" } },
  { label: "Strikethrough", keys: { meta: true, shift: true, key: "x" } },
  { label: "Link", keys: { meta: true, key: "k" } },
  { label: "Subscript", keys: { meta: true, key: "=" } },
  { label: "Superscript", keys: { meta: true, shift: true, key: "=" } },
];

const SLASH_COMMANDS: ShortcutEntry[] = [
  { label: "Table", example: "/table" },
  { label: "Heading 1", example: "/h1" },
  { label: "Heading 2", example: "/h2" },
  { label: "Heading 3", example: "/h3" },
  { label: "Bulleted list", example: "/bulleted-list" },
  { label: "Numbered list", example: "/numbered-list" },
  { label: "Quote", example: "/quote" },
];

const BLOCKS_AND_NAV: ShortcutEntry[] = [
  { label: "Table of contents", keys: { meta: true, key: "\\" } },
  { label: "Indent", keys: { key: "Tab" } },
  { label: "Outdent", keys: { shift: true, key: "Tab" } },
];

/** Grouped shortcut list for the shortcuts directory popup. */
export const EDITOR_SHORTCUT_GROUPS: ShortcutGroup[] = [
  { heading: "Formatting", entries: FORMATTING },
  { heading: "Slash commands", entries: SLASH_COMMANDS },
  { heading: "Blocks & navigation", entries: BLOCKS_AND_NAV },
];
