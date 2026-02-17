"use client";

interface UseFeatureAccessOptions {
  featureId: string;
  requiredBalance?: number;
}

interface UseFeatureAccessResult {
  allowed: boolean;
  isLoading: boolean;
  productId: string | null;
  checkResult: { allowed: boolean } | undefined;
}

/**
 * Stub: no backend/auth — always allow. Returns whether the current customer has access to a feature.
 */
export function useFeatureAccess({
  featureId: _featureId,
  requiredBalance: _requiredBalance,
}: UseFeatureAccessOptions): UseFeatureAccessResult {
  return {
    allowed: true,
    isLoading: false,
    productId: null,
    checkResult: { allowed: true },
  };
}
