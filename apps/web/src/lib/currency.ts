/**
 * Format an amount in the smallest currency unit (e.g. cents for USD) as a display string.
 */
export function formatCurrency(amountInSmallestUnit: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  // Assume standard 2-decimal currencies (cents for USD, etc.)
  const major = amountInSmallestUnit / 100;
  return formatter.format(major);
}
