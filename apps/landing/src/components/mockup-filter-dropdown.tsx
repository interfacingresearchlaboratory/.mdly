"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import { ListFilter, X, ChevronRight, Check } from "lucide-react";
import { Button } from "@editor/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@editor/ui/popover";
import { Separator } from "@editor/ui/separator";
import { Checkbox } from "@editor/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@editor/ui/tooltip";
import { cn } from "@editor/ui/utils";

export type FilterState = {
  status?: string[];
  priority?: string[];
  category?: string[];
  project?: string[];
  space?: string[];
};

interface FilterOption {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

interface FilterCategory {
  key: keyof FilterState;
  label: string;
  icon: ComponentType<{ className?: string }>;
  options?: FilterOption[];
  getOptions?: () => FilterOption[];
}

interface MockupFilterDropdownProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: FilterCategory[];
}

export function MockupFilterDropdown({
  filters,
  onFiltersChange,
  categories,
}: MockupFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Set<keyof FilterState>>(
    new Set()
  );
  const timeoutRefs = useRef<Map<keyof FilterState, NodeJS.Timeout>>(
    new Map()
  );

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
    const existingTimeout = timeoutRefs.current.get(categoryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(categoryKey);
    }
    setOpenSubmenus((prev) => new Set(prev).add(categoryKey));
  };

  const handleSubmenuMouseLeave = (categoryKey: keyof FilterState) => {
    const existingTimeout = timeoutRefs.current.get(categoryKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-2 relative">
                <ListFilter className="h-3 w-3" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>Filter items</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="space-y-1 p-1">
          {categories.map((category) => {
            const categoryFilters = filters[category.key] || [];
            const hasActiveFilters = categoryFilters.length > 0;
            const submenuOpen = openSubmenus.has(category.key);
            const Icon = category.icon;

            return (
              <div key={category.key} className="relative">
                <Popover open={submenuOpen} onOpenChange={() => {}}>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                        "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground",
                        hasActiveFilters && "bg-accent/50"
                      )}
                      onMouseEnter={() => handleSubmenuMouseEnter(category.key)}
                      onMouseLeave={() => handleSubmenuMouseLeave(category.key)}
                    >
                      <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
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
                      <div className="space-y-1">
                        {getCategoryOptions(category).map((option) => {
                          const isSelected = categoryFilters.includes(
                            option.value
                          );
                          const OptionIcon = option.icon;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleToggleFilter(category.key, option.value)
                              }
                              className={cn(
                                "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                disabled
                                className="h-4 w-4 pointer-events-none"
                              />
                              {OptionIcon && (
                                <OptionIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                              <span className="flex-1 truncate text-left">
                                {option.label}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
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
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground text-muted-foreground"
                )}
              >
                <X className="h-4 w-4 mr-2" />
                <span>Clear all filters</span>
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
