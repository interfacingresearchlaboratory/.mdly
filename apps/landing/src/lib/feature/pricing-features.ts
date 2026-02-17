import pricingFeaturesJson from "../../../content/pricing-features.json";

export interface PricingFeature {
  id: string;
  name: string;
  explanation: string;
  featurePattern?: string;
  featurePatterns?: string[];
  /** Override values. Keys are plan names (e.g. Starter, Basic, Team), values are displayed. */
  planValues?: Record<string, string>;
  /** When true, show a tick for included plans instead of the raw value. */
  displayAsTick?: boolean;
}

export interface PricingCategory {
  id: string;
  name: string;
  order: number;
  features: PricingFeature[];
}

export interface PricingFeaturesConfig {
  categories: PricingCategory[];
}

export function getPricingFeatures(): PricingFeaturesConfig {
  return pricingFeaturesJson as PricingFeaturesConfig;
}

/**
 * Normalizes a parsed category string for matching against feature patterns.
 * "Containers" -> "containers", "Connected workspaces" -> "connected workspaces"
 */
export function normalizeCategoryForMatch(category: string): string {
  return category.toLowerCase().trim();
}
