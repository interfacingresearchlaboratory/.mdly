export interface ParsedFeature {
  category: string;
  value: string;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Parses a raw feature string from the pricing API into a normalized category and value.
 *
 * Handles common patterns:
 * - "Unlimited projects" → { category: "Projects", value: "Unlimited" }
 * - "10 projects" → { category: "Projects", value: "10" }
 * - "Email support" → { category: "Email support", value: "Included" }
 */
export function parseFeature(feature: string): ParsedFeature {
  const trimmed = String(feature ?? "").trim();
  if (!trimmed) return { category: "", value: "" };

  // "Unlimited X" pattern
  const unlimitedMatch = trimmed.match(/^Unlimited\s+(.+)$/i);
  if (unlimitedMatch) {
    return {
      category: capitalizeFirst(unlimitedMatch[1]),
      value: "Unlimited",
    };
  }

  // "N X" pattern (number + space + rest)
  const numberMatch = trimmed.match(/^(\d+)\s+(.+)$/);
  if (numberMatch) {
    return {
      category: capitalizeFirst(numberMatch[2]),
      value: numberMatch[1],
    };
  }

  // Plain feature (e.g. "Email support", "Priority support")
  return {
    category: trimmed,
    value: "Included",
  };
}
