"use client";

import { useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useMounted } from "@/lib/use-mounted";
import { Columns, ChevronDown, ChevronRight, Circle, CircleCheck, CircleDashed, Layers, Package, Plus, Search, XCircle } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@editor/ui/badge";
import { Button } from "@editor/ui/button";
import { Input } from "@editor/ui/input";
import { Separator } from "@editor/ui/separator";
import { cn } from "@editor/ui/utils";
import { ElectronWindow } from "./electron-window";
import { MockupDisplayConfig, type Grouping, type SortColumn, type Compactness } from "./mockup-display-config";
import { MockupFilterDropdown, type FilterState } from "./mockup-filter-dropdown";
import { ProviderIcon } from "./provider-icon";
import {
  mockTasks,
  mockContainers,
  mockProjects,
  getProjectById,
  getContainerById,
  type MockTask,
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";

const BUCKET_COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "shaping", label: "Shaping" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const BUCKET_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  backlog: CircleDashed,
  shaping: Circle,
  todo: Circle,
  in_progress: Circle,
  in_review: Circle,
  done: CircleCheck,
  cancelled: XCircle,
};

// Focused subset: Product, Personal, Side Projects with 2-5 projects each
const FOCUSED_CONTAINER_IDS = ["container-1", "container-2", "container-3"];
const FOCUSED_PROJECT_IDS = [
  "project-1", "project-2", "project-3", "project-4", // Product: 4 projects
  "project-5", "project-7", "project-8",            // Personal: 3 projects
  "project-6", "project-9", "project-10",           // Side Projects: 3 projects
];

function getTaskContainerId(task: MockTask): string {
  if (task.containerId) return task.containerId;
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  return project?.containerId ?? "no-container";
}

function isInFocusedSubset(task: MockTask): boolean {
  const containerId = getTaskContainerId(task);
  if (!FOCUSED_CONTAINER_IDS.includes(containerId)) return false;
  const projectId = task.projectId ?? "no-project";
  return FOCUSED_PROJECT_IDS.includes(projectId);
}

interface TaskCardProps {
  task: MockTask;
  compact?: boolean;
}

function TaskCard({ task, compact }: TaskCardProps) {
  const project = task.projectId ? getProjectById(task.projectId) : undefined;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground cursor-grab active:cursor-grabbing",
        compact ? "p-1.5 space-y-1" : "p-2 space-y-1.5"
      )}
    >
      <h4 className={cn("font-medium line-clamp-2", compact ? "text-[10px]" : "text-xs")}>
        {task.title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {project && (
          <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px] font-normal">
            <Package className="h-2.5 w-2.5 opacity-70" />
            <span className="truncate max-w-[100px]">{project.title}</span>
          </Badge>
        )}
        {task.linearIssueId && (
          task.linearIssueUrl ? (
            <a
              href={task.linearIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-50" />
              <span>{task.linearIssueIdentifier ?? task.linearIssueId}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground">
              <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-50" />
              <span>{task.linearIssueIdentifier ?? task.linearIssueId}</span>
            </span>
          )
        )}
        {task.notionPageId && (
          task.notionPageUrl ? (
            <a
              href={task.notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-50" />
              <span>{task.notionPageTitle ?? "Notion"}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground">
              <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-50" />
              <span>{task.notionPageTitle ?? "Notion"}</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}

interface SortableCardProps {
  item: MockTask;
  renderCard: (item: MockTask) => ReactNode;
}

function SortableCard({ item, renderCard }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderCard(item)}
    </div>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col min-h-[120px] relative",
        isOver && "ring-2 ring-primary/50 ring-inset rounded-md"
      )}
    >
      {isOver && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-primary/30 border-dashed rounded-lg z-10 pointer-events-none" />
      )}
      {children}
    </div>
  );
}

interface MockupKanbanBoardProps {
  items: MockTask[];
  onMoveItem: (taskId: string, newBucket: string) => void;
  renderCard: (item: MockTask) => ReactNode;
}

function StaticKanbanBoard({ items, renderCard }: { items: MockTask[]; renderCard: (item: MockTask) => ReactNode }) {
  const columns = useMemo(() => {
    return BUCKET_COLUMNS.map((col) => ({
      ...col,
      items: items.filter((t) => t.bucket === col.id),
    }));
  }, [items]);

  return (
    <div className="flex gap-2 overflow-x-auto overflow-y-hidden flex-1 min-h-0">
      {columns.map((col) => {
        const ColIcon = BUCKET_ICON[col.id];
        return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 w-[200px] flex flex-col rounded-lg p-1 border border-border/30 overflow-hidden",
              col.items.length > 0 ? "bg-muted/20" : "bg-muted/10"
            )}
          >
            <div className="flex-shrink-0 flex justify-between items-center gap-1 px-2 py-1">
              <div className="flex items-center min-w-0 flex-1 gap-2">
                {ColIcon && <ColIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <div className="text-sm truncate">{col.label}</div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{col.items.length}</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col min-h-[120px]">
              <div className="flex-1 min-h-[80px] min-w-0 overflow-y-auto space-y-2 mt-1 pb-4">
                {col.items.map((task) => (
                  <div key={task._id}>{renderCard(task)}</div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MockupKanbanBoard({ items, onMoveItem, renderCard }: MockupKanbanBoardProps) {
  const mounted = useMounted();
  const [activeId, setActiveId] = useState<string | null>(null);

  const columns = useMemo(() => {
    return BUCKET_COLUMNS.map((col) => ({
      ...col,
      items: items.filter((t) => t.bucket === col.id),
    }));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let sourceCol = columns.find((c) => c.items.some((t) => t._id === activeId));
    if (!sourceCol) return;

    let targetCol: (typeof columns)[number] | undefined;
    if (BUCKET_COLUMNS.some((c) => c.id === overId)) {
      targetCol = columns.find((c) => c.id === overId);
    } else {
      const overTask = items.find((t) => t._id === overId);
      if (overTask) targetCol = columns.find((c) => c.items.some((t) => t._id === overId));
    }
    if (!targetCol) return;

    onMoveItem(activeId, targetCol.id);
  };

  const activeItem = activeId ? items.find((t) => t._id === activeId) : null;

  if (!mounted) {
    return <StaticKanbanBoard items={items} renderCard={renderCard} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden flex-1 min-h-0">
        {columns.map((col) => {
          const ColIcon = BUCKET_ICON[col.id];
          return (
          <div
            key={col.id}
            className={cn(
              "flex-shrink-0 w-[200px] flex flex-col rounded-lg p-1 border border-border/30 overflow-hidden",
              col.items.length > 0 ? "bg-muted/20" : "bg-muted/10"
            )}
          >
            <div className="flex-shrink-0 flex justify-between items-center gap-1 px-2 py-1">
              <div className="flex items-center min-w-0 flex-1 gap-2">
                {ColIcon && <ColIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <div className="text-sm truncate">{col.label}</div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{col.items.length}</span>
            </div>
            <DroppableColumn id={col.id}>
              <div className="flex-1 min-h-[80px] min-w-0 overflow-y-auto space-y-2 mt-1 pb-4">
                <SortableContext
                  items={col.items.map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {col.items.map((task) => (
                    <SortableCard
                      key={task._id}
                      item={task}
                      renderCard={renderCard}
                    />
                  ))}
                </SortableContext>
              </div>
            </DroppableColumn>
          </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="opacity-90 rotate-2 scale-105">{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

const KANBAN_FILTER_CATEGORIES = [
  {
    key: "status" as const,
    label: "Status",
    icon: Circle,
    options: BUCKET_COLUMNS.map((c) => ({ value: c.id, label: c.label })),
  },
  {
    key: "space" as const,
    label: "Container",
    icon: Layers,
    options: mockContainers.map((c) => ({ value: c._id, label: c.name })),
  },
  {
    key: "project" as const,
    label: "Project",
    icon: Package,
    options: mockProjects.filter((p) => FOCUSED_PROJECT_IDS.includes(p._id)).map((p) => ({ value: p._id, label: p.title })),
  },
];

export function UnifiedOrgKanbanMockup() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [boardGrouping, setBoardGrouping] = useState<Grouping>("status");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [compactness, setCompactness] = useState<Compactness>("regular");

  const [tasks, setTasks] = useState<MockTask[]>(() =>
    mockTasks.filter(isInFocusedSubset)
  );

  const handleMoveItem = useCallback((taskId: string, newBucket: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, bucket: newBucket as MockTask["bucket"] } : t
      )
    );
  }, []);

  const filteredTasks = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const filterStatus = filters.status;
    const filterSpace = filters.space;
    const filterProject = filters.project;

    return tasks.filter((task) => {
      if (filterStatus?.length && !filterStatus.includes(task.bucket)) return false;
      const containerId = getTaskContainerId(task);
      if (filterSpace?.length && !filterSpace.includes(containerId)) return false;
      const projectId = task.projectId ?? "no-project";
      if (filterProject?.length && !filterProject.includes(projectId)) return false;
      if (searchLower) {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const project = task.projectId ? getProjectById(task.projectId) : undefined;
        const container = getContainerById(containerId);
        const projectMatch = project?.title.toLowerCase().includes(searchLower);
        const containerMatch = container?.name.toLowerCase().includes(searchLower);
        if (!titleMatch && !projectMatch && !containerMatch) return false;
      }
      return true;
    });
  }, [tasks, search, filters]);

  const groupedData = useMemo(() => {
    const byContainer = new Map<string, Map<string, MockTask[]>>();
    for (const task of filteredTasks) {
      const containerId = getTaskContainerId(task);
      if (!FOCUSED_CONTAINER_IDS.includes(containerId)) continue;
      const projectId = task.projectId ?? "no-project";
      if (!FOCUSED_PROJECT_IDS.includes(projectId)) continue;

      if (!byContainer.has(containerId)) byContainer.set(containerId, new Map());
      const byProject = byContainer.get(containerId)!;
      if (!byProject.has(projectId)) byProject.set(projectId, []);
      byProject.get(projectId)!.push(task);
    }

    const entries = Array.from(byContainer.entries()).map(([containerId, byProject]) => ({
      containerId,
      container: getContainerById(containerId),
      projects: Array.from(byProject.entries())
        .filter(([pid]) => FOCUSED_PROJECT_IDS.includes(pid))
        .map(([projectId, items]) => ({
          projectId,
          project: getProjectById(projectId),
          items,
        }))
        .filter((p) => p.items.length > 0),
    })).filter((g) => g.projects.length > 0);

    // Sort by FOCUSED_CONTAINER_IDS so Product, Personal, Side Projects appear in that order
    return entries.sort(
      (a, b) =>
        FOCUSED_CONTAINER_IDS.indexOf(a.containerId) - FOCUSED_CONTAINER_IDS.indexOf(b.containerId)
    );
  }, [filteredTasks]);

  const renderCard = useCallback(
    (task: MockTask) => <TaskCard task={task} compact={compactness === "compact"} />,
    [compactness]
  );

  const [collapsedContainers, setCollapsedContainers] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const toggleContainer = useCallback((id: string) => {
    setCollapsedContainers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleProject = useCallback((id: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <ElectronWindow
      title="Kanban"
      icon={<Columns className="h-3 w-3" />}
      className="w-full max-w-full"
    >
      <div className="flex flex-col h-full overflow-hidden border-t" style={{ maxHeight: "600px", height: "600px" }}>
        {/* Index page header */}
        <div className="flex-shrink-0 border-b border-border bg-background">
          <div className=" py-2 space-y-2">
            {/* Row 1: Search and Create */}
            <div className="px-2 flex items-center justify-between gap-4">
              <div className="relative flex-1 min-w-0 max-w-[200px]">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search tasks…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 pl-7 pr-2 text-xs border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 px-2"
                onClick={() => window.open(siteConfig.appUrl, "_blank")}
              >
                <Plus className="h-3 w-3" />
                Create
              </Button>
            </div>
            {/* Row 2: Filters and Display */}
            <Separator className="my-1" />
            <div className="flex items-center justify-between gap-4 px-2">
              <MockupFilterDropdown
                filters={filters}
                onFiltersChange={setFilters}
                categories={KANBAN_FILTER_CATEGORIES}
              />
              <MockupDisplayConfig
                boardGrouping={boardGrouping}
                onBoardGroupingChange={setBoardGrouping}
                sortColumn={sortColumn}
                onSortColumnChange={setSortColumn}
                sortDirection={sortDirection}
                onSortDirectionChange={setSortDirection}
                compactness={compactness}
                onCompactnessChange={setCompactness}
              />
            </div>
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          style={{ overflowAnchor: "none" }}
        >
          {groupedData.map(({ containerId, container, projects }) => {
            const containerCollapsed = collapsedContainers.has(containerId);
            return (
            <div
              key={containerId}
              className="rounded-lg border-t border-border/50 bg-muted/20 overflow-hidden mb-3"
            > 
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleContainer(containerId)}
                onKeyDown={(e) => e.key === "Enter" && toggleContainer(containerId)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium bg-background/50 hover:bg-muted/50 transition-colors text-left cursor-pointer"
              >
                {containerCollapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">{container?.name ?? "Container"}</span>
                {(container?.linearTeamUrl ?? container?.notionPageUrl) && (
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {container.linearTeamUrl && container.linearTeamId && (
                      <a
                        href={container.linearTeamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[10px] bg-muted/40 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-60" />
                        <span>{container.linearTeamId}</span>
                      </a>
                    )}
                    {container.notionPageUrl && container.notionPageTitle && (
                      <a
                        href={container.notionPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[10px] bg-muted/40 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-60" />
                        <span>{container.notionPageTitle}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              {!containerCollapsed && projects.map(({ projectId, project, items }) => {
                const projectKey = `${containerId}-${projectId}`;
                const projectCollapsed = collapsedProjects.has(projectKey);
                return (
                <div key={projectId} className="border-t border-border/30">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleProject(projectKey)}
                    onKeyDown={(e) => e.key === "Enter" && toggleProject(projectKey)}
                    className="flex w-full items-center gap-2 pl-8 pr-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                  >
                    {projectCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <Package className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0">{project?.title ?? "Project"}</span>
                    {(project?.linearProjectUrl ?? project?.notionPageUrl) && (
                      <div className="flex items-center gap-1 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {project.linearProjectUrl && (project.linearProjectIdentifier ?? project.linearProjectId) && (
                          <a
                            href={project.linearProjectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[10px] bg-muted/40 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-60" />
                            <span>{project.linearProjectIdentifier ?? project.linearProjectId}</span>
                          </a>
                        )}
                        {project.notionPageUrl && project.notionPageTitle && (
                          <a
                            href={project.notionPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[10px] bg-muted/40 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-60" />
                            <span>{project.notionPageTitle}</span>
                          </a>
                        )}
                      </div>
                    )}
                    <span className="ml-auto shrink-0">{items.length} tasks</span>
                  </div>
                  {!projectCollapsed && (
                    <div className="p-2 min-h-[180px]">
                      <MockupKanbanBoard
                        items={items}
                        onMoveItem={handleMoveItem}
                        renderCard={renderCard}
                      />
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>
    </ElectronWindow>
  );
}
