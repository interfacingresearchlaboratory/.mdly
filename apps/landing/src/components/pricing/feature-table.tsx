"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@editor/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@editor/ui/table";
import { cn } from "@editor/ui/utils";
import { Check, ChevronDown, Infinity } from "lucide-react";
import { parseFeature } from "@/lib/feature/parseFeature";
import {
  getPricingFeatures,
  normalizeCategoryForMatch,
  type PricingCategory,
  type PricingFeature,
} from "@/lib/feature/pricing-features";

interface PlanWithFeatures {
  name: string;
  features: string[];
  price?: string;
  period?: string;
}

interface FeatureTableProps {
  plans: PlanWithFeatures[];
  featureDefinitions?: ReturnType<typeof getPricingFeatures>;
}

function buildPlanValueMap(
  plans: PlanWithFeatures[]
): Map<string, (string | null)[]> {
  const map = new Map<string, (string | null)[]>();

  plans.forEach((plan, planIndex) => {
    plan.features.forEach((featureStr) => {
      const { category, value } = parseFeature(featureStr);
      if (!category) return;

      const key = normalizeCategoryForMatch(category);
      if (!map.has(key)) {
        map.set(key, new Array(plans.length).fill(null) as (string | null)[]);
      }
      const arr = map.get(key)!;
      arr[planIndex] = value;
    });
  });

  return map;
}

function getPlanValueOverride(
  planValues: Record<string, string>,
  planName: string
): string | null {
  const exact = planValues[planName];
  if (exact != null) return exact;
  const lower = planName.toLowerCase();
  for (const [key, value] of Object.entries(planValues)) {
    if (lower === key.toLowerCase() || lower.startsWith(key.toLowerCase())) return value;
  }
  return null;
}

function getValuesForFeature(
  feature: PricingFeature,
  plans: PlanWithFeatures[],
  planValueMap: Map<string, (string | null)[]>
): (string | null)[] {
  const result = new Array(plans.length).fill(null) as (string | null)[];

  if (feature.planValues) {
    plans.forEach((plan, i) => {
      const override = getPlanValueOverride(feature.planValues!, plan.name);
      result[i] = override;
    });
    return result;
  }

  const patterns = feature.featurePatterns ?? (feature.featurePattern ? [feature.featurePattern] : []);
  for (const pattern of patterns) {
    const key = normalizeCategoryForMatch(pattern);
    const values = planValueMap.get(key);
    if (values) {
      values.forEach((v, i) => {
        if (v != null && result[i] == null) result[i] = v;
      });
    }
  }
  return result;
}

export function FeatureTable({
  plans,
  featureDefinitions = getPricingFeatures(),
}: FeatureTableProps) {
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());
  const planValueMap = buildPlanValueMap(plans);

  if (!plans.length) return null;

  const categories = [...featureDefinitions.categories].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Table className="text-base">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%] font-medium text-muted-foreground py-2">
              Feature
            </TableHead>
            {plans.map((plan) => (
              <TableHead
                key={plan.name}
                className="text-center font-medium text-muted-foreground py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span>{plan.name}</span>
                  {(plan.price ?? plan.period) && (
                    <span className="text-sm font-normal">
                      {plan.price}
                      {plan.period ? plan.period : ""}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category: PricingCategory) => (
            <React.Fragment key={category.id}>
              <TableRow className="bg-muted/30">
                <TableCell
                  colSpan={plans.length + 1}
                  className="font-medium text-foreground py-2 align-middle"
                >
                  {category.name}
                </TableCell>
              </TableRow>
              {category.features.map((feature: PricingFeature) => {
                const values = getValuesForFeature(feature, plans, planValueMap);
                const rowId = `${category.id}-${feature.id}`;
                const isOpen = openRows.has(rowId);

                return (
                  <TableRow key={rowId} className="group">
                      <TableCell className="text-foreground align-middle py-4">
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) => {
                            setOpenRows((prev) => {
                              const next = new Set(prev);
                              if (open) next.add(rowId);
                              else next.delete(rowId);
                              return next;
                            });
                          }}
                        >
                          <div className="flex flex-col gap-0">
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity py-0">
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                              <span className="font-medium">{feature.name}</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-3 pl-6 border-l-2 border-muted-foreground/20">
                                <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                                  {feature.explanation}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      </TableCell>
                      {values.map((value, i) => (
                        <TableCell
                          key={plans[i]?.name ?? i}
                          className="text-center text-foreground align-middle"
                        >
                          {feature.displayAsTick && value && value !== "—" ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : value?.toLowerCase() === "unlimited" ? (
                            <Infinity className="h-5 w-5 text-foreground mx-auto" />
                          ) : (
                            value && value !== "—" ? value : "—"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
