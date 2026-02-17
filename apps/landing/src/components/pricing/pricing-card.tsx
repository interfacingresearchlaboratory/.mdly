"use client";

import { Button } from "@editor/ui/button";
import { Card, CardContent } from "@editor/ui/card";
import { cn } from "@editor/ui/utils";
import { Check } from "lucide-react";

interface PricingCardProps {
  name?: string;
  price: string;
  period?: string;
  features?: string[];
  /** When set, shown as first line: "Everything in {includedTierName}" */
  includedTierName?: string;
  buttonText: string;
  isRecommended?: boolean;
  /** When true, removes border/ring/corners for grid layout with shared dividers */
  embedded?: boolean;
  onButtonClick?: () => void;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  includedTierName,
  buttonText,
  isRecommended = false,
  embedded = false,
  onButtonClick,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col bg-card border-border",
        embedded && "border-0 rounded-none ring-0",
        isRecommended && "border-primary/20"
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
            Recommended
          </span>
        </div>
      )}
      <CardContent className="flex flex-1 flex-col p-6 min-h-0">
        <div className="flex-1 space-y-10 min-h-0">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">{name}</h3>
            <div className="text-5xl font-medium">
              {price}
              {period && (
                <span className="text-xl font-normal text-muted-foreground">
                  {period}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">per user</p>
          </div>
          <ul className="space-y-3 text-sm">
            {includedTierName && (
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-foreground" />
                <span className="text-muted-foreground">
                  Everything in {includedTierName}
                </span>
              </li>
            )}
            {features?.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-foreground" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto pt-6">
          <Button
            variant={isRecommended ? "default" : "outline"}
            className={cn(
              "w-full",
              isRecommended
                ? "bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}
            size="lg"
            onClick={onButtonClick}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
