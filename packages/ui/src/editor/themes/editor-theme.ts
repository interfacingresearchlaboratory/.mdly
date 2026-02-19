import { EditorThemeClasses } from "lexical"

import {
  type LetterSpacingTypographyConfig,
  mergeLetterSpacingIntoTheme,
} from "../../lib/typography/letter-spacing"
import {
  type FontWeightTypographyConfig,
  mergeFontWeightIntoTheme,
} from "../../lib/typography/font-weight"
import {
  type FontFamilyTypographyConfig,
  mergeFontFamilyIntoTheme,
} from "../../lib/typography/font-family-slots"
import {
  type FontSizeTypographyConfig,
  mergeFontSizeIntoTheme,
} from "../../lib/typography/font-size"

export type {
  LetterSpacingTypographyConfig,
  FontWeightTypographyConfig,
  FontFamilyTypographyConfig,
  FontSizeTypographyConfig,
}

/** Combined typography config for document settings (letter spacing, font weight, font, size). */
export interface TypographyConfig {
  letterSpacing?: LetterSpacingTypographyConfig
  fontWeight?: FontWeightTypographyConfig
  /** Font family for the entire document. Applied to editor content wrapper. */
  fontFamily?: string
  /** Font size for the entire document (e.g. "16px" or "1rem"). Applied to editor content wrapper. */
  fontSize?: string
  /** Per-type font family overrides (Tailwind font class per slot). */
  fontFamilySlots?: FontFamilyTypographyConfig
  /** Per-type font size overrides (Tailwind text-* class per slot). */
  fontSizeSlots?: FontSizeTypographyConfig
}

import "./editor-theme.css"

const baseEditorTheme: EditorThemeClasses = {
  ltr: "text-left",
  rtl: "text-right",
  heading: {
    h1: "scroll-m-20 text-3xl font-medium tracking-tight mt-2 mb-2",
    h2: "scroll-m-20 text-2xl font-medium tracking-tight mt-2 mb-2",
    h3: "scroll-m-20 text-xl font-medium tracking-tight mt-1 mb-1",
    h4: "scroll-m-20 text-lg font-medium tracking-tight mt-1 mb-1",
    h5: "scroll-m-20 text-lg font-medium tracking-tight",
    h6: "scroll-m-20 text-base font-medium tracking-tight",
  },
  paragraph: "leading-7 [&:not(:first-child)]:mt-2 [&:not(:last-child)]:mb-2",
  quote: "mt-6 border-l-2 pl-6 italic",
  link: "text-blue-600 hover:underline hover:cursor-pointer",
  list: {
    checklist: "relative",
    listitem: "mx-4",
    listitemChecked:
      'relative ml-0 mr-2 px-6 list-none outline-none line-through before:content-[""] before:w-4 before:h-4 before:top-1 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border before:border-primary before:rounded before:bg-primary before:bg-no-repeat after:content-[""] after:cursor-pointer after:border-white after:border-solid after:absolute after:block after:top-[8px] after:w-[3px] after:left-[7px] after:right-[7px] after:h-[6px] after:rotate-45 after:border-r-2 after:border-b-2 after:border-l-0 after:border-t-0',
    listitemUnchecked:
      'relative ml-0 mr-2 px-6 list-none outline-none before:content-[""] before:w-4 before:h-4 before:top-1 before:left-0 before:cursor-pointer before:block before:bg-cover before:absolute before:border before:border-primary before:rounded',
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    ol: "my-2 m-0 p-0 list-decimal list-outside [&>li]:mt-2",
    olDepth: [
      "list-outside !list-decimal",
      "list-outside !list-[lower-alpha]",
      "list-outside !list-[lower-roman]",
      "list-outside !list-[upper-alpha]",
      "list-outside !list-[upper-roman]",
    ],
    ul: "m-0 p-0 list-disc list-outside",
  },
  hashtag: "text-blue-600 bg-blue-100 rounded-md px-1",
  text: {
    bold: "font-medium tracking-normal",
    code: "bg-muted text-foreground p-1 rounded-md tracking-normal",
    italic: "italic tracking-normal",
    strikethrough: "line-through tracking-normal",
    subscript: "sub",
    superscript: "sup",
    underline: "underline tracking-normal",
    underlineStrikethrough: "underline line-through tracking-normal",
  },
  image: "relative inline-block user-select-none cursor-default editor-image",
  inlineImage:
    "relative inline-block user-select-none cursor-default inline-editor-image",
  keyword: "text-purple-900 font-medium",
  code: "EditorTheme__code border border-border rounded-lg bg-muted/50",
  codeHighlight: {
    atrule: "EditorTheme__tokenAttr tracking-normal",
    attr: "EditorTheme__tokenAttr tracking-normal",
    boolean: "EditorTheme__tokenProperty tracking-normal",
    builtin: "EditorTheme__tokenSelector tracking-normal",
    cdata: "EditorTheme__tokenComment tracking-normal",
    char: "EditorTheme__tokenSelector tracking-normal",
    class: "EditorTheme__tokenFunction tracking-normal",
    "class-name": "EditorTheme__tokenFunction tracking-normal",
    comment: "EditorTheme__tokenComment tracking-normal",
    constant: "EditorTheme__tokenProperty tracking-normal",
    deleted: "EditorTheme__tokenProperty tracking-normal",
    doctype: "EditorTheme__tokenComment tracking-normal",
    entity: "EditorTheme__tokenOperator tracking-normal",
    function: "EditorTheme__tokenFunction tracking-normal",
    important: "EditorTheme__tokenVariable tracking-normal",
    inserted: "EditorTheme__tokenSelector tracking-normal",
    keyword: "EditorTheme__tokenAttr tracking-normal",
    namespace: "EditorTheme__tokenVariable tracking-normal",
    number: "EditorTheme__tokenProperty tracking-normal",
    operator: "EditorTheme__tokenOperator tracking-normal",
    prolog: "EditorTheme__tokenComment tracking-normal",
    property: "EditorTheme__tokenProperty tracking-normal",
    punctuation: "EditorTheme__tokenPunctuation tracking-normal",
    regex: "EditorTheme__tokenVariable tracking-normal",
    selector: "EditorTheme__tokenSelector tracking-normal",
    string: "EditorTheme__tokenSelector tracking-normal",
    symbol: "EditorTheme__tokenProperty tracking-normal",
    tag: "EditorTheme__tokenProperty tracking-normal",
    url: "EditorTheme__tokenOperator tracking-normal",
    variable: "EditorTheme__tokenVariable tracking-normal",
  },
  characterLimit: "!bg-destructive/50",
  table: "EditorTheme__table w-fit overflow-scroll border-collapse",
  tableCell:
    "EditorTheme__tableCell w-24 relative border px-2 py-1 text-sm text-left [&[align=center]]:text-center [&[align=right]]:text-right",
  tableCellActionButton:
    "EditorTheme__tableCellActionButton bg-background block border-0 rounded-2xl w-5 h-5 text-foreground cursor-pointer",
  tableCellActionButtonContainer:
    "EditorTheme__tableCellActionButtonContainer block right-1 top-1.5 absolute z-10 w-5 h-5",
  tableCellEditing: "EditorTheme__tableCellEditing rounded-sm shadow-sm",
  tableCellHeader:
    "EditorTheme__tableCellHeader bg-muted border px-2 py-1 text-sm text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right",
  tableCellPrimarySelected:
    "EditorTheme__tableCellPrimarySelected border border-primary border-solid block h-[calc(100%-2px)] w-[calc(100%-2px)] absolute -left-[1px] -top-[1px] z-10 ",
  tableCellResizer:
    "EditorTheme__tableCellResizer absolute -right-1 h-full w-2 cursor-ew-resize z-10 top-0",
  tableCellSelected: "EditorTheme__tableCellSelected bg-muted",
  tableCellSortedIndicator:
    "EditorTheme__tableCellSortedIndicator block opacity-50 bsolute bottom-0 left-0 w-full h-1 bg-muted",
  tableResizeRuler:
    "EditorTheme__tableCellResizeRuler block absolute w-[1px] h-full bg-primary top-0",
  tableRowStriping:
    "EditorTheme__tableRowStriping m-0 border-t p-0 even:bg-muted",
  tableSelected: "EditorTheme__tableSelected ring-2 ring-primary ring-offset-2",
  tableSelection: "EditorTheme__tableSelection bg-transparent",
  layoutItem: "border border-dashed px-4 py-2",
  layoutContainer: "grid gap-2.5 my-2.5 mx-0",
  autocomplete: "text-muted-foreground",
  blockCursor: "",
  embedBlock: {
    base: "user-select-none",
    focus: "ring-2 ring-primary ring-offset-2",
  },
  hr: 'p-0.5 border-none my-1 mx-0 cursor-pointer after:content-[""] after:block after:h-0.5 after:bg-muted selected:ring-2 selected:ring-primary selected:ring-offset-2 selected:user-select-none',
  indent: "[--lexical-indent-base-value:40px]",
  mark: "",
  markOverlap: "",
  smartSection: "EditorTheme__smartSection",
  smartSectionHeader: "EditorTheme__smartSectionHeader",
  smartSectionContent: "EditorTheme__smartSectionContent",
  mention: "EditorTheme__mention",
  placeholder: "EditorTheme__placeholder",
}

/** Base theme (no typography overrides). */
export const editorTheme: EditorThemeClasses = baseEditorTheme

/**
 * Returns the editor theme, optionally merged with typography config.
 * Use this when the editor accepts configurable typography (e.g. from document settings).
 */
export function getEditorTheme(typography?: TypographyConfig): EditorThemeClasses {
  if (!typography) return baseEditorTheme
  let theme = baseEditorTheme
  if (typography.letterSpacing && Object.keys(typography.letterSpacing).length > 0) {
    theme = mergeLetterSpacingIntoTheme(theme, typography.letterSpacing)
  }
  if (typography.fontWeight && Object.keys(typography.fontWeight).length > 0) {
    theme = mergeFontWeightIntoTheme(theme, typography.fontWeight)
  }
  if (typography.fontFamilySlots && Object.keys(typography.fontFamilySlots).length > 0) {
    theme = mergeFontFamilyIntoTheme(theme, typography.fontFamilySlots)
  }
  if (typography.fontSizeSlots && Object.keys(typography.fontSizeSlots).length > 0) {
    theme = mergeFontSizeIntoTheme(theme, typography.fontSizeSlots)
  }
  return theme
}
