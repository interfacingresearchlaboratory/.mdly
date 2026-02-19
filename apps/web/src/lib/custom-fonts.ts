/** A font added by the user (file upload). */
export interface CustomFont {
  id: string;
  /** CSS font-family name (used in @font-face and in pickers). */
  fontFamily: string;
  /** Blob URL for the font file (session-scoped). */
  url: string;
  /** Format for @font-face: woff2, woff, opentype, truetype. */
  format: string;
}

/** Infer CSS format from file extension for @font-face. */
export function getFontFormatFromFile(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".woff2")) return "woff2";
  if (name.endsWith(".woff")) return "woff";
  if (name.endsWith(".otf")) return "opentype";
  return "truetype";
}

/**
 * Derive a display/font-family name from the file (filename without extension).
 * Replaces hyphens/underscores with spaces and trims.
 */
export function fontFamilyNameFromFile(file: File): string {
  const base = file.name.replace(/\.[^.]+$/, "").trim() || "Custom Font";
  return base.replace(/[-_]+/g, " ").trim() || "Custom Font";
}

/**
 * Generate a short unique id for a custom font (for class names and keys).
 */
export function generateCustomFontId(): string {
  return `cf-${Math.random().toString(36).slice(2, 10)}`;
}
