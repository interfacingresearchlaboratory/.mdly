"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { ElectronWindow } from "./electron-window";
import { Checkbox } from "@editor/ui/checkbox";
import { Badge } from "@editor/ui/badge";
import { cn } from "@editor/ui/utils";
import {
  getMockDataForSeed,
  getTasksByRoutineBlock,
  getProjectById,
  getCategoryById,
  getContainerById,
  type MockRoutineBlock,
  type MockTask,
} from "@/lib/mock-data";
import { EntityIcon } from "@editor/ui/entity-icon";
import { useMockSeed } from "./mock-seed-provider";

const DRAWER_BLOCK_ID = "routine-5";
const MOCK_LINKED_DONE: MockTask[] = [
  { _id: "mock-done-1", title: "API migration setup", bucket: "done", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-5" },
];

const MOCK_UNLINKED_COMPLETED: MockTask[] = [
  { _id: "implicit-1", title: "Quick Slack reply", bucket: "done", projectId: "project-1", categoryId: "category-4" },
  { _id: "implicit-2", title: "Email triage", bucket: "done", projectId: "project-2", categoryId: "category-1" },
];

function getWeekDates(startDate: Date, firstDayOfWeek = 1): Date[] {
  const d = new Date(startDate);
  const day = d.getDay();
  let diff = day - firstDayOfWeek;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(d);
    date.setDate(date.getDate() + i);
    return date;
  });
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_ABBREV = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatWeekDayHeader(date: Date): string {
  return `${DAYS_SHORT[date.getDay()]} ${date.getDate()}`;
}

function formatMonthNameShort(date: Date): string {
  return MONTHS_ABBREV[date.getMonth()] ?? "";
}

function CalendarBackground({ className }: { className?: string }) {
  const currentDate = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(currentDate, 1), [currentDate]);
  const seedIndex = useMockSeed();
  const { routineBlocks } = getMockDataForSeed(seedIndex);

  const HOUR_HEIGHT = 40;
  const START_HOUR = 8;
  const END_HOUR = 20;
  const HOURS = END_HOUR - START_HOUR;

  const getBlocksForDate = (date: Date) =>
    routineBlocks.filter((b) => b.dayOfWeek === date.getDay());

  function parseTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    return { hours: h || 0, minutes: m || 0 };
  }
  function timeToPos(t: string) {
    const { hours, minutes } = parseTime(t);
    return ((hours - START_HOUR) * 60 + minutes) / 60 * HOUR_HEIGHT;
  }
  function durationToHeight(start: string, end: string) {
    const s = parseTime(start);
    const e = parseTime(end);
    return ((e.hours * 60 + e.minutes - (s.hours * 60 + s.minutes)) / 60) * HOUR_HEIGHT;
  }

  return (
    <div className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex border-b text-xs">
        <div className="w-12 shrink-0" />
        {weekDates.map((d) => (
          <div key={d.getTime()} className="flex-1 border-r px-1 py-1 text-center">
            <div className="font-medium">{formatWeekDayHeader(d)}</div>
            <div className="text-muted-foreground">{formatMonthNameShort(d)}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 min-h-0" style={{ minHeight: HOURS * HOUR_HEIGHT }}>
        <div className="w-12 shrink-0 border-r text-[10px] text-muted-foreground">
          {Array.from({ length: HOURS }, (_, i) => (
            <div key={i} className="h-10 leading-10 pl-0.5">
              {String(START_HOUR + i).padStart(2, "0")}:00
            </div>
          ))}
        </div>
        {weekDates.map((date) => (
          <div key={date.getTime()} className="flex-1 border-r relative overflow-hidden" style={{ height: HOURS * HOUR_HEIGHT }}>
            {getBlocksForDate(date).map((block) => {
              if (!block.startTime || !block.endTime) return null;
              const top = timeToPos(block.startTime);
              const height = durationToHeight(block.startTime, block.endTime);
              const isDaily = block.blockType === "daily_schedule";
              return (
                <div
                  key={block._id}
                  className="absolute left-0.5 right-0.5 rounded text-[10px] p-0.5 truncate"
                  style={{
                    top,
                    height,
                    backgroundColor: isDaily ? "rgba(107,114,128,0.15)" : `${block.color || "#3b82f6"}33`,
                    borderLeft: isDaily ? undefined : `2px solid ${block.color || "#3b82f6"}`,
                  }}
                >
                  {block.name}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, isDone }: { task: MockTask; isDone: boolean }) {
  const container = task.containerId ? getContainerById(task.containerId) : undefined;
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const category = task.categoryId ? getCategoryById(task.categoryId) : undefined;

  return (
    <div className="flex items-center gap-2 py-1 px-3 hover:bg-muted/50 rounded-md text-xs">
      <Checkbox checked={isDone} className="h-3.5 w-3.5 rounded-full shrink-0" />
      <span className={cn("flex-1 min-w-0 truncate", isDone && "line-through text-muted-foreground")}>
        {task.title}
      </span>
      {(container || project || category) && (
        <div className="flex shrink-0 gap-1 flex-wrap">
          {container && (
            <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px] font-normal truncate max-w-[80px]">
              <EntityIcon entityType="container" className="h-2.5 w-2.5 shrink-0 opacity-70" />
              <span className="truncate">{container.name}</span>
            </Badge>
          )}
          {project && (
            <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px] font-normal truncate max-w-[80px]">
              <EntityIcon entityType="project" className="h-2.5 w-2.5 shrink-0 opacity-70" />
              <span className="truncate">{project.title}</span>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px] font-normal">
              <EntityIcon entityType="category" className="h-2.5 w-2.5 shrink-0 opacity-70" />
              {category.name}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function TimeAwareSchedulingMockup() {
  const seedIndex = useMockSeed();
  const { routineBlocks, tasks } = getMockDataForSeed(seedIndex);

  const block = useMemo(
    () => routineBlocks.find((b) => b._id === DRAWER_BLOCK_ID) ?? routineBlocks.find((b) => b.blockType === "routine") ?? routineBlocks[0],
    [routineBlocks]
  );

  const linkedTasks = useMemo(
    () => (block ? [...getTasksByRoutineBlock(block._id, tasks), ...MOCK_LINKED_DONE.filter((m) => m.routineBlockId === block._id)] : []),
    [block, tasks]
  );

  const todoTasks = linkedTasks.filter((t) => t.bucket !== "done");
  const doneTasks = linkedTasks.filter((t) => t.bucket === "done");

  if (!block) return null;

  const displayDate = block.displayDate ?? block.date ?? "2024-01-15";
  const dateLabel = displayDate ? `${displayDate} · ` : "";

  return (
    <ElectronWindow title="Calendar - Week View" icon={<Calendar className="h-3 w-3" />} className="w-full max-w-full h-[600px]">
      <div className="border-t relative flex flex-col min-h-0 overflow-hidden h-full">
        {/* Calendar background - visible but will be blurred */}
        <div className="absolute inset-0 z-0">
          <CalendarBackground className="h-full w-full" />
        </div>

        {/* Blur overlay */}
        <div
          className="absolute inset-0 z-10 backdrop-blur-[1px] bg-background/60"
          aria-hidden
        />

        {/* Bottom drawer - fixed height so column scroll heights resolve */}
        <div
          className={cn(
            "relative z-20 mt-auto flex flex-col flex-none overflow-hidden border-t border-border bg-background shadow-xl"
          )}
          style={{ height: "450px" }}
        >
          {/* Drawer header - matches CalendarBottomDrawer */}
          <div className="flex shrink-0 items-center justify-center gap-2 border-b border-border px-2 py-1">
            <span className="text-xs font-medium">{block.name}</span>
            <span className="text-xs text-muted-foreground">
              {dateLabel}{block.startTime} – {block.endTime}
            </span>
          </div>

          {/* Content wrapper - same as CalendarBottomDrawer: flex min-h-0 flex-1 flex-col overflow-hidden */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>
          {/* Two columns - same as RoutineBlockDrawerContent root */}
          <div className="flex min-h-0 flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {/* Left: Routine block details - whole column scrolls (same pattern as right: outer flex + inner scroll) */}
            <div className="flex flex-col flex-shrink-0 w-[45%] min-w-0 min-h-0 overflow-hidden border-r border-border" style={{ minHeight: 0 }}>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
                <div className="p-4 pb-8">
                  <input
                  readOnly
                  value={block.name}
                  className="text-base font-medium bg-transparent border-0 focus:ring-0 p-0 outline-none w-full"
                />
                <div
                  className="mt-2 w-full text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap"
                  aria-label="Block notes"
                >
                  {`Focus on API migration and cache layer. Pair with design on error states.

Key goals for this block:
- Complete the migration from REST to GraphQL for the dashboard endpoints
- Update the cache invalidation logic to handle the new data shape
- Review PRs for the chart component refactor

Link context: Working across API Refactor and Dashboard UI under Product container.`}
                </div>
                {/* Project and container links */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {getContainerById("container-1") && (
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5 text-xs font-normal py-1">
                      <EntityIcon entityType="container" className="h-3 w-3 shrink-0 opacity-70" />
                      <span>{getContainerById("container-1")!.name}</span>
                    </Badge>
                  )}
                  {getProjectById("project-1") && (
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5 text-xs font-normal py-1">
                      <EntityIcon entityType="project" className="h-3 w-3 shrink-0 opacity-70" />
                      <span>{getProjectById("project-1")!.title}</span>
                    </Badge>
                  )}
                  {getProjectById("project-2") && (
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5 text-xs font-normal py-1">
                      <EntityIcon entityType="project" className="h-3 w-3 shrink-0 opacity-70" />
                      <span>{getProjectById("project-2")!.title}</span>
                    </Badge>
                  )}
                </div>
                {/* Selectors - styled like real app */}
                <div className="mt-4 pt-4 flex flex-wrap items-center gap-2 border-t border-border/50">
                  <div className="flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm">
                    Mon 15 Jan
                  </div>
                  <div className="flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm">
                    {block.startTime} – {block.endTime}
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input"
                    style={{ backgroundColor: block.color || "#3b82f6" }}
                  />
                </div>
              </div>
              </div>
            </div>

            {/* Right: tasks column - fixed header + scrollable list (match RoutineBlockDrawerContent) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" style={{ minHeight: 0 }}>
              <div className="border-b border-border sticky top-0 z-10 shrink-0 p-1 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">
                Tasks
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden divide-y divide-border pb-12" style={{ minHeight: 0 }}>
                {todoTasks.length > 0 && (
                  <div>
                    <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                      To-do
                    </div>
                    {todoTasks.map((t) => (
                      <TaskRow key={t._id} task={t} isDone={false} />
                    ))}
                  </div>
                )}
                {doneTasks.length > 0 && (
                  <div>
                    <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                      Completed
                    </div>
                    {doneTasks.map((t) => (
                      <TaskRow key={t._id} task={t} isDone />
                    ))}
                  </div>
                )}
                {MOCK_UNLINKED_COMPLETED.length > 0 && (
                  <div>
                    <div className="p-1 text-xs text-muted-foreground bg-muted backdrop-blur-sm sticky top-0 border-b border-border">
                      Unscheduled tasks completed in this period
                    </div>
                    {MOCK_UNLINKED_COMPLETED.map((t) => (
                      <TaskRow key={t._id} task={t} isDone />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
