"use client";

import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { FeatureTable } from "./feature-table";
import { PricingCard } from "./pricing-card";
import { PricingToggle } from "./pricing-toggle";
import { pricingFaqData } from "./pricing-faq-data";
import { FullWidthSeparator } from "@/components/full-width-separator";
import { SectionBuffer } from "@/components/section-buffer";
import { SectionWrapper } from "@/components/section-wrapper";
import { cn } from "@editor/ui/utils";
import { siteConfig } from "@/lib/site-config";
import { CTASection } from "../cta-section";

function getButtonText(productName: string): string {
  return "Get Started";
}

function getPriceDisplay(product: any, interval: "month" | "year" = "month") {
  // Always get monthly price first; yearly = monthly * 12
  let monthlyVariant = product;
  if (product.variants && product.variants.length > 0) {
    monthlyVariant =
      product.variants.find((variant: any) => {
        const priceItem = variant.items?.find(
          (item: any) => item.type === "price",
        );
        if (!priceItem) return false;
        const variantInterval = priceItem.interval?.toLowerCase();
        return variantInterval === "month" || variantInterval === "monthly";
      }) ||
      product.variants[0] ||
      product;
  }

  const priceItem = monthlyVariant.items?.find(
    (item: any) => item.type === "price",
  );
  if (!priceItem) {
    return {
      price: "Free",
      period: "",
      productId: monthlyVariant.id,
    };
  }

  const monthlyPrice = priceItem.price;
  const isFree = monthlyPrice == null || monthlyPrice === 0;

  if (isFree) {
    return {
      price: "Free",
      period: "",
      productId: monthlyVariant.id,
    };
  }

  const num =
    typeof monthlyPrice === "number"
      ? monthlyPrice
      : parseFloat(String(monthlyPrice));
  const displayPrice =
    interval === "year"
      ? Number.isNaN(num)
        ? monthlyPrice
        : Math.round(num * 12)
      : monthlyPrice;

  return {
    price: `$${displayPrice}`,
    period: interval === "year" ? "/yr." : "/mo.",
    productId: monthlyVariant.id,
  };
}

function getFeatures(product: any) {
  const features =
    product.items
      ?.filter((item: any) => item.type === "feature")
      .map((item: any) => {
        // Use the display text from the product item when available
        return (
          item.display?.primary_text || item.feature?.name || item.feature_id
        );
      }) || [];

  // Sort features: "Unlimited" first, then by number (largest first), then others
  return features.sort((a: string, b: string) => {
    const aStartsWithUnlimited = a?.toLowerCase().startsWith("unlimited");
    const bStartsWithUnlimited = b?.toLowerCase().startsWith("unlimited");

    // "Unlimited" features come first
    if (aStartsWithUnlimited && !bStartsWithUnlimited) return -1;
    if (!aStartsWithUnlimited && bStartsWithUnlimited) return 1;

    // If both are "Unlimited", maintain order
    if (aStartsWithUnlimited && bStartsWithUnlimited) return 0;

    // Check for numbers at the start
    const aNumberMatch = a?.match(/^(\d+)/);
    const bNumberMatch = b?.match(/^(\d+)/);

    // Both start with numbers - sort by number value (largest first)
    if (aNumberMatch && bNumberMatch) {
      const aNum = parseInt(aNumberMatch[1], 10);
      const bNum = parseInt(bNumberMatch[1], 10);
      return bNum - aNum; // Descending order
    }

    // Only one starts with number - numbered comes before non-numbered
    if (aNumberMatch && !bNumberMatch) return -1;
    if (!aNumberMatch && bNumberMatch) return 1;

    // Neither starts with number - maintain original order
    return 0;
  });
}

export interface PricingPageProps {
  products: any[];
  pricingError?: string | null;
}

export function PricingPage({ products, pricingError }: PricingPageProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");

  // Group products by name, then sort by monthly price (cheapest first) for tier order
  const groupedProducts = useMemo(() => {
    const grouped = new Map<string, any>();
    products.forEach((product: any) => {
      const productName = product.name;
      if (!grouped.has(productName)) {
        grouped.set(productName, { ...product, variants: [] });
      }
      grouped.get(productName).variants.push(product);
    });

    const list = Array.from(grouped.values());
    const monthlyPrice = (p: any) => {
      const { price } = getPriceDisplay(p, "month");
      if (price === "Free") return 0;
      const num = parseFloat(price.replace(/^\$/, ""));
      return Number.isNaN(num) ? 0 : num;
    };
    return list.slice().sort((a, b) => monthlyPrice(a) - monthlyPrice(b));
  }, [products]);

  return (
    <div className="w-full space-y-0">
      {/* Header: constrained to page width */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <h1 className="text-6xl font-medium text-center">Pricing</h1>
        <PricingToggle value={interval} onChange={setInterval} />
      </div>
      <FullWidthSeparator />

      {/* Pricing cards: within section wrapper for borders */}
      <SectionWrapper variant="bordered-hash">
        {pricingError || groupedProducts.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 w-full max-w-7xl mx-auto">
            {pricingError ?? "No pricing plans available"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 w-full max-w-7xl mx-auto">
            {groupedProducts.map((product, i) => {
            const priceDisplay = getPriceDisplay(product, interval);
            const allFeatures = getFeatures(product);
            const previousFeatures =
              i >= 1 ? getFeatures(groupedProducts[i - 1]) : [];
            const features =
              i === 0
                ? allFeatures
                : allFeatures.filter(
                    (f: string) => !previousFeatures.includes(f),
                  );
            const includedTierName =
              i >= 1 ? groupedProducts[i - 1].name : undefined;

            return (
              <div
                key={product.id}
                className={cn(
                  "flex flex-col min-h-0",
                  i > 0 && "border-t md:border-t-0 md:border-l border-border",
                )}>
                <PricingCard
                  embedded
                  name={product.name}
                  price={priceDisplay.price}
                  period={priceDisplay.period || undefined}
                  features={features}
                  includedTierName={includedTierName}
                  buttonText={getButtonText(product.name)}
                  onButtonClick={() => {
                    window.location.href = siteConfig.signUpUrl;
                  }}
                />
              </div>
            );
          })}
          </div>
        )}
      </SectionWrapper>

      <FullWidthSeparator />
      <SectionBuffer variant="green-dashed" />
      <FullWidthSeparator />

      <div className="flex flex-col items-center">
        <a
          href="#enterprise"
          className="flex items-center gap-1 text-[#0101fd] hover:opacity-90 transition-opacity text-3xl">
          <span>Use MONOid in your enterprise</span>
          <ArrowRight className="h-6 w-6 translate-y-0.5" />
        </a>
      </div>
      <FullWidthSeparator />

      <SectionBuffer variant="green-dashed" />
      <FullWidthSeparator />

      <SectionWrapper variant="bordered-hash-alt">
        <FeatureTable
          plans={groupedProducts.map((p) => ({
            name: p.name,
            features: getFeatures(p),
            price: getPriceDisplay(p, interval).price,
            period: getPriceDisplay(p, interval).period || undefined,
          }))}
        />
      </SectionWrapper>
      <FullWidthSeparator />
      <SectionBuffer />
      <FullWidthSeparator />

      <SectionWrapper variant="bordered-hash">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8">
          <div className="p-2 md:p-10">
            <div className="text-5xl md:text-6xl font-base text-[#0101fd] mb-4">
              FAQ
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-col divide-y divide-border">
              {pricingFaqData.map((item) => (
                <div key={item.question} className="py-6 px-4">
                  <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>
      <FullWidthSeparator />
      <SectionBuffer variant="green-dashed" />
      <FullWidthSeparator />
      <SectionWrapper>
        <CTASection useLogo={true} />
      </SectionWrapper>
      <FullWidthSeparator />
      <SectionBuffer />
      <FullWidthSeparator />
    </div>
  );
}
