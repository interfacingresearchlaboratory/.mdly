"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Cloud, StickyNote, CircleDashed, Clock, ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@editor/ui/utils";
import { Badge } from "@editor/ui/badge";
import { Checkbox } from "@editor/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@editor/ui/tabs";
import { XIcon } from "lucide-react";
import { ToolbarlessEditor } from "@editor/ui/editor/toolbarless-editor";
import {
  getMockDataForSeed,
  getTasksByRoutineBlock,
  getProjectById,
  getCategoryById,
  type MockRoutineBlock,
  type MockTask,
} from "@/lib/mock-data";
import { EntityIcon } from "@editor/ui/entity-icon";
import { useIsMobile } from "@editor/ui/sidebar";
import { ProviderIcon } from "./provider-icon";

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const parts = timeStr.split(":");
  const hours = parts[0] ? Number(parts[0]) : 0;
  const minutes = parts[1] ? Number(parts[1]) : 0;
  return { hours: isNaN(hours) ? 0 : hours, minutes: isNaN(minutes) ? 0 : minutes };
}

function timeToPosition(timeStr: string, hourHeight: number): number {
  const { hours, minutes } = parseTime(timeStr);
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / 60) * hourHeight;
}

function durationToHeight(startTime: string, endTime: string, hourHeight: number): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const startMins = start.hours * 60 + start.minutes;
  const endMins = end.hours * 60 + end.minutes;
  const durationMinutes = endMins - startMins;
  return (durationMinutes / 60) * hourHeight;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_ABBREV = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateDisplay(date: Date): string {
  const dayName = DAYS_SHORT[date.getDay()];
  const month = MONTHS_ABBREV[date.getMonth()];
  return `${dayName}, ${month} ${date.getDate()}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

const HOUR_HEIGHT = 96;
const MOBILE_HOUR_HEIGHT = 56;
const HOURS_DISPLAY = 25;
const MOCK_WORK_HOURS = { wake: "07:00", sleep: "23:00" };

function MockSidebarTaskItem({
  task,
  bucket,
}: {
  task: MockTask;
  bucket: "shaping" | "todo";
}) {
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const category = task.categoryId ? getCategoryById(task.categoryId) : undefined;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task._id}`,
    data: { type: "task", task, bucket },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 rounded-lg bg-card border border-border text-card-foreground cursor-grab active:cursor-grabbing",
        "hover:shadow-sm transition-shadow text-left",
        isDragging && "opacity-50 z-50 shadow-md"
      )}
      {...listeners}
      {...attributes}
    >
      <div className="font-medium text-sm line-clamp-2">{task.title}</div>
      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
        {project && (
          <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1">
            <EntityIcon entityType="project" className="h-2.5 w-2.5 mr-0.5 opacity-70" />
            {project.title}
          </Badge>
        )}
        {category && (
          <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1">
            <EntityIcon entityType="category" className="h-2.5 w-2.5 mr-0.5 opacity-70" />
            {category.name}
          </Badge>
        )}
        {task.linearIssueUrl && (
          <a
            href={task.linearIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors no-underline"
          >
            <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-50" />
            <span>{task.linearIssueIdentifier ?? "Linear"}</span>
          </a>
        )}
        {task.notionPageUrl && (
          <a
            href={task.notionPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors no-underline max-w-[100px]"
          >
            <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-50" />
            <span className="truncate">{task.notionPageTitle ?? "Notion"}</span>
          </a>
        )}
      </div>
    </div>
  );
}

function RoutineBlockItem({
  block,
  tasks: allTasks,
  hourHeight = HOUR_HEIGHT,
  onBlockClick,
}: {
  block: MockRoutineBlock;
  tasks: MockTask[];
  hourHeight?: number;
  onBlockClick?: (block: MockRoutineBlock) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tasks = getTasksByRoutineBlock(block._id, allTasks);
  const hasTasks = tasks.length > 0;

  const { setNodeRef, isOver } = useDroppable({
    id: `routine-block-drop-${block._id}`,
    data: { type: "routine-block", block },
  });

  if (!block.startTime || !block.endTime) return null;

  const top = timeToPosition(block.startTime, hourHeight);
  const height = durationToHeight(block.startTime, block.endTime, hourHeight);
  const blockColor = block.color || "#3b82f6";
  const isGhosted = block.isTemplateBased && !hasTasks;
  const isDailySchedule = block.blockType === "daily_schedule";

  const getBackgroundStyle = () => {
    if (isHovered) return { backgroundColor: hexToRgba(blockColor, 0.4) };
    if (isDailySchedule) {
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(107, 114, 128, 0.25) 4px, rgba(107, 114, 128, 0.25) 5px)`,
        backgroundColor: "transparent",
      };
    }
    if (isGhosted) return { backgroundColor: hexToRgba(blockColor, 0.1) };
    return { backgroundColor: hexToRgba(blockColor, 0.2) };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBlockClick?.(block);
  };

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onBlockClick?.(block);
        }
      }}
      style={{
        ...getBackgroundStyle(),
        position: "absolute",
        top: `${top}px`,
        height: `${height}px`,
        left: isDailySchedule ? "4px" : "4px",
        right: isDailySchedule ? 0 : "16px",
        borderColor: isDailySchedule ? "hsl(var(--border))" : blockColor,
        borderWidth: "1px",
        borderStyle: isGhosted ? "dashed" : "solid",
        transition: "background-color 0.2s ease",
      }}
      className={cn(
        "border p-0.5 cursor-pointer relative",
        isDailySchedule ? "rounded-none bg-gray-200/80 dark:bg-gray-700/80" : "rounded-r-xl",
        isGhosted && "opacity-50",
        isOver && "ring-2 ring-primary/50 ring-inset"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <div className="text-xs md:text-sm font-medium truncate">{block.name}</div>
        {hasTasks && (
          <div className="flex items-center gap-1 mt-0.5 md:mt-1">
            <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full shrink-0" style={{ backgroundColor: blockColor }} />
            <span className="text-[10px] md:text-xs opacity-75">{tasks.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MockDrawerTaskItem({ task, isDone }: { task: MockTask; isDone: boolean }) {
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const category = task.categoryId ? getCategoryById(task.categoryId) : undefined;
  return (
    <div className="flex items-center gap-2 py-1 px-3 hover:bg-muted/50 rounded-md text-xs border-b border-border last:border-b-0">
      <Checkbox checked={isDone} className="h-3.5 w-3.5 rounded-full shrink-0" />
      <span className={cn("flex-1 min-w-0 truncate", isDone && "line-through text-muted-foreground")}>
        {task.title}
      </span>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        {project && (
          <Badge variant="secondary" className="inline-flex max-w-[100px] items-center gap-1 truncate text-[10px] font-normal">
            <EntityIcon entityType="project" className="h-2.5 w-2.5 shrink-0 opacity-70" />
            <span className="truncate">{project.title}</span>
          </Badge>
        )}
        {category && (
          <Badge variant="secondary" className="inline-flex max-w-[100px] items-center gap-1 truncate text-[10px] font-normal">
            <EntityIcon entityType="category" className="h-2.5 w-2.5 shrink-0 opacity-70" />
            <span className="truncate">{category.name}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

function MockRoutineBlockDrawer({
  block,
  tasks: allTasks,
  onClose,
}: {
  block: MockRoutineBlock;
  tasks: MockTask[];
  onClose: () => void;
}) {
  const blockTasks = getTasksByRoutineBlock(block._id, allTasks);
  const blockColor = block.color || "#3b82f6";

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-drawer-title"
        className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[40%] flex-col border-t border-border bg-background shadow-lg"
      >
        <div className="flex shrink-0 items-center border-b border-border px-2 py-1 bg-background">
          <div className="flex-1 min-w-0" aria-hidden />
          <h2
            id="mock-drawer-title"
            className="flex shrink-0 items-center gap-2 !text-xs !font-medium !m-0 text-foreground"
          >
            <span className="truncate max-w-[200px]">{block.name}</span>
            {block.startTime && block.endTime && (
              <span className="text-muted-foreground whitespace-nowrap shrink-0">
                {block.startTime} – {block.endTime}
              </span>
            )}
          </h2>
          <div className="flex flex-1 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm p-1.5 opacity-70 hover:opacity-100 transition-opacity focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
              aria-label="Close"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left: details (scrollable) */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto border-r border-border p-3">
            <div className="text-sm font-medium">{block.name}</div>
            <div className="mt-2 min-h-[200px] flex-1 min-w-0">
              <ToolbarlessEditor
                resetKey={block._id}
                initialContent={block.content}
                placeholder="Add notes..."
                contentMinHeight={200}
                className="w-full text-sm"
                projects={[]}
                tasks={[]}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
                <Clock className="ml-0.5" />
                <input
                  type="time"
                  value={block.startTime}
                  readOnly
                  className="min-h-[28px] w-auto min-w-[4.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0 focus:outline-none"
                  aria-label="Start time"
                />
              </div>
              <span className="text-muted-foreground text-sm">–</span>
              <div className="flex items-center gap-2 rounded-md bg-muted/50 p-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
                <Clock className="ml-0.5" />
                <input
                  type="time"
                  value={block.endTime}
                  readOnly
                  className="min-h-[28px] w-auto min-w-[4.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0 focus:outline-none"
                  aria-label="End time"
                />
              </div>
              {blockColor && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border-0 bg-muted/50 px-2 py-1 text-muted-foreground hover:bg-muted"
                  aria-label="Color"
                >
                  <div
                    className="h-4 w-4 rounded border border-border shrink-0"
                    style={{ backgroundColor: blockColor }}
                  />
                  <ChevronDown className="size-3.5" />
                </button>
              )}
            </div>
          </div>
          {/* Right: tasks (scrollable) */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-border py-1.5 px-3 text-xs font-medium text-muted-foreground bg-muted/50">
              Tasks
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-border">
              {blockTasks.length > 0 ? (
                <>
                  {blockTasks.filter((t) => t.bucket !== "done").length > 0 && (
                    <div>
                      <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                        To-do
                      </div>
                      {blockTasks
                        .filter((t) => t.bucket !== "done")
                        .map((task) => (
                          <MockDrawerTaskItem key={task._id} task={task} isDone={false} />
                        ))}
                    </div>
                  )}
                  {blockTasks.filter((t) => t.bucket === "done").length > 0 && (
                    <div>
                      <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                        Completed
                      </div>
                      {blockTasks
                        .filter((t) => t.bucket === "done")
                        .map((task) => (
                          <MockDrawerTaskItem key={task._id} task={task} isDone />
                        ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="p-3 text-sm text-muted-foreground">No tasks linked to this block</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileEventDetailView({
  block,
  tasks: allTasks,
  onClose,
}: {
  block: MockRoutineBlock;
  tasks: MockTask[];
  onClose: () => void;
}) {
  const blockTasks = getTasksByRoutineBlock(block._id, allTasks);
  const blockColor = block.color || "#3b82f6";

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">
      {/* Header with back button */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-2 bg-background">
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm p-1.5 opacity-70 hover:opacity-100 transition-opacity focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h2 className="flex flex-1 min-w-0 items-center gap-2 !text-sm !font-medium !m-0 text-foreground truncate">
          <span className="truncate">{block.name}</span>
          {block.startTime && block.endTime && (
            <span className="text-muted-foreground whitespace-nowrap shrink-0 text-xs">
              {block.startTime} – {block.endTime}
            </span>
          )}
        </h2>
      </div>
      {/* Two columns: details | tasks */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto border-r border-border p-3">
          <div className="text-sm font-medium">{block.name}</div>
          <div className="mt-2 min-h-[120px] flex-1 min-w-0">
            <ToolbarlessEditor
              resetKey={block._id}
              initialContent={block.content}
              placeholder="Add notes..."
              contentMinHeight={120}
              className="w-full text-sm"
              projects={[]}
              tasks={[]}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
              <Clock className="ml-0.5" />
              <input
                type="time"
                value={block.startTime}
                readOnly
                className="min-h-[28px] w-auto min-w-[4.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0 focus:outline-none"
                aria-label="Start time"
              />
            </div>
            <span className="text-muted-foreground text-sm">–</span>
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
              <Clock className="ml-0.5" />
              <input
                type="time"
                value={block.endTime}
                readOnly
                className="min-h-[28px] w-auto min-w-[4.5rem] border-0 bg-transparent p-0 text-sm focus:ring-0 focus:outline-none"
                aria-label="End time"
              />
            </div>
            {blockColor && (
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md border-0 bg-muted/50 px-2 py-1 text-muted-foreground hover:bg-muted"
                aria-label="Color"
              >
                <div
                  className="h-4 w-4 rounded border border-border shrink-0"
                  style={{ backgroundColor: blockColor }}
                />
                <ChevronDown className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border py-1.5 px-3 text-xs font-medium text-muted-foreground bg-muted/50">
            Tasks
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-border">
            {blockTasks.length > 0 ? (
              <>
                {blockTasks.filter((t) => t.bucket !== "done").length > 0 && (
                  <div>
                    <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                      To-do
                    </div>
                    {blockTasks
                      .filter((t) => t.bucket !== "done")
                      .map((task) => (
                        <MockDrawerTaskItem key={task._id} task={task} isDone={false} />
                      ))}
                  </div>
                )}
                {blockTasks.filter((t) => t.bucket === "done").length > 0 && (
                  <div>
                    <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                      Completed
                    </div>
                    {blockTasks
                      .filter((t) => t.bucket === "done")
                      .map((task) => (
                        <MockDrawerTaskItem key={task._id} task={task} isDone />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <p className="p-3 text-sm text-muted-foreground">No tasks linked to this block</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_WIDTH = 250;

export function CalendarDayViewMockup() {
  const isMobile = useIsMobile();
  // Use a fixed seed (0) for day view - don't react to context changes
  const FIXED_SEED = 0;
  const { routineBlocks, tasks: initialTasks } = getMockDataForSeed(FIXED_SEED);
  const [tasks, setTasks] = useState<MockTask[]>(initialTasks);

  const currentDate = useMemo(() => new Date(), []);
  const [selectedBlock, setSelectedBlock] = useState<MockRoutineBlock | null>(null);
  const [activeTask, setActiveTask] = useState<MockTask | null>(null);
  const dayViewScrollRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const hourHeight = isMobile ? MOBILE_HOUR_HEIGHT : HOUR_HEIGHT;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const timeoutId = setTimeout(() => {
      const el = dayViewScrollRef.current;
      if (el) el.scrollTop = 10 * hourHeight;
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [isHydrated, hourHeight]);

  const dayBlocks = useMemo(
    () => routineBlocks.filter((block) => block.dayOfWeek === currentDate.getDay()),
    [routineBlocks, currentDate]
  );

  const shapingTasks = useMemo(
    () => tasks.filter((t) => t.bucket === "shaping"),
    [tasks]
  );
  const todoTasks = useMemo(
    () => tasks.filter((t) => t.bucket === "todo"),
    [tasks]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === "task" && data.task) setActiveTask(data.task as MockTask);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      const activeData = active.data.current;
      if (activeData?.type !== "task" || !over) return;
      const task = activeData.task as MockTask;
      const overId = String(over.id);
      if (!overId.startsWith("routine-block-drop-")) return;
      const routineBlockId = overId.replace("routine-block-drop-", "");
      if (!routineBlockId) return;
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, routineBlockId, bucket: "todo" as const } : t
        )
      );
    },
    []
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 0; hour <= 24; hour++) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  const gridLinesSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
      }
    }
    slots.push("24:00");
    return slots;
  }, []);

  const backgroundSlots = useMemo(
    () => gridLinesSlots.filter((t) => t !== "24:00"),
    [gridLinesSlots]
  );

  const totalHeight = HOURS_DISPLAY * hourHeight;
  const reviewRowHeight = 28;

  if (!isHydrated) {
    return (
      <div className="flex w-full h-full min-h-0 overflow-hidden">
        <div className="hidden md:block shrink-0 h-full w-[250px] border-r border-border bg-background" />
        <div className="flex-1 min-w-0 h-full bg-background flex flex-col">
          <div className="shrink-0 px-3 py-2 flex items-center justify-between border-b border-border">
            <div className="h-6 w-12 rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted/50 animate-pulse" />
          </div>
          <div className="shrink-0 h-8 border-b border-border" />
          <div className="shrink-0 h-8 border-b border-border" />
          <div className="flex-1 min-h-0 bg-muted/10" />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="p-2 rounded-lg bg-card border border-border text-card-foreground cursor-grabbing shadow-xl opacity-95 rotate-1 max-w-[260px]"
            style={{ boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)" }}
          >
            <div className="font-medium text-sm line-clamp-2">{activeTask.title}</div>
            <div className="flex flex-wrap gap-1 mt-1.5 items-center">
              {activeTask.projectId && getProjectById(activeTask.projectId) && (
                <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1">
                  <EntityIcon entityType="project" className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                  {getProjectById(activeTask.projectId)?.title}
                </Badge>
              )}
              {activeTask.categoryId && getCategoryById(activeTask.categoryId) && (
                <Badge variant="secondary" className="text-[10px] font-normal py-0 px-1">
                  <EntityIcon entityType="category" className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                  {getCategoryById(activeTask.categoryId)?.name}
                </Badge>
              )}
              {activeTask.linearIssueUrl && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground">
                  <ProviderIcon provider="linear" className="h-2.5 w-2.5 opacity-50" />
                  <span>{activeTask.linearIssueIdentifier ?? "Linear"}</span>
                </span>
              )}
              {activeTask.notionPageUrl && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted/50 text-muted-foreground max-w-[100px]">
                  <ProviderIcon provider="notion" className="h-2.5 w-2.5 opacity-50" />
                  <span className="truncate">{activeTask.notionPageTitle ?? "Notion"}</span>
                </span>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
      <div className="flex w-full h-full min-h-0 overflow-hidden">
        {/* Left sidebar - hidden on mobile */}
        <div
          className="hidden md:flex shrink-0 h-full flex-col bg-background border-r border-border"
          style={{ width: SIDEBAR_WIDTH, borderRightWidth: "0.5px" }}
        >
          <Tabs defaultValue="shaping" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b p-0 h-auto shrink-0">
              <TabsTrigger value="shaping" className="rounded-none px-3 py-2 text-sm">
                Shaping
              </TabsTrigger>
              <TabsTrigger value="todo" className="rounded-none px-3 py-2 text-sm">
                Todo
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shaping" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                {shapingTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">No shaping tasks</p>
                ) : (
                  shapingTasks.map((task) => (
                    <MockSidebarTaskItem key={task._id} task={task} bucket="shaping" />
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="todo" className="flex-1 flex flex-col min-h-0 m-0 data-[state=active]:flex overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                {todoTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-2">No todo tasks</p>
                ) : (
                  todoTasks.map((task) => (
                    <MockSidebarTaskItem key={task._id} task={task} bucket="todo" />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Day view */}
        <div className="relative flex-1 min-w-0 min-h-0 bg-background overflow-hidden flex flex-col">
          {selectedBlock && isMobile ? (
            <MobileEventDetailView
              block={selectedBlock}
              tasks={tasks}
              onClose={() => setSelectedBlock(null)}
            />
          ) : (
            <>
              {/* Day header */}
              <div
                className="shrink-0 px-3 py-2 flex items-center justify-between text-base font-medium border-b bg-background"
                style={{ borderBottomColor: "var(--border)", borderBottomWidth: "0.25px" }}
              >
                <div className="text-lg font-semibold">{currentDate.getDate()}</div>
                <div className="flex items-center gap-2">
                  {isToday(currentDate) && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">Today</Badge>
                  )}
                  <span className="text-muted-foreground text-sm">{formatDateDisplay(currentDate)}</span>
                </div>
              </div>

              {/* Weather row */}
              <div
                className="shrink-0 h-8 flex items-center px-3 gap-2 border-b"
                style={{ borderBottomColor: "var(--border)", borderBottomWidth: "0.25px", borderBottomStyle: "dashed" }}
              >
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">--</span>
              </div>

              {/* Daily notes row */}
              <div
                className="shrink-0 h-8 flex items-center px-3 gap-2 border-b"
                style={{ borderBottomColor: "var(--border)", borderBottomWidth: "0.25px", borderBottomStyle: "dashed" }}
              >
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Note</span>
              </div>

              {/* Time grid + blocks - single scrollable area so labels and column scroll together */}
              <div
                ref={dayViewScrollRef}
                className={cn(
                  "flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain transition-[padding] touch-pan-y",
                  selectedBlock && !isMobile && "pb-56"
                )}
                style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
              >
        <div
          className="flex"
          style={{ height: `${totalHeight + reviewRowHeight}px` }}
        >
          {/* Hour labels on the left */}
          <div
            className="shrink-0 relative border-r bg-background"
            style={{
              width: "32px",
              height: `${totalHeight}px`,
              borderRightColor: "var(--border)",
              borderRightWidth: "0.1px",
            }}
          >
            {timeSlots.map((time) => {
              const [hoursStr] = time.split(":");
              const hours = hoursStr ? Number(hoursStr) : 0;
              return (
                <div
                  key={time}
                  className="absolute flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-xs font-medium"
                  style={{
                    right: "-12px",
                    top: `${hours * hourHeight}px`,
                    transform: "translateY(-50%)",
                  }}
                >
                  {hours < 24 ? (hours < 12 ? hours : String(hours).padStart(2, "0")) : "24"}
                </div>
              );
            })}
          </div>

          {/* Day column */}
          <div
            className="flex-1 flex flex-col min-w-0 border-t"
            style={{
              borderTopColor: "var(--border)",
              borderTopWidth: "0.05px",
            }}
          >
            <div className="relative shrink-0" style={{ height: `${totalHeight}px` }}>
              {/* Background zones for sleep (non-work) hours */}
              {backgroundSlots.map((time) => {
                const workHours = MOCK_WORK_HOURS;
                const sleepTime = workHours.sleep;
                const wakeTime = workHours.wake;
                let isInSleepRange = false;
                if (sleepTime && wakeTime) {
                  const sleepMins = parseTime(sleepTime);
                  const wakeMins = parseTime(wakeTime);
                  const sleepTotalMins = sleepMins.hours * 60 + sleepMins.minutes;
                  const wakeTotalMins = wakeMins.hours * 60 + wakeMins.minutes;
                  const timeMins = parseTime(time);
                  const timeTotal = timeMins.hours * 60 + timeMins.minutes;
                  if (sleepTotalMins > wakeTotalMins) {
                    isInSleepRange = timeTotal >= sleepTotalMins || timeTotal < wakeTotalMins;
                  } else {
                    isInSleepRange = timeTotal >= sleepTotalMins;
                  }
                }
                if (!isInSleepRange) return null;
                return (
                  <div
                    key={`bg-${time}`}
                    className="absolute left-0 right-0 z-[1]"
                    style={{
                      top: `${timeToPosition(time, hourHeight)}px`,
                      height: `${hourHeight / 4}px`,
                      backgroundImage: "radial-gradient(circle, rgba(107, 114, 128, 0.15) 1px, transparent 1px)",
                      backgroundSize: "8px 8px",
                      backgroundColor: "rgba(107, 114, 128, 0.05)",
                    }}
                  />
                );
              })}

              {/* Grid lines */}
              {gridLinesSlots.map((time) => {
                const [, minutesStr] = time.split(":");
                const minutes = minutesStr ? Number(minutesStr) : 0;
                const [hoursStr] = time.split(":");
                const hours = hoursStr ? Number(hoursStr) : 0;
                const isHourBoundary = minutes === 0;
                const isMajorHour = hours === 0 || hours === 12 || hours === 24;
                return (
                  <div
                    key={time}
                    className="absolute left-0 right-0 border-t border-border z-[1]"
                    style={{
                      top: `${timeToPosition(time, hourHeight)}px`,
                      borderTopWidth: isHourBoundary && isMajorHour ? "1px" : "0.5px",
                      borderTopStyle: isHourBoundary ? "solid" : "dashed",
                    }}
                  />
                );
              })}

              {/* Wake / sleep lines */}
              {MOCK_WORK_HOURS.wake && (
                <div
                  className="absolute left-0 right-0 z-[2] border-t-2 border-gray-400 dark:border-gray-500 pointer-events-none"
                  style={{ top: `${timeToPosition(MOCK_WORK_HOURS.wake, hourHeight)}px` }}
                />
              )}
              {MOCK_WORK_HOURS.sleep && (
                <div
                  className="absolute left-0 right-0 z-[2] border-t-2 border-gray-400 dark:border-gray-500 pointer-events-none"
                  style={{ top: `${timeToPosition(MOCK_WORK_HOURS.sleep, hourHeight)}px` }}
                />
              )}

              {/* Routine blocks */}
              <div className="relative z-[2]" style={{ height: `${totalHeight}px` }}>
                {dayBlocks.map((block) => (
                  <RoutineBlockItem
                    key={block._id}
                    block={block}
                    tasks={tasks}
                    hourHeight={hourHeight}
                    onBlockClick={setSelectedBlock}
                  />
                ))}
              </div>

              <div
                className="absolute left-0 right-0 border-t border-border z-[2]"
                style={{ top: `${24 * hourHeight}px`, borderTopWidth: "0.5px" }}
              />
            </div>

            {/* Daily review row */}
            <div
              className="flex items-center gap-2 px-2 py-1.5 border-t text-sm font-medium text-muted-foreground shrink-0"
              style={{
                height: `${reviewRowHeight}px`,
                borderTopColor: "var(--border)",
                borderTopWidth: "0.25px",
                borderTopStyle: "dashed",
              }}
            >
              <CircleDashed className="h-4 w-4 shrink-0" />
              <span>Daily Review</span>
            </div>
          </div>
        </div>
      </div>

              {/* Mobile bottom drawer - Shaping | Todo 2 columns (visible on mobile via md:hidden) */}
              <div className="md:hidden shrink-0 flex flex-col h-[220px] border-t border-border bg-background overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-border shrink-0">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                      Shaping
                    </div>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 border-l border-border">
                      Todo
                    </div>
                  </div>
                  <div className="grid grid-cols-2 flex-1 min-h-0 overflow-hidden">
                    <div className="min-h-0 overflow-y-auto p-2 space-y-2 border-r border-border">
                      {shapingTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2">No shaping tasks</p>
                      ) : (
                        shapingTasks.map((task) => (
                          <MockSidebarTaskItem key={task._id} task={task} bucket="shaping" />
                        ))
                      )}
                    </div>
                    <div className="min-h-0 overflow-y-auto p-2 space-y-2">
                      {todoTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2">No todo tasks</p>
                      ) : (
                        todoTasks.map((task) => (
                          <MockSidebarTaskItem key={task._id} task={task} bucket="todo" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
            </>
          )}

          {/* Desktop: overlay drawer when block selected */}
          {selectedBlock && !isMobile && (
            <MockRoutineBlockDrawer
              block={selectedBlock}
              tasks={tasks}
              onClose={() => setSelectedBlock(null)}
            />
          )}
        </div>
      </div>
    </DndContext>
  );
}
