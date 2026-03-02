import type { EditorThemeClasses } from "lexical"

/**
 * Letter spacing config keys that map to Lexical theme paths.
 * Values are Tailwind tracking classes (e.g. "tracking-tight", "tracking-wide") or arbitrary "tracking-[0.05em]".
 */
export interface LetterSpacingTypographyConfig {
  /** Block-level: headings h1–h6 */
  heading?: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", string>>
  /** Block-level: paragraph */
  paragraph?: string
  /** Block-level: blockquote */
  quote?: string
  /** Block-level: code block */
  code?: string
  /** Block-level: list items (applied to list.listitem etc.) */
  listitem?: string
  /** Block-level: table cell */
  tableCell?: string
  /** Block-level: table header cell */
  tableCellHeader?: string
  /** Inline text formats: bold, italic, code, underline, strikethrough */
  text?: Partial<
    Record<
      "bold" | "italic" | "code" | "underline" | "strikethrough" | "underlineStrikethrough",
      string
    >
  >
  /** Code highlight tokens (one value applied to all token types) */
  codeHighlight?: string
}

function appendClass(base: string, extra: string): string {
  if (!extra.trim()) return base
  return base ? `${base} ${extra}` : extra
}

/**
 * Merges letter-spacing overrides into a Lexical theme.
 * For each key present in config, appends the configured class to the base theme class.
 * Preserves existing theme when config is empty.
 */
export function mergeLetterSpacingIntoTheme(
  baseTheme: EditorThemeClasses,
  config: LetterSpacingTypographyConfig
): EditorThemeClasses {
  if (!config || Object.keys(config).length === 0) {
    return baseTheme
  }

  const result = { ...baseTheme } as EditorThemeClasses

  if (config.heading && baseTheme.heading) {
    result.heading = { ...baseTheme.heading }
    for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
      const value = config.heading[tag]
      if (value && result.heading[tag]) {
        result.heading[tag] = appendClass(
          baseTheme.heading[tag] ?? "",
          value
        )
      }
    }
  }

  if (config.paragraph && baseTheme.paragraph) {
    result.paragraph = appendClass(baseTheme.paragraph, config.paragraph)
  }

  if (config.quote && baseTheme.quote) {
    result.quote = appendClass(baseTheme.quote, config.quote)
  }

  if (config.code && baseTheme.code) {
    result.code = appendClass(baseTheme.code, config.code)
  }

  if (config.listitem && baseTheme.list?.listitem) {
    result.list = { ...baseTheme.list }
    result.list.listitem = appendClass(
      baseTheme.list.listitem,
      config.listitem
    )
  }

  if (config.tableCell && baseTheme.tableCell) {
    result.tableCell = appendClass(baseTheme.tableCell, config.tableCell)
  }

  if (config.tableCellHeader && baseTheme.tableCellHeader) {
    result.tableCellHeader = appendClass(
      baseTheme.tableCellHeader,
      config.tableCellHeader
    )
  }

  if (config.text && baseTheme.text) {
    result.text = { ...baseTheme.text }
    const textKeys = [
      "bold",
      "italic",
      "code",
      "underline",
      "strikethrough",
      "underlineStrikethrough",
    ] as const
    for (const key of textKeys) {
      const value = config.text[key]
      if (value && result.text[key]) {
        result.text[key] = appendClass(baseTheme.text[key] ?? "", value)
      }
    }
  }

  if (config.codeHighlight && baseTheme.codeHighlight) {
    const tokenClasses = baseTheme.codeHighlight as Record<string, string>
    const merged: Record<string, string> = {}
    for (const [token, cls] of Object.entries(tokenClasses)) {
      merged[token] = appendClass(cls, config.codeHighlight)
    }
    result.codeHighlight = merged
  }

  return result
}

/** Default Tailwind tracking presets for use in UI or config. */
export const LETTER_SPACING_PRESETS: Record<string, string> = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
  widest: "tracking-widest",
}

/**
 * Resolves a preset name or raw class/value to a Tailwind tracking class.
 * If value is already a class (contains "tracking-"), returns as-is.
 * If value is a preset key, returns the preset class.
 * Otherwise treats value as a CSS value and returns arbitrary class "tracking-[value]".
 */
export function letterSpacingToClass(value: string): string {
  if (!value.trim()) return ""
  if (value.includes("tracking-")) return value
  const preset = LETTER_SPACING_PRESETS[value]
  if (preset) return preset
  return `tracking-[${value}]`
}

/** Presets for inline letter-spacing (CSS values). Used for per-selection style. */
export const LETTER_SPACING_INLINE_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  { value: "-0.05em", label: "Tighter" },
  { value: "-0.025em", label: "Tight" },
  { value: "0", label: "Normal" },
  { value: "0.025em", label: "Wide" },
  { value: "0.05em", label: "Wider" },
  { value: "0.1em", label: "Widest" },
]
