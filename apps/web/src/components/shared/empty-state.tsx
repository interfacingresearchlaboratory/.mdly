"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@editor/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { EntityIcon } from "@/components/shared/entity-icon";
import { cn } from "@editor/ui/utils";

type EntityType = "project" | "task" | "review" | "category" | "container";

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  /** When set, the primary/secondary button is wrapped in a tooltip showing this content (e.g. label + hotkey hint). */
  tooltipContent?: ReactNode;
}

export interface EmptyStateProps {
  entityType: EntityType;
  description: string;
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

function ActionButton({ action }: { action: EmptyStateAction }) {
  const button =
    action.href !== undefined ? (
      <Button asChild variant="outline" size="sm">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    );

  if (action.tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">{action.tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return button;
}

function PrimaryActionButton({ action }: { action: EmptyStateAction }) {
  const button =
    action.href !== undefined ? (
      <Button asChild size="sm">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ) : (
      <Button size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    );

  if (action.tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">{action.tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return button;
}

export function EmptyState({
  entityType,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const hasSecondary = secondaryAction && (secondaryAction.onClick ?? secondaryAction.href);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 min-h-0 text-center",
        className
      )}
    >
      <EntityIcon
        entityType={entityType}
        className="h-12 w-12 text-muted-foreground"
        strokeWidth={1.25}
      />
      <p className="text-center text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PrimaryActionButton action={primaryAction} />
        {hasSecondary && <ActionButton action={secondaryAction!} />}
      </div>
    </div>
  );
}
