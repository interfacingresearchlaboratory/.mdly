"use client";

import { Lock } from "lucide-react";
import { Button } from "@editor/ui/button";
import { Card, CardContent } from "@editor/ui/card";
import { cn } from "@editor/ui/utils";
import { getDisplayNameForFeature } from "@/lib/feature-ids";
import { useFeatureAccess } from "@/hooks/use-feature-access";

export interface FeatureGateProps {
  featureId: string;
  requiredBalance?: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  productIdOverride?: string | null;
}

/** Reusable upgrade prompt (card + CTA) for use in FeatureGate or inside dialogs. */
export interface UpgradePromptProps {
  featureId: string;
  requiredBalance?: number;
  productId: string | null;
  onUpgrade: (productId: string | null) => void;
  className?: string;
  /** When true, render without Card border (e.g. inside a dialog). */
  embedded?: boolean;
}

export function UpgradePrompt({
  featureId,
  requiredBalance,
  productId,
  onUpgrade,
  className,
  embedded,
}: UpgradePromptProps) {
  const displayName = getDisplayNameForFeature(featureId);
  const message =
    requiredBalance != null
      ? `You've reached your limit for ${displayName}. Please upgrade to continue.`
      : `Upgrade to access ${displayName}.`;

  const content = (
    <>
      <Lock className="h-8 w-8 text-muted-foreground shrink-0" strokeWidth={1.5}/>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        size="sm"
        onClick={() => onUpgrade(productId)}
        className="w-fit">
        Upgrade
      </Button>
    </>
  );

  if (embedded) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>{content}</div>
    );
  }

  return (
    <Card className={cn("border-border bg-muted/30", className)}>
      <CardContent className="flex flex-col gap-3 pt-6">{content}</CardContent>
    </Card>
  );
}

/**
 * Renders children when the customer has access to the feature; otherwise shows
 * Renders children when the customer has access to the feature; otherwise shows an upgrade prompt.
 */
export function FeatureGate({
  featureId: _featureId,
  requiredBalance: _requiredBalance,
  children,
  fallback: _fallback,
  productIdOverride: _productIdOverride,
}: FeatureGateProps) {
  const { allowed, isLoading, productId } = useFeatureAccess({
    featureId: _featureId,
    requiredBalance: _requiredBalance,
  });

  if (isLoading) {
    return null;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (_fallback !== undefined) {
    return <>{_fallback}</>;
  }

  const effectiveProductId = _productIdOverride ?? productId;
  const handleUpgrade = (_productId: string | null) => {
    window.location.href = "/settings?tab=billing";
  };

  return (
    <UpgradePrompt
      featureId={_featureId}
      requiredBalance={_requiredBalance}
      productId={effectiveProductId}
      onUpgrade={handleUpgrade}
    />
  );
}
