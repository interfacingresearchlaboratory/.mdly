/**
 * Escapes special regex characters so a literal string can be used in RegExp.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a RegExp for literal find-in-file search.
 * - caseSensitive: use 'g' only; otherwise 'gi'.
 * - wholeWord: wrap pattern in \b...\b.
 */
export function buildFindRegex(
  query: string,
  caseSensitive: boolean,
  wholeWord: boolean
): RegExp | null {
  if (query.length === 0) return null;
  const escaped = escapeRegex(query);
  const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
  const flags = caseSensitive ? "g" : "gi";
  return new RegExp(pattern, flags);
}
