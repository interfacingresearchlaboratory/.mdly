"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@editor/ui/input";
import { Kbd } from "@editor/ui/kbd";
import { Separator } from "@editor/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { cn } from "@editor/ui/utils";
import { FilterDropdown, type FilterState, type FilterCategory } from "@/components/shared/filter-dropdown";
import { DisplayConfig, type DisplayConfigProps } from "@/components/shared/display-config";
import { FIXED_PAGE_HEADER_HEIGHT_PX } from "@/components/shared/fixed-page-header";

export interface IndexPageHeaderSearchProps {
  searchInputId: string;
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
}

export interface IndexPageHeaderProps {
  /** Create button (or dropdown) rendered on the right of row 1 */
  createButton: ReactNode;

  /** Optional search; when provided, row 1 shows search input on the left */
  search?: IndexPageHeaderSearchProps;

  /** Optional slot for saved views (e.g. SavedViewPills); reserved for future use */
  viewsSlot?: ReactNode;

  /** Optional filters; when provided with displayConfig and showFilterRow, row 2 shows FilterDropdown */
  filters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  filterCategories?: FilterCategory[];

  /** Optional display config; when provided with filters and showFilterRow, row 2 shows DisplayConfig */
  displayConfig?: DisplayConfigProps;

  /** When true and filter/display props are provided, show the filter row. Defaults to true when filters and displayConfig are both provided. */
  showFilterRow?: boolean;

  className?: string;
}

const ROW1_PY = "py-2";

export function IndexPageHeader({
  createButton,
  search,
  viewsSlot,
  filters,
  onFiltersChange,
  filterCategories,
  displayConfig,
  showFilterRow,
  className,
}: IndexPageHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasFilterRow =
    filters !== undefined &&
    onFiltersChange !== undefined &&
    filterCategories !== undefined &&
    (showFilterRow !== false);

  useEffect(() => {
    if (!search) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable;
      if (isTyping && active !== searchInputRef.current) return;

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search]);

  return (
    <div
      className={cn(
        "sticky z-40 bg-background border-b border-border overflow-x-hidden",
        className
      )}
      style={{ top: FIXED_PAGE_HEADER_HEIGHT_PX }}
    >
      {/* Row 1: Search + viewsSlot (left) | Create (right) */}
      <div className={cn("flex items-center justify-between gap-4 px-2 min-w-0", ROW1_PY)}>
        <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial">
          {search && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex-1 md:flex-initial min-w-0">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={searchInputRef}
                      id={search.searchInputId}
                      type="search"
                      placeholder={search.searchPlaceholder}
                      value={search.search}
                      onChange={(e) => search.onSearchChange(e.target.value)}
                      className="h-7 flex-1 md:w-64 min-w-0 pl-9 text-xs border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex items-center gap-2">
                    <span>Search</span>
                    <Kbd className="dark:bg-primary dark:text-primary-foreground dark:border-gray-300">
                      /
                    </Kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {viewsSlot && <div className="hidden md:block shrink-0">{viewsSlot}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">{createButton}</div>
      </div>

      {/* Row 2: Filters | Display Config (optional) */}
      {hasFilterRow && (
        <>
          <Separator />
          <div className={cn("flex items-center justify-between gap-4 px-2 min-w-0", ROW1_PY)}>
            <div className="shrink-0">
              <FilterDropdown
                filters={filters!}
                onFiltersChange={onFiltersChange!}
                categories={filterCategories!}
              />
            </div>
            {displayConfig && (
              <div className="shrink-0">
                <DisplayConfig {...displayConfig} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Approximate height of the header (row 1 only) for layout calculations. With filter row, total height is larger. */
export const INDEX_PAGE_HEADER_ROW_HEIGHT_PX = 40;
