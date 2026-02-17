"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import { ArrowBigUp, ListFilter, X, ChevronRight, Check } from "lucide-react";
import { getEntityIconOrNull } from "@/lib/entity-icons";
import { Button } from "@editor/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editor/ui/popover";
import { Separator } from "@editor/ui/separator";
import { Checkbox } from "@editor/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { Kbd } from "@editor/ui/kbd";
import { cn } from "@editor/ui/utils";

export type FilterState = {
  status?: string[];
  priority?: string[];
  category?: string[]; // category IDs
  project?: string[]; // project IDs
  container?: string[]; // container IDs
  space?: string[]; // space IDs
  scout?: string[]; // scout IDs
  label?: string[]; // label IDs
  bucket?: string[]; // task bucket (backlog, shaping, todo, etc.)
  condition?: string[]; // "low", "medium", "high"
  satisfaction?: string[]; // "low", "medium", "high"
  usage?: string[]; // "low", "medium", "high"
  search?: string; // text search query
  /** Container index: "yes" | "no" */
  hasExternalLink?: string[];
  hasProjects?: string[];
  hasTasks?: string[];
};

interface FilterOption {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

interface NumericRangeGroup {
  value: string;
  label: string;
  min: number;
  max: number;
  color: "red" | "yellow" | "green";
}

export interface FilterCategory {
  key: keyof FilterState;
  label: string;
  icon: ComponentType<{ className?: string }>;
  options?: FilterOption[];
  numericRanges?: NumericRangeGroup[];
  getOptions?: () => FilterOption[]; // For dynamic options like projects, roles, etc.
}

interface FilterDropdownProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: FilterCategory[];
}

const NUMERIC_RANGES: NumericRangeGroup[] = [
  { value: "low", label: "Low (1-4)", min: 1, max: 4, color: "red" },
  { value: "medium", label: "Medium (5-7)", min: 5, max: 7, color: "yellow" },
  { value: "high", label: "High (8-10)", min: 8, max: 10, color: "green" },
];

export function FilterDropdown({
  filters,
  onFiltersChange,
  categories,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Set<keyof FilterState>>(
    new Set()
  );
  const timeoutRefs = useRef<Map<keyof FilterState, NodeJS.Timeout>>(
    new Map()
  );
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Hotkey: Shift+F opens the filter popover and focuses the trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if ((e.key === "f" || e.key === "F") && e.shiftKey) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeoutRefs.current.clear();
    };
  }, []);

  // Calculate total active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).reduce((total, filterArray) => {
      return total + (filterArray?.length || 0);
    }, 0);
  }, [filters]);

  const handleToggleFilter = (
    categoryKey: keyof FilterState,
    value: string
  ) => {
    // Ensure we're working with an array (skip 'search' which is a string)
    if (categoryKey === 'search') return;
    
    const currentFilters = (filters[categoryKey] || []) as string[];
    const newFilters: FilterState = { ...filters };

    if (currentFilters.includes(value)) {
      // Remove filter
      const filtered = currentFilters.filter((v) => v !== value);
      if (filtered.length === 0) {
        delete newFilters[categoryKey];
      } else {
        (newFilters as any)[categoryKey] = filtered;
      }
    } else {
      // Add filter
      (newFilters as any)[categoryKey] = [...currentFilters, value];
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const handleSubmenuMouseEnter = (categoryKey: keyof FilterState) => {
    // Clear any pending timeout for this category
    const existingTimeout = timeoutRefs.current.get(categoryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(categoryKey);
    }
    setOpenSubmenus((prev) => new Set(prev).add(categoryKey));
  };

  const handleSubmenuMouseLeave = (categoryKey: keyof FilterState) => {
    // Clear any existing timeout for this category
    const existingTimeout = timeoutRefs.current.get(categoryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    // Set a new timeout to close the submenu
    const timeout = setTimeout(() => {
      setOpenSubmenus((prev) => {
        const next = new Set(prev);
        next.delete(categoryKey);
        return next;
      });
      timeoutRefs.current.delete(categoryKey);
    }, 150);
    timeoutRefs.current.set(categoryKey, timeout);
  };

  const getCategoryOptions = (category: FilterCategory): FilterOption[] => {
    if (category.options) {
      return category.options;
    }
    if (category.getOptions) {
      return category.getOptions();
    }
    return [];
  };

  const getRangeColorClasses = (color: "red" | "yellow" | "green") => {
    switch (color) {
      case "red":
        return "text-red-600 dark:text-red-400 border-red-600/20 dark:border-red-400/20";
      case "yellow":
        return "text-yellow-600 dark:text-yellow-400 border-yellow-600/20 dark:border-yellow-400/20";
      case "green":
        return "text-green-600 dark:text-green-400 border-green-600/20 dark:border-green-400/20";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="ghost"
                className="text-xs flex items-center gap-1.5 relative h-7 px-1.5"
              >
                <ListFilter className="h-3.5 w-3.5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex items-center gap-2">
              <span>Filter items</span>
              <div className="flex items-center gap-1">
                <Kbd>
                  <ArrowBigUp className="h-3.5 w-3.5" />
                </Kbd>
                <Kbd>F</Kbd>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="space-y-1 p-1">
          {categories.map((category) => {
            const categoryFilters = filters[category.key] || [];
            const hasActiveFilters = categoryFilters.length > 0;
            const submenuOpen = openSubmenus.has(category.key);

            // Check if this is a numeric range category
            const isNumericRange =
              category.numericRanges && category.numericRanges.length > 0;

            return (
              <div key={category.key} className="relative">
                <Popover open={submenuOpen} onOpenChange={() => {}}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors",
                        "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground",
                        hasActiveFilters && "bg-accent/50"
                      )}
                      onMouseEnter={() => handleSubmenuMouseEnter(category.key)}
                      onMouseLeave={() => handleSubmenuMouseLeave(category.key)}
                    >
                      <span className="flex-1 truncate text-left">
                        {category.label}
                      </span>
                      {hasActiveFilters && (
                        <span className="text-xs text-muted-foreground mr-1">
                          ({categoryFilters.length})
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-64 p-0"
                    side="right"
                    align="start"
                    sideOffset={4}
                    onMouseEnter={() => handleSubmenuMouseEnter(category.key)}
                    onMouseLeave={() => handleSubmenuMouseLeave(category.key)}
                  >
                    <div className="max-h-80 overflow-y-auto p-1">
                      {isNumericRange ? (
                        // Render numeric range groups
                        <div className="space-y-1">
                          {category.numericRanges!.map((range) => {
                            const isSelected = categoryFilters.includes(
                              range.value
                            );
                            const toggle = () =>
                              handleToggleFilter(category.key, range.value);
                            return (
                              <div
                                key={range.value}
                                role="button"
                                tabIndex={0}
                                onClick={toggle}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    toggle();
                                  }
                                }}
                                className={cn(
                                  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none transition-colors",
                                  "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground",
                                  isSelected &&
                                    getRangeColorClasses(range.color) +
                                      " bg-accent"
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="h-4 w-4 pointer-events-none"
                                />
                                <span
                                  className={cn(
                                    "flex-1 truncate text-left",
                                    isSelected && getRangeColorClasses(range.color)
                                  )}
                                >
                                  {range.label}
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Render regular options
                        <div className="space-y-1">
                          {getCategoryOptions(category).map((option) => {
                            const isSelected = categoryFilters.includes(
                              option.value
                            );
                            const toggle = () =>
                              handleToggleFilter(category.key, option.value);
                            return (
                              <div
                                key={option.value}
                                role="button"
                                tabIndex={0}
                                onClick={toggle}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    toggle();
                                  }
                                }}
                                className={cn(
                                  "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none transition-colors",
                                  "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground"
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="h-4 w-4 pointer-events-none"
                                />
                                <span className="flex-1 truncate text-left">
                                  {option.label}
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}

          {activeFilterCount > 0 && (
            <>
              <Separator />
              <button
                type="button"
                onClick={handleClearAll}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground text-muted-foreground"
                )}
              >
                <X className="h-3.5 w-3.5 mr-2" />
                <span>Clear all filters</span>
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
