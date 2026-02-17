import { PricingPage } from "@/components/pricing/pricing-page";
import { getPricingProducts } from "@/lib/pricing/get-pricing-products";

export const dynamic = "force-dynamic";

export default async function Pricing() {
  let products: any[] = [];
  let error: string | null = null;

  try {
    const result = await getPricingProducts();
    products = result.products;
  } catch (err) {
    console.error("[pricing] Failed to load products:", err);
    error = err instanceof Error ? err.message : "Failed to load pricing information";
  }

  return (
    <div className="page-container pt-32 flex-1 w-full">
      <PricingPage products={products} pricingError={error} />
    </div>
  );
}
