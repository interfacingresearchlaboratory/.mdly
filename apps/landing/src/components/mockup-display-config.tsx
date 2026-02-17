"use client";

import { useState } from "react";
import {
  LayoutGrid,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Rows,
} from "lucide-react";
import { Button } from "@editor/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@editor/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@editor/ui/select";
import { Label } from "@editor/ui/label";
import { Separator } from "@editor/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@editor/ui/tooltip";
import { cn } from "@editor/ui/utils";
import { Settings2 } from "lucide-react";

export type Grouping = "none" | "status" | "priority" | "category" | "project" | "space";
export type SortColumn = "name" | "priority" | "estimatedCost" | "potentialCost" | null;
export type Compactness = "compact" | "regular" | "relaxed";

interface MockupDisplayConfigProps {
  boardGrouping: Grouping;
  onBoardGroupingChange: (grouping: Grouping) => void;
  sortColumn: SortColumn;
  onSortColumnChange: (column: SortColumn) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  compactness: Compactness;
  onCompactnessChange: (compactness: Compactness) => void;
}

export function MockupDisplayConfig({
  boardGrouping,
  onBoardGroupingChange,
  sortColumn,
  onSortColumnChange,
  sortDirection,
  onSortDirectionChange,
  compactness,
  onCompactnessChange,
}: MockupDisplayConfigProps) {
  const [open, setOpen] = useState(false);

  const getGroupingLabel = (grouping: Grouping): string => {
    if (grouping === "none") return "None";
    return grouping.charAt(0).toUpperCase() + grouping.slice(1);
  };

  const getSortColumnLabel = (column: Exclude<SortColumn, null>): string => {
    switch (column) {
      case "name":
        return "Name";
      case "priority":
        return "Priority";
      case "estimatedCost":
        return "Estimated Cost";
      case "potentialCost":
        return "Potential Cost";
      default:
        return String(column);
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

  const groupingOptions: Grouping[] = ["status", "priority", "category", "project", "space"];
  const sortColumnOptions: Exclude<SortColumn, null>[] = ["name", "priority", "estimatedCost", "potentialCost"];
  const compactnessOptions: Compactness[] = ["compact", "regular", "relaxed"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-2">
                <Settings2 className="h-3 w-3" />
                Display
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Display settings configuration</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          {/* Board Grouping */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Board Grouping</Label>
            <Select
              value={boardGrouping}
              onValueChange={(value) => onBoardGroupingChange(value as Grouping)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupingOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-xs">
                    {getGroupingLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sorting */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Sort By</Label>
            <div className="flex gap-2">
              <Select
                value={sortColumn || "none"}
                onValueChange={(value) =>
                  onSortColumnChange(
                    value === "none" || !sortColumnOptions.includes(value as Exclude<SortColumn, null>)
                      ? null 
                      : (value as Exclude<SortColumn, null>)
                  )
                }
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    None
                  </SelectItem>
                  {sortColumnOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {getSortColumnLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sortColumn && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() =>
                    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
                  }
                >
                  {sortDirection === "asc" ? (
                    <ArrowUpNarrowWide className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Compactness */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Compactness</Label>
            <div className="grid grid-cols-3 gap-2">
              {compactnessOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onCompactnessChange(option)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
                    compactness === option
                      ? "bg-accent text-accent-foreground border-border"
                      : "hover:bg-accent/50"
                  )}
                >
                  <Rows className="h-3.5 w-3.5" />
                  {getCompactnessLabel(option)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
