"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Calendar,
  Home,
  Inbox,
  Kanban,
  Box,
  Layers,
  SquareSlash,
  Clock,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@editor/ui/utils";
import { Button } from "@editor/ui/button";
import { Avatar, AvatarFallback } from "@editor/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@editor/ui/collapsible";
import { siteConfig } from "@/lib/site-config";

const SHELL_NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Inbox, label: "My Inbox", href: "/inbox" },
  { icon: Kanban, label: "Kanban", href: "/kanban" },
  { icon: Box, label: "Containers", href: "/containers" },
  { icon: Layers, label: "Projects", href: "/projects" },
  { icon: SquareSlash, label: "Tasks", href: "/tasks" },
  { icon: Clock, label: "Reviews", href: "/reviews" },
] as const;

const MOCK_ROUTINES = [
  { name: "Standup", startTime: "09:00", endTime: "09:15" },
  { name: "Deep work", startTime: "10:00", endTime: "12:00" },
] as const;

const MOCK_CALENDARS = [
  { name: "Work", color: "#8b5cf6" },
] as const;

const MOCK_CONTAINERS = [
  { id: "eng", name: "Engineering" },
  { id: "design", name: "Design" },
] as const;

const DEFAULT_SECTIONS_OPEN: Record<string, boolean> = {
  routines: true,
  "routines-daily-schedule": true,
  "routines-blocks": true,
  calendars: true,
  containers: true,
};

interface MockShellSidebarProps {
  /** On mobile (< md), force collapsed state and hide expand button */
  forceCollapsedOnMobile?: boolean;
}

export function MockShellSidebar({ forceCollapsedOnMobile }: MockShellSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(DEFAULT_SECTIONS_OPEN);
  const [isMobile, setIsMobile] = useState(forceCollapsedOnMobile ?? false);

  useEffect(() => {
    if (!forceCollapsedOnMobile) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [forceCollapsedOnMobile]);

  const effectiveCollapsed = forceCollapsedOnMobile && isMobile ? true : collapsed;
  const canExpand = !(forceCollapsedOnMobile && isMobile);

  const setSectionOpen = useCallback((id: string, open: boolean) => {
    setSectionsOpen((prev) => ({ ...prev, [id]: open }));
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 border-sidebar-border text-sidebar-foreground shrink-0 transition-[width] duration-200",
        effectiveCollapsed ? "w-12" : "w-52"
      )}
    >
      <div className="px-2 pt-1.5 flex items-center justify-between min-h-9 gap-2 shrink-0">
        {!effectiveCollapsed && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[10px] font-medium">A</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">Acme</span>
          </div>
        )}
        {canExpand && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" strokeWidth={2} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={2} />
            )}
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 p-2 min-h-0 overflow-y-auto">
        {SHELL_NAV_ITEMS.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={`${siteConfig.appUrl}${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent/80"
            )}
          >
            <Icon
              className="size-4 shrink-0 text-muted-foreground/70"
              strokeWidth={2}
            />
            {!effectiveCollapsed && <span>{label}</span>}
          </a>
        ))}

        {!effectiveCollapsed && (
          <Collapsible
            open={sectionsOpen.routines ?? true}
            onOpenChange={(open) => setSectionOpen("routines", open)}
          >
            <div className="flex flex-col gap-0.5">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {(sectionsOpen.routines ?? true) ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Routines</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-0.5">
                  <Collapsible
                    open={sectionsOpen["routines-daily-schedule"] ?? true}
                    onOpenChange={(open) =>
                      setSectionOpen("routines-daily-schedule", open)
                    }
                    className="mb-1"
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1 pl-6 pr-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {(sectionsOpen["routines-daily-schedule"] ?? true) ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>Daily Schedule</span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-8 space-y-0.5">
                        <a
                          href={`${siteConfig.appUrl}/routines`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent/80"
                        >
                          <Sun
                            className="size-4 text-muted-foreground/70 shrink-0"
                            strokeWidth={2}
                          />
                          <span className="text-sidebar-foreground">Wake</span>
                        </a>
                        <a
                          href={`${siteConfig.appUrl}/routines`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent/80"
                        >
                          <Moon
                            className="size-4 text-muted-foreground/70 shrink-0"
                            strokeWidth={2}
                          />
                          <span className="text-sidebar-foreground">Sleep</span>
                        </a>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  <Collapsible
                    open={sectionsOpen["routines-blocks"] ?? true}
                    onOpenChange={(open) =>
                      setSectionOpen("routines-blocks", open)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1 pl-6 pr-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {(sectionsOpen["routines-blocks"] ?? true) ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>Routine Blocks</span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-8 space-y-0.5">
                        {MOCK_ROUTINES.map((routine) => (
                          <a
                            key={routine.name}
                            href={`${siteConfig.appUrl}/routines`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent active:bg-accent/80"
                          >
                            <Calendar
                              className="size-4 text-muted-foreground/70 shrink-0"
                              strokeWidth={2}
                            />
                            <span className="text-sidebar-foreground text-sm truncate">
                              {routine.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {!effectiveCollapsed && (
          <Collapsible
            open={sectionsOpen.calendars ?? true}
            onOpenChange={(open) => setSectionOpen("calendars", open)}
          >
            <div className="flex flex-col gap-0.5">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {(sectionsOpen.calendars ?? true) ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Calendars</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-6 space-y-0.5">
                  {MOCK_CALENDARS.map((cal) => (
                    <a
                      key={cal.name}
                      href={`${siteConfig.appUrl}/settings?tab=calendars`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-2 py-1 w-full rounded-md transition-colors hover:bg-accent active:bg-accent/80"
                    >
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cal.color }}
                      />
                      <span className="text-sidebar-foreground text-sm truncate">
                        {cal.name}
                      </span>
                    </a>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {!effectiveCollapsed && (
          <Collapsible
            open={sectionsOpen.containers ?? true}
            onOpenChange={(open) => setSectionOpen("containers", open)}
          >
            <div className="flex flex-col gap-0.5">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {(sectionsOpen.containers ?? true) ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>Containers</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-0.5">
                  {MOCK_CONTAINERS.map((container) => {
                    const containerKey = `container-${container.id}`;
                    const isOpen = sectionsOpen[containerKey] ?? false;
                    return (
                      <Collapsible
                        key={container.id}
                        open={isOpen}
                        onOpenChange={(open) =>
                          setSectionOpen(containerKey, open)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 pl-6 pr-2 py-1 text-sm text-sidebar-foreground hover:text-foreground transition-colors rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            )}
                            <Box
                              className="size-4 text-muted-foreground/70 shrink-0"
                              strokeWidth={2}
                            />
                            <span className="truncate">{container.name}</span>
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-10 pr-2 py-0.5 space-y-0.5">
                            <a
                              href={`${siteConfig.appUrl}/containers/${container.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground opacity-70 hover:opacity-100 hover:bg-accent active:bg-accent/80 transition-colors"
                            >
                              <Layers
                                className="size-4 text-muted-foreground/70 shrink-0"
                                strokeWidth={2}
                              />
                              <span>Projects</span>
                            </a>
                            <a
                              href={`${siteConfig.appUrl}/containers/${container.id}/tasks`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-sm text-sidebar-foreground opacity-70 hover:opacity-100 hover:bg-accent active:bg-accent/80 transition-colors"
                            >
                              <SquareSlash
                                className="size-4 text-muted-foreground/70 shrink-0"
                                strokeWidth={2}
                              />
                              <span>Tasks</span>
                            </a>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </nav>
    </div>
  );
}
