"use client";

import { useEffect, useState } from "react";
import {
  Grid3x3,
  List,
  LayoutGrid,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ArrowBigUp,
  Rows,
  Columns,
  Layers,
  Layers2,
  ArrowUpDown,
} from "lucide-react";
import { getEntityIconOrNull } from "@/lib/entity-icons";
import { Button } from "@editor/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editor/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import { Label } from "@editor/ui/label";
import { Separator } from "@editor/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { Kbd } from "@editor/ui/kbd";
import { cn } from "@editor/ui/utils";

export type ViewMode = "list" | "grid" | "kanban";

export type Compactness = "compact" | "regular" | "relaxed";

export type Grouping = "none" | "status" | "priority" | "category" | "project" | "container" | "space" | "label" | "routineBlock";

export type SortColumn = "name" | "priority" | "estimatedCost" | "potentialCost" | "need" | "urgency" | "use" | "longevity" | "roi" | "systemFit" | "emotionalPull" | "infrastructureFit" | "activationPotential" | "status" | "currentStrength" | "cost" | "condition" | "satisfaction" | "friction" | "lifetimeValue" | "totalAssetValue" | "totalScoutValue" | "totalScoutReviewValue" | "projectId" | "linkedSpaces" | "linkedScouts" | "linkedAssets" | "projects" | "tasks" | "spaces" | "sources" | "category" | "usage" | "scout" | "acquisitionDate" | "createdAt" | "updatedAt" | "account" | "monthlyTotal" | "annualTotal" | "title" | "bucket" | "routineBlock" | "date" | null;

export interface DisplayConfigProps {
  // View mode
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  availableViewModes: readonly ViewMode[];

  // Grouping
  primaryGrouping: Grouping;
  onPrimaryGroupingChange: (grouping: Grouping) => void;
  availableGroupings: readonly Grouping[];
  groupingLabels?: Record<Grouping, string>;

  // Secondary grouping
  secondaryGrouping: Grouping | null;
  onSecondaryGroupingChange: (grouping: Grouping | null) => void;
  showSecondaryGrouping?: boolean;

  // Board grouping (for kanban view)
  boardGrouping: Grouping;
  onBoardGroupingChange: (grouping: Grouping) => void;

  // Sorting
  sortColumn: SortColumn;
  onSortColumnChange: (column: SortColumn) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  availableSortColumns: readonly SortColumn[];
  sortColumnLabels?: Partial<Record<Exclude<SortColumn, null>, string>>;

  // Visible properties
  visibleProperties: Record<string, boolean>;
  onVisiblePropertiesChange: (properties: Record<string, boolean>) => void;
  availableProperties: ReadonlyArray<{ key: string; label: string }>;
  defaultVisibleProperties?: Record<string, boolean>;

  // Compactness
  compactness: Compactness;
  onCompactnessChange: (compactness: Compactness) => void;
}

export function DisplayConfig({
  viewMode,
  onViewModeChange,
  availableViewModes,
  primaryGrouping,
  onPrimaryGroupingChange,
  availableGroupings,
  groupingLabels,
  secondaryGrouping,
  onSecondaryGroupingChange,
  showSecondaryGrouping = false,
  boardGrouping,
  onBoardGroupingChange,
  sortColumn,
  onSortColumnChange,
  sortDirection,
  onSortDirectionChange,
  availableSortColumns,
  sortColumnLabels,
  visibleProperties,
  onVisiblePropertiesChange,
  availableProperties,
  defaultVisibleProperties,
  compactness,
  onCompactnessChange,
}: DisplayConfigProps) {
  const [open, setOpen] = useState(false);

  // Hotkey: Shift+V opens the popover (avoids inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if ((e.key === "v" || e.key === "V") && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getGroupingLabel = (grouping: Grouping): string => {
    if (groupingLabels?.[grouping]) {
      return groupingLabels[grouping];
    }
    if (grouping === "none") return "None";
    return (
      grouping.charAt(0).toUpperCase() +
      grouping.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  const getSortColumnLabel = (column: Exclude<SortColumn, null>): string => {
    if (sortColumnLabels?.[column]) {
      return sortColumnLabels[column];
    }
    return (
      column.charAt(0).toUpperCase() +
      column.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  // Get secondary grouping options (exclude primary selection and "none")
  const secondaryGroupingOptions = availableGroupings.filter(
    (g) => g !== primaryGrouping && g !== "none"
  );
  const isSecondaryGroupingDisabled =
    primaryGrouping === "none" || availableGroupings.length === 0;

  // Check if visible properties section should be shown (list, grid, or kanban view)
  const showVisibleProperties =
    (viewMode === "list" || viewMode === "grid" || viewMode === "kanban") &&
    availableProperties.length > 0;

  // Get board grouping options (exclude "none" since it's required for kanban)
  const boardGroupingOptions = availableGroupings.filter(
    (g) => g !== "none"
  );
  const showBoardGrouping = viewMode === "kanban";

  // Rating properties that should be filtered out in grid view (they're only on radar chart)
  const ratingProperties = [
    "need",
    "urgency",
    "use",
    "longevity",
    "roi",
    "systemFit",
    "emotionalPull",
    "infrastructureFit",
    "activationPotential",
  ];

  // Filter available properties based on view mode
  const filteredAvailableProperties =
    viewMode === "grid" || viewMode === "kanban"
      ? availableProperties.filter(
          (prop) => !ratingProperties.includes(prop.key)
        )
      : availableProperties;

  const handlePropertyToggle = (key: string, checked: boolean) => {
    onVisiblePropertiesChange({
      ...visibleProperties,
      [key]: checked,
    });
  };

  const handleResetProperties = () => {
    if (defaultVisibleProperties) {
      onVisiblePropertiesChange({ ...defaultVisibleProperties });
    } else {
      // If no defaults, show all
      const allVisible = availableProperties.reduce((acc, prop) => {
        acc[prop.key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      onVisiblePropertiesChange(allVisible);
    }
  };

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "grid":
        return <Grid3x3 className="h-4 w-4" />;
      case "list":
        return <List className="h-4 w-4" />;
      case "kanban":
        return <LayoutGrid className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getViewModeLabel = (mode: ViewMode): string => {
    switch (mode) {
      case "grid":
        return "Grid";
      case "list":
        return "List";
      case "kanban":
        return "Board";
      default:
        return String(mode);
    }
  };

  const getCompactnessLabel = (value: Compactness): string => {
    switch (value) {
      case "compact":
        return "Compact";
      case "regular":
        return "Regular";
      case "relaxed":
        return "Relaxed";
    }
  };

  const SettingsIcon = getEntityIconOrNull("settings");
  const SettingsIconComponent = SettingsIcon || (() => null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="text-xs flex items-center gap-1.5 h-7 px-1.5">
                <SettingsIconComponent className="h-3.5 w-3.5" />
                Display
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex items-center gap-2">
              <span>Display settings configuration</span>
              <div className="flex items-center gap-1">
                <Kbd>
                  <ArrowBigUp className="h-3.5 w-3.5" />
                </Kbd>
                <Kbd>V</Kbd>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          {/* View Options - only show when more than one mode */}
          {availableViewModes.length > 1 && (
            <>
              <div className="space-y-2">
                <div className={cn(
                  "grid gap-2",
                  availableViewModes.length === 2
                    ? "grid-cols-2"
                    : availableViewModes.includes("kanban")
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-3"
                )}>
                  {availableViewModes.map((mode) => (
                    <button
                      key={String(mode)}
                      type="button"
                      onClick={() => onViewModeChange(mode)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-md border-2 transition-colors",
                        viewMode === mode
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                        mode === "kanban" && "hidden sm:flex"
                      )}>
                      {getViewModeIcon(mode)}
                      <span className="text-xs text-muted-foreground">
                        {getViewModeLabel(mode)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Compactness Options */}
          <div className="flex items-center justify-between gap-4">
            <Label className="text-xs text-muted-foreground whitespace-nowrap font-normal flex items-center gap-1.5">
              <Rows className="h-3.5 w-3.5" />
              Compactness
            </Label>
            <Select
              value={compactness}
              onValueChange={(value) =>
                onCompactnessChange(value as Compactness)
              }>
              <SelectTrigger className="w-[180px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["compact", "regular", "relaxed"] as const).map((value) => (
                  <SelectItem key={value} value={value}>
                    {getCompactnessLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Board Grouping (for kanban view) */}
          {showBoardGrouping && boardGroupingOptions.length > 0 && (
            <div className="hidden sm:block">
              <Separator />
              <div className="flex items-center justify-between gap-4 mt-3">
                <Label className="text-xs text-muted-foreground whitespace-nowrap font-normal flex items-center gap-1.5">
                  <Columns className="h-3.5 w-3.5" />
                  Columns
                </Label>
                <Select
                  value={String(boardGrouping)}
                  onValueChange={(value) =>
                    onBoardGroupingChange(value as Grouping)
                  }>
                  <SelectTrigger className="w-[180px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {boardGroupingOptions.map((grouping) => (
                      <SelectItem
                        key={String(grouping)}
                        value={String(grouping)}>
                        {getGroupingLabel(grouping)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Primary Group By */}
          {availableGroupings.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs text-muted-foreground whitespace-nowrap font-normal flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Grouping
                </Label>
                <Select
                  value={String(primaryGrouping)}
                  onValueChange={(value) =>
                    onPrimaryGroupingChange(value as Grouping)
                  }>
                  <SelectTrigger className="w-[180px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroupings.map((grouping) => (
                      <SelectItem
                        key={String(grouping)}
                        value={String(grouping)}>
                        {getGroupingLabel(grouping)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Secondary Group By */}
          {showSecondaryGrouping && availableGroupings.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs text-muted-foreground whitespace-nowrap font-normal flex items-center gap-1.5">
                  <Layers2 className="h-3.5 w-3.5" />
                  Sub-grouping
                </Label>
                <Select
                  value={secondaryGrouping ? String(secondaryGrouping) : "none"}
                  onValueChange={(value) =>
                    onSecondaryGroupingChange(
                      value === "none" ? null : (value as Grouping)
                    )
                  }
                  disabled={isSecondaryGroupingDisabled}>
                  <SelectTrigger className="w-[180px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {secondaryGroupingOptions.map((grouping) => (
                      <SelectItem
                        key={String(grouping)}
                        value={String(grouping)}>
                        {getGroupingLabel(grouping)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Sorting */}
          {availableSortColumns.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs text-muted-foreground whitespace-nowrap font-normal flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Ordering
                </Label>
                <div className="flex gap-2 flex-1 justify-end items-center">
                  <Select
                    value={sortColumn ? String(sortColumn) : "none"}
                    onValueChange={(value) =>
                      onSortColumnChange(
                        value === "none" ? null : (value as SortColumn)
                      )
                    }>
                    <SelectTrigger className="w-[140px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {availableSortColumns.filter((col): col is Exclude<SortColumn, null> => col !== null).map((column) => (
                        <SelectItem key={String(column)} value={String(column)}>
                          {getSortColumnLabel(column)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sortColumn && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() =>
                              onSortDirectionChange(
                                sortDirection === "asc" ? "desc" : "asc"
                              )
                            }>
                            {sortDirection === "asc" ? (
                              <ArrowUpNarrowWide className="h-4 w-4" />
                            ) : (
                              <ArrowDownWideNarrow className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{sortDirection === "asc" ? "A-Z" : "Z-A"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Visible Properties */}
          {showVisibleProperties && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground font-normal">
                    Visible Properties
                  </Label>
                  {defaultVisibleProperties && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleResetProperties}>
                      Reset
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {filteredAvailableProperties.map((property) => {
                    const isSelected = visibleProperties[property.key] ?? true;
                    return (
                      <button
                        key={property.key}
                        type="button"
                        onClick={() => handlePropertyToggle(property.key, !isSelected)}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/60 transition-opacity",
                          isSelected
                            ? "bg-muted text-foreground border border-border/60 opacity-100"
                            : "bg-muted text-foreground border border-border/60 opacity-40 hover:opacity-60"
                        )}>
                        <span>{property.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
