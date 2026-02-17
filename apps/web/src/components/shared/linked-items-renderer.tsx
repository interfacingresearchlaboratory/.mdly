"use client";

import { Badge } from "@editor/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { EntityIcon } from "@/components/shared/entity-icon";

export type EntityType = "project" | "task" | "container";

export interface LinkedItemsRendererProps {
  items: Array<{ name: string }> | undefined;
  entityType: EntityType;
  emptyText: string;
  variant?: "list" | "grid" | "simple";
  maxWidth?: string;
  maxAvatars?: number;
}

export function LinkedItemsRenderer({
  items,
  entityType,
  emptyText,
  variant = "list",
  maxWidth,
  maxAvatars,
}: LinkedItemsRendererProps) {
  const pluralForm =
    entityType === "project"
      ? "projects"
      : entityType === "container"
        ? "containers"
        : "tasks";

  // Show "0 {pluralForm}" when no items — plain text, not in a badge
  if (!items || items.length === 0) {
    const emptyContent = (
      <>
        <EntityIcon
          entityType={entityType}
          className="h-3 w-3 shrink-0"
          strokeWidth={variant === "simple" ? 1.5 : undefined}
        />
        <span>0 {pluralForm}</span>
      </>
    );
    if (variant === "list") {
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${
            maxWidth ? `max-w-[${maxWidth}]` : "max-w-[200px]"
          }`}
        >
          {emptyContent}
        </span>
      );
    }
    if (variant === "grid") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground ${
            maxWidth ? `max-w-[${maxWidth}]` : "max-w-[150px]"
          } min-w-0`}
        >
          <EntityIcon
            entityType={entityType}
            className="h-3 w-3 shrink-0"
            strokeWidth={1.5}
          />
          <span className="truncate">0 {pluralForm}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground">
        {emptyContent}
      </span>
    );
  }

  // Single item display
  if (items.length === 1) {
    const firstItem = items[0];
    if (!firstItem) return null;
    const singleItemContent = (
      <>
        <EntityIcon
          entityType={entityType}
          className="h-3 w-3 shrink-0"
          strokeWidth={variant === "simple" ? 1.5 : undefined}
        />
        <span
          className={variant === "list" ? "truncate" : "truncate max-w-[120px]"}
        >
          {firstItem.name}
        </span>
      </>
    );

    if (variant === "list") {
      // List variant: Badge with tooltip
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs ${
                  maxWidth ? `max-w-[${maxWidth}]` : "max-w-[200px]"
                }`}
              >
                {singleItemContent}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex items-center gap-1.5">
                <EntityIcon entityType={entityType} className="h-3 w-3 shrink-0" />
                <p className="max-w-xs">{firstItem.name}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (variant === "grid") {
      // Grid variant: Div with tooltip
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-muted text-foreground/80 rounded-md ${
                  maxWidth ? `max-w-[${maxWidth}]` : "max-w-[150px]"
                } min-w-0`}
              >
                {singleItemContent}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex items-center gap-1.5">
                <EntityIcon entityType={entityType} className="h-3 w-3 shrink-0" />
                <p className="max-w-xs">{firstItem.name}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Simple variant: Div without tooltip
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-foreground/80 border border-border/60 rounded-md">
        {singleItemContent}
      </div>
    );
  }

  // Multiple items display
  const avatarCount = maxAvatars ?? 5;
  const avatarSize = "w-5 h-5";
  const avatarBorder = "border-2";
  const avatarSpacing = "-space-x-1.5";
  const textSize = "text-[10px]";

  if (variant === "list") {
    // List variant: Avatar circles with tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{items.length}</span>
              <div className={`flex items-center ${avatarSpacing}`}>
                {items.slice(0, avatarCount).map((item, idx) => (
                  <div
                    key={idx}
                    className={`${avatarSize} rounded-full bg-muted ${avatarBorder} border-border flex items-center justify-center flex-shrink-0`}
                    title={item.name}
                  >
                    <EntityIcon
                      entityType={entityType}
                      className="h-3 w-3 text-muted-foreground"
                    />
                  </div>
                ))}
                {items.length > avatarCount && (
                  <div
                    className={`${avatarSize} rounded-full bg-muted ${avatarBorder} border-border flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={`${textSize} text-muted-foreground font-medium`}>
                      +{items.length - avatarCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <EntityIcon entityType={entityType} className="h-3 w-3 shrink-0" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "grid") {
    // Grid variant: Count text with tooltip (matching scout/asset grid card pattern)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-muted text-foreground border border-border/60 rounded-md ${
                maxWidth ? `max-w-[${maxWidth}]` : "max-w-[150px]"
              } min-w-0`}
            >
              <EntityIcon
                entityType={entityType}
                className="h-3 w-3 shrink-0"
                strokeWidth={1.5}
              />
              <span className="truncate">
                {items.length} {pluralForm}
              </span>
            </div>
          </TooltipTrigger>
          {items.length > 1 && (
            <TooltipContent>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx}>{item.name}</div>
                ))}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Simple variant: Count text without tooltip
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-foreground border border-border/60 rounded-md">
      <EntityIcon
        entityType={entityType}
        className="h-3 w-3 shrink-0"
        strokeWidth={1.5}
      />
      <span>
        {items.length} {pluralForm}
      </span>
    </div>
  );
}
