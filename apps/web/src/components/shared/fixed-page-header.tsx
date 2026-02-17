"use client";

import { useState, useEffect } from "react";
import type { ReactNode, ComponentType } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@editor/ui/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@editor/ui/breadcrumb";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editor/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@editor/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { VisuallyHidden } from "@editor/ui/visually-hidden";
import { useIsMobile } from "@editor/ui/sidebar";
import { getEntityIconOrNull } from "@/lib/entity-icons";

export type BreadcrumbSegment = {
  href: string;
  label: string | ReactNode;
  icon?: "home" | "project" | "review" | "task" | "category" | "container" | "settings" | ComponentType<{ className?: string }>;
  tooltip?: string;
};

type FixedPageHeaderProps = {
  segments: BreadcrumbSegment[];
  right?: ReactNode;
  tabs?: ReactNode;
  className?: string;
  lastSegmentAction?: ReactNode;
};

// Helper function to get icon component from segment
function getSegmentIcon(icon?: BreadcrumbSegment["icon"]) {
  return typeof icon === "function" ? icon : getEntityIconOrNull(icon);
}

export function FixedPageHeader({ segments, right, tabs, className, lastSegmentAction }: FixedPageHeaderProps) {
  const lastIndex = Math.max(0, segments.length - 1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Reduce overlay opacity when mobile dropdown is open
  useEffect(() => {
    if (isMobile && mobileDialogOpen) {
      const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement;
      if (overlay) {
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      }
      return () => {
        if (overlay) {
          overlay.style.backgroundColor = '';
        }
      };
    }
  }, [isMobile, mobileDialogOpen]);

  const renderBreadcrumbSegment = (seg: BreadcrumbSegment, idx: number, isLast: boolean, inPopup = false, showEllipsis = false, hideIcon = false, hideLabel = false, hideSeparator = false) => {
    const Icon = getSegmentIcon(seg.icon);

    const labelTitle = typeof seg.label === "string" ? seg.label : undefined;
    const tooltipText =
      seg.tooltip ?? (typeof seg.label === "string" ? seg.label : undefined);

    return (
      <span
        key={`crumb-${idx}-${seg.href}`}
        className={cn(
          "flex items-center min-w-0",
          isLast ? "flex-1" : "shrink"
        )}
      >
        <BreadcrumbItem className="min-w-0">
          {isLast ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <BreadcrumbPage
                  className={cn(
                    "flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden"
                  )}
                  title={labelTitle}
                >
                  {Icon && !hideIcon && (
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  {!hideLabel && (
                    <span className="min-w-0 truncate whitespace-nowrap">
                      {seg.label}
                    </span>
                  )}
                </BreadcrumbPage>
              </TooltipTrigger>
              {tooltipText && (
                <TooltipContent side="bottom">
                  {tooltipText}
                </TooltipContent>
              )}
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={seg.href}
                  title={labelTitle}
                  onClick={() => setPopoverOpen(false)}
                  className={cn(
                    "flex items-center gap-1.5 min-w-0 transition-colors hover:text-foreground text-muted-foreground/80 overflow-hidden",
                    !inPopup && "max-w-[80px]",
                    inPopup && "max-w-none"
                  )}
                >
                  {Icon && (
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  {!hideLabel && (
                    <span className={cn(
                      "min-w-0 truncate",
                      !inPopup && "hidden sm:inline",
                      inPopup && "inline"
                    )}>
                      {seg.label}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {tooltipText && (
                <TooltipContent side="bottom">
                  {tooltipText}
                </TooltipContent>
              )}
            </Tooltip>
          )}
        </BreadcrumbItem>

        {!isLast && !showEllipsis && !hideSeparator && (
          <BreadcrumbSeparator className="shrink-0 ml-1.5 mr-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </BreadcrumbSeparator>
        )}
        {showEllipsis && (
          <>
            <BreadcrumbSeparator className="shrink-0">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </BreadcrumbSeparator>
            <span className="text-muted-foreground/60 text-xs px-1 shrink-0">...</span>
            <BreadcrumbSeparator className="shrink-0">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </BreadcrumbSeparator>
          </>
        )}
      </span>
    );
  };


  return (
    <div
      className={cn(
        "sticky top-0 z-40 bg-background border-b border-border overflow-x-hidden",
        className
      )}
    >
      <div className="relative h-9 flex items-center justify-between gap-3 px-4 md:px-6 z-10 min-w-0">
        {/* Mobile: Home icon */}
        {isMobile && segments.length > 0 && segments[0] && (() => {
          const firstSegment = segments[0];
          const HomeIcon = getSegmentIcon(firstSegment.icon);
          return (
            <div className="shrink-0">
              <Link
                href={firstSegment.href}
                className="flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                {HomeIcon && (
                  <HomeIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </Link>
            </div>
          );
        })()}
        
        {/* Mobile: Current page title with dropdown */}
        {isMobile && segments.length > 1 && segments[lastIndex] && (() => {
          const lastSegment = segments[lastIndex];
          const TriggerIcon = getSegmentIcon(lastSegment.icon);
          return (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Dialog 
                open={mobileDialogOpen} 
                onOpenChange={setMobileDialogOpen}
                data-mobile-dropdown="true"
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs font-medium text-foreground hover:opacity-80 transition-opacity"
                  >
                    {TriggerIcon && (
                      <TriggerIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate max-w-[200px]">
                      {lastSegment.label}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent 
                  className="max-w-xs p-2 [&>button.absolute]:hidden" 
                >
                  <VisuallyHidden>
                    <DialogTitle>Navigation</DialogTitle>
                  </VisuallyHidden>
                  <div className="flex flex-col gap-1">
                    {segments.map((seg, idx) => {
                      const Icon = getSegmentIcon(seg.icon);
                      const isCurrentLocation = idx === lastIndex;
                      const labelText = typeof seg.label === "string" ? seg.label : undefined;
                      
                      return (
                        <Link
                          key={`dropdown-${idx}-${seg.href}`}
                          href={seg.href}
                          onClick={() => setMobileDialogOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                            isCurrentLocation 
                              ? "text-foreground font-medium" 
                              : "text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/50"
                          )}
                        >
                          {Icon && (
                            <Icon className={cn(
                              "h-4 w-4 shrink-0",
                              isCurrentLocation ? "text-foreground" : "text-muted-foreground/40"
                            )} />
                          )}
                          <span className="text-sm whitespace-nowrap">
                            {labelText || seg.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })()}

        {/* Desktop: Breadcrumbs with menu */}
        {!isMobile && (
          <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="min-w-0 cursor-pointer flex items-center gap-1 group overflow-hidden">
                  <Breadcrumb>
                    <TooltipProvider delayDuration={200}>
                      <BreadcrumbList className="flex flex-nowrap whitespace-nowrap items-center gap-0 overflow-hidden">
                        {segments.map((seg, idx) => renderBreadcrumbSegment(seg, idx, idx === lastIndex, false, false))}
                      </BreadcrumbList>
                    </TooltipProvider>
                  </Breadcrumb>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-md p-3" align="start" side="bottom">
                <Breadcrumb>
                  <TooltipProvider delayDuration={200}>
                    <BreadcrumbList className="flex flex-wrap items-center gap-1.5">
                      {segments.map((seg, idx) => renderBreadcrumbSegment(seg, idx, idx === lastIndex, true))}
                    </BreadcrumbList>
                  </TooltipProvider>
                </Breadcrumb>
              </PopoverContent>
            </Popover>
            {lastSegmentAction && (
              <div className="shrink-0">
                {lastSegmentAction}
              </div>
            )}
          </div>
        )}

        {/* Right section: Tabs, right content, and mobile menu */}
        <div className="flex items-center shrink-0 pr-0">
          {tabs && !isMobile && tabs}
          {tabs && !isMobile && right && (
            <div className="h-6 w-px bg-border/50 ml-3" />
          )}
          {right && (
            <div className={cn(tabs && !isMobile && "ml-3")}>
              {right}
            </div>
          )}
          {lastSegmentAction && isMobile && (
            <span className="flex items-center shrink-0 -mr-1 md:-mr-3 ml-3">
              {lastSegmentAction}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Total height (content h-9 + border-b) for sticky offset of content below (e.g. IndexPageHeader). */
export const FIXED_PAGE_HEADER_HEIGHT_PX = 37;
