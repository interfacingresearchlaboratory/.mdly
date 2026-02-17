/**
 * Returns pricing products. No external billing SDK; returns empty list.
 * Used by the pricing page for server-side render.
 */
export async function getPricingProducts(): Promise<{ products: any[] }> {
  return { products: [] };
}
