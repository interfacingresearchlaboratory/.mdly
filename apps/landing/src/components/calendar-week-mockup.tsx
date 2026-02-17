"use client";

import { useMemo, useState, useEffect, useRef, type CSSProperties } from "react";
import { Calendar, ChevronRight, ChevronLeft, Cloud, StickyNote, Check, Circle, CircleDashed, Code2, Rocket, ClipboardList } from "lucide-react";
import { ElectronWindow } from "./electron-window";
import { MockShellSidebar } from "./mock-shell-sidebar";
import { cn } from "@editor/ui/utils";
import { Badge } from "@editor/ui/badge";
import { Button } from "@editor/ui/button";
import {
  getMockDataForSeed,
  getTasksByBucket,
  getTasksByRoutineBlock,
  getProjectById,
  getCategoryById,
  MOCK_SEED_LABELS,
  type MockRoutineBlock,
  type MockTask,
} from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";
import { useMockSeed, useMockSeedControls } from "./mock-seed-provider";

// Utility functions (copied from app/web)
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

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDates(startDate: Date, firstDayOfWeek: number = 1): Date[] {
  const d = new Date(startDate);
  const day = d.getDay();
  let diff = day - firstDayOfWeek;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() - diff);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(d);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_ABBREV = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatWeekDayHeader(date: Date): string {
  return `${DAYS_SHORT[date.getDay()]} ${date.getDate()}`;
}

function formatMonthNameShort(date: Date): string {
  return MONTHS_ABBREV[date.getMonth()] ?? "";
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DEFAULT_HOUR_HEIGHT = 50;
const HOURS_DISPLAY = 25; // 0-24
const REVIEW_SECTION_HEIGHT = 150; // Weekly + daily + 3 empty rows

// Mock work hours - mirrors real app sleep/wake display
const MOCK_WORK_HOURS = { wake: "07:00", sleep: "23:00" };

function RoutineBlockItem({
  block,
  tasks: allTasks,
  hourHeight = DEFAULT_HOUR_HEIGHT,
}: {
  block: MockRoutineBlock;
  tasks: MockTask[];
  hourHeight?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tasks = getTasksByRoutineBlock(block._id, allTasks);
  const hasTasks = tasks.length > 0;

  if (!block.startTime || !block.endTime) return null;

  const top = timeToPosition(block.startTime, hourHeight);
  const height = durationToHeight(block.startTime, block.endTime, hourHeight);
  const blockColor = block.color || "#3b82f6";
  const isGhosted = block.isTemplateBased && !hasTasks;
  const isDailySchedule = block.blockType === "daily_schedule";

  const getBackgroundStyle = () => {
    if (isHovered) {
      return { backgroundColor: hexToRgba(blockColor, 0.4) };
    }
    if (isDailySchedule) {
      // Match real app: diagonal hatch with gray stripes (breakfast, lunch, dinner, gym, etc.)
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(107, 114, 128, 0.25) 4px, rgba(107, 114, 128, 0.25) 5px)`,
        backgroundColor: "transparent",
      };
    }
    if (isGhosted) {
      return { backgroundColor: hexToRgba(blockColor, 0.1) };
    }
    return { backgroundColor: hexToRgba(blockColor, 0.2) };
  };

  return (
    <div
      style={{
        ...getBackgroundStyle(),
        position: "absolute",
        top: `${top}px`,
        height: `${height}px`,
        left: isDailySchedule ? 0 : "4px",
        right: isDailySchedule ? 0 : "16px",
        borderColor: isDailySchedule ? "hsl(var(--border))" : blockColor,
        borderWidth: "1px",
        borderStyle: isGhosted ? "dashed" : "solid",
        transition: "background-color 0.2s ease",
      }}
      className={cn(
        "border p-1 text-xs cursor-pointer relative",
        isDailySchedule ? "rounded-none bg-gray-200/80 dark:bg-gray-700/80" : "rounded-r-md",
        isGhosted && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {isDailySchedule ? (
          <>
            <div className="font-medium truncate px-0.5 inline-block text-xs">{block.name}</div>
            {hasTasks && (
              <div className="mt-1 items-center gap-1 px-0.5 inline-flex">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blockColor }} />
                <span className="text-xs opacity-75">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="font-medium truncate text-xs">{block.name}</div>
            {hasTasks && (
              <div className="mt-1 flex items-center">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blockColor }} />
                <span className="text-xs opacity-75">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: MockTask }) {
  const [isHovered, setIsHovered] = useState(false);
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const category = task.categoryId ? getCategoryById(task.categoryId) : undefined;

  return (
    <div
      className={cn(
        "p-2 rounded-md border bg-background text-sm cursor-pointer transition-colors",
        isHovered && "bg-accent border-primary/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="font-medium truncate">{task.title}</div>
      {(project || category) && (
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {project && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {project.title}
            </span>
          )}
          {category && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {category.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function CalendarWeekMockup() {
  const { seedIndex, setSeedIndex } = useMockSeedControls();
  const { routineBlocks, tasks } = getMockDataForSeed(seedIndex);

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"shaping" | "todo">("shaping");
  const [autocyclePaused, setAutocyclePaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Use real current date so the current-time line shows correctly
  const currentDate = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(currentDate, 1), [currentDate]);

  // Map blocks by dayOfWeek to current week (Mon=1 -> index 0, etc.)
  const getBlocksForDate = (date: Date) =>
    routineBlocks.filter((block) => block.dayOfWeek === date.getDay());

  const shapingTasks = getTasksByBucket("shaping", tasks);
  const todoTasks = getTasksByBucket("todo", tasks);
  const backlogTasks = getTasksByBucket("backlog", tasks);

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

  // 15-min slots for background zones (exclude 24:00)
  const backgroundSlots = useMemo(
    () => gridLinesSlots.filter((t) => t !== "24:00"),
    [gridLinesSlots]
  );

  // Real current time - updates every minute for the red "now" line
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredPersonaIndex, setHoveredPersonaIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const personaButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const personaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll so 9am is visible at top
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollTo9am = 9 * DEFAULT_HOUR_HEIGHT;
    el.scrollTop = scrollTo9am;
  }, []);

  // Magnetic pill: update position for active or hovered tab
  const targetPersonaIndex = hoveredPersonaIndex ?? seedIndex;
  useEffect(() => {
    const btn = personaButtonRefs.current[targetPersonaIndex];
    const container = personaContainerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [targetPersonaIndex]);

  // Autocycle persona pills every 2s; stop when user clicks
  useEffect(() => {
    if (autocyclePaused) return;
    const id = setInterval(() => {
      setSeedIndex((seedIndex + 1) % 3);
    }, 2000);
    return () => clearInterval(id);
  }, [autocyclePaused, seedIndex, setSeedIndex]);

  return (
    <div className="flex flex-col gap-2 mt-10">
      <div className="flex justify-center w-full pb-5">
        <div
          ref={personaContainerRef}
          className="relative flex gap-0.5 p-0.5 rounded-lg border border-border bg-muted/30"
        >
          {([Code2, Rocket, ClipboardList] as const).map((Icon, index) => (
            <button
              key={MOCK_SEED_LABELS[index]}
              ref={(el) => { personaButtonRefs.current[index] = el; }}
              type="button"
              onClick={() => {
                setSeedIndex(index);
                setAutocyclePaused(true);
              }}
              onMouseEnter={() => setHoveredPersonaIndex(index)}
              onMouseLeave={() => setHoveredPersonaIndex(null)}
              className={cn(
                "relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                targetPersonaIndex === index
                  ? "!text-white [&_svg]:!text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {MOCK_SEED_LABELS[index]}
            </button>
          ))}
          <div
            className="absolute z-0 top-0.5 bottom-0.5 rounded-md bg-[#0101fd] transition-all duration-200 ease-out"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
            }}
          />
        </div>
      </div>
      <ElectronWindow title="Calendar - Week View" icon={<Calendar className="h-3 w-3" />} className="w-full max-w-full">
        <div className="flex h-full overflow-hidden" style={{ maxHeight: "800px", height: "800px" }}>
        <MockShellSidebar forceCollapsedOnMobile />

        {/* Main content area with calendar + todo sidebars */}
          <div className="flex-1 flex min-w-0 relative overflow-hidden border-l border-t">
            {/* Left Todo Sidebar - toggleable, closed by default, hidden on mobile */}
            <div
              className={cn(
                "h-full w-[300px] bg-background border-r z-20 flex flex-col absolute left-0 top-0 bottom-0",
                "transition-transform duration-300 ease-in-out",
                leftSidebarOpen ? "translate-x-0" : "-translate-x-full",
                "hidden md:flex"
              )}
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="grid grid-cols-2 border-b">
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "shaping"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveTab("shaping")}
                  >
                    Shaping
                  </button>
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "todo"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setActiveTab("todo")}
                  >
                    Todo
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {activeTab === "shaping" &&
                    shapingTasks.map((task) => <TaskItem key={task._id} task={task} />)}
                  {activeTab === "todo" && todoTasks.map((task) => <TaskItem key={task._id} task={task} />)}
                </div>
              </div>
            </div>

            {/* Calendar center - shifts based on sidebar state on desktop */}
            <div
              className="flex-1 min-w-0 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                marginLeft: isMobile ? 0 : leftSidebarOpen ? 300 : 0,
                marginRight: isMobile ? 0 : rightSidebarOpen ? 300 : 0,
              }}
            >
              {/* Left toggle button - hidden on mobile */}
              <Button
                variant="outline"
                size="icon"
                className="absolute z-30 rounded-full h-6 w-6 transition-all duration-300 hidden md:flex"
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  left: "8px",
                }}
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                aria-label="Toggle left sidebar"
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", leftSidebarOpen && "rotate-180")} />
              </Button>

              {/* Right toggle button - hidden on mobile */}
              <Button
                variant="outline"
                size="icon"
                className="absolute z-30 rounded-full h-6 w-6 transition-all duration-300 hidden md:flex"
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "8px",
                }}
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                aria-label="Toggle right sidebar"
              >
                <ChevronLeft className={cn("h-3 w-3 transition-transform", rightSidebarOpen && "rotate-180")} />
              </Button>

              {/* Calendar week view - whole calendar scrollable on mobile (header + body), header scrolls with body horizontally */}
              <div className="flex-1 flex flex-col min-h-0 overflow-x-auto md:overflow-x-visible md:items-stretch items-start">
                <div className="flex flex-col flex-1 min-h-0 w-[700px] md:w-auto min-w-[700px] md:min-w-0 shrink-0 md:shrink px-4 pt-2 pb-4">
                {/* Day header row */}
                <div className="flex border-t shrink-0 min-w-[700px] md:min-w-0" style={{ borderTopColor: "var(--border)", borderTopWidth: "0.05px" }}>
                  {weekDates.map((date, index) => (
                    <div
                      key={`header-${formatDateKey(date)}`}
                      className="flex-1 min-w-[100px] shrink-0 md:min-w-0 md:shrink border-r last:border-r-0 border-b bg-background px-2 py-1 flex items-center justify-between text-sm font-medium"
                      style={{
                        borderRightColor: "var(--border)",
                        borderRightWidth: "0.1px",
                        borderBottomColor: "var(--border)",
                        borderBottomWidth: "0.25px",
                        borderLeftColor: index === 0 ? "var(--border)" : "transparent",
                        borderLeftWidth: index === 0 ? "0.1px" : "0px",
                      }}
                    >
                      <div className="text-base font-medium">{formatWeekDayHeader(date)}</div>
                      <div className="flex items-center gap-1.5">
                        {isToday(date) && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-1 py-0">Today</Badge>
                        )}
                        <span className="text-muted-foreground text-xs">{formatMonthNameShort(date)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weather row */}
                <div className="flex shrink-0 min-w-[700px] md:min-w-0">
                  {weekDates.map((date, index) => (
                    <div
                      key={`weather-${formatDateKey(date)}`}
                      className="flex-1 min-w-[100px] shrink-0 md:min-w-0 md:shrink border-r last:border-r-0 flex flex-col"
                      style={{
                        borderRightColor: "var(--border)",
                        borderRightWidth: "0.1px",
                        borderLeftColor: index === 0 ? "var(--border)" : "transparent",
                        borderLeftWidth: index === 0 ? "0.1px" : "0px",
                      }}
                    >
                      <div
                        className="h-[30px] border-b flex items-center px-2 gap-1"
                        style={{ borderBottomColor: "var(--border)", borderBottomWidth: "0.25px", borderBottomStyle: "dashed" }}
                      >
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">--</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily notes row */}
                <div className="flex shrink-0 min-w-[700px] md:min-w-0">
                  {weekDates.map((date, index) => (
                    <div
                      key={`notes-${formatDateKey(date)}`}
                      className="flex-1 min-w-[100px] shrink-0 md:min-w-0 md:shrink border-r last:border-r-0 flex flex-col"
                      style={{
                        borderRightColor: "var(--border)",
                        borderRightWidth: "0.1px",
                        borderLeftColor: index === 0 ? "var(--border)" : "transparent",
                        borderLeftWidth: index === 0 ? "0.1px" : "0px",
                      }}
                    >
                      <a
                        href={`${siteConfig.appUrl}/routines`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-[30px] border-b flex items-center px-2 gap-2 cursor-pointer transition-colors hover:bg-accent"
                        style={{ borderBottomColor: "var(--border)", borderBottomWidth: "0.25px", borderBottomStyle: "dashed" }}
                      >
                        <StickyNote className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Note</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Day columns with time circles overlay and routine blocks - vertical scroll only, horizontal scroll is on parent so header stays in sync */}
                <div
                  ref={scrollContainerRef}
                  className="flex flex-1 min-h-0 min-w-[700px] md:min-w-0 relative overflow-x-hidden overflow-y-auto md:overflow-auto"
                >
                  {/* Time circles overlay - behind routine blocks so events stay visible */}
                  <div className="absolute inset-0 pointer-events-none z-[1]" style={{ height: `${HOURS_DISPLAY * DEFAULT_HOUR_HEIGHT}px` }}>
                    {weekDates.map((date, columnIndex) => {
                      const columnWidthPercent = 100 / weekDates.length;
                      const leftOffset = `${columnIndex * columnWidthPercent}%`;
                      return (
                        <div key={`circles-${formatDateKey(date)}`} className="absolute inset-0">
                          {timeSlots.map((time) => {
                            const [hoursStr] = time.split(":");
                            const hours = hoursStr ? Number(hoursStr) : 0;
                            return (
                              <div
                                key={`time-circle-${formatDateKey(date)}-${time}`}
                                className="absolute flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border text-xs font-medium"
                                style={{
                                  left: `calc(${leftOffset} - 10px)`,
                                  top: `${hours * DEFAULT_HOUR_HEIGHT}px`,
                                  transform: "translateY(-50%)",
                                }}
                              >
                                {hours < 24 ? (hours < 12 ? hours : String(hours).padStart(2, "0")) : "24"}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Day columns flex container */}
                  <div className="flex flex-1 min-w-[700px] md:min-w-0 border-t relative" style={{ minHeight: `${HOURS_DISPLAY * DEFAULT_HOUR_HEIGHT + REVIEW_SECTION_HEIGHT}px`, borderTopColor: "var(--border)", borderTopWidth: "0.05px" }}>
                    {weekDates.map((date, columnIndex) => {
                      const dateKey = formatDateKey(date);
                      const dayBlocks = getBlocksForDate(date);

                      return (
                        <div
                          key={dateKey}
                          className="relative flex-1 min-w-[100px] shrink-0 md:min-w-0 md:shrink border-r last:border-r-0 flex flex-col overflow-hidden"
                          style={{
                            borderRightColor: "var(--border)",
                            borderRightWidth: "0.1px",
                            borderLeftColor: columnIndex === 0 ? "var(--border)" : "transparent",
                            borderLeftWidth: columnIndex === 0 ? "0.1px" : "0px",
                          }}
                        >
                          {/* Time grid - hours 0-24, review sits below this */}
                          <div
                            className="relative overflow-hidden"
                            style={{ height: `${HOURS_DISPLAY * DEFAULT_HOUR_HEIGHT}px` }}
                          >
                            {/* Background zones for sleep and inactive (non-work) hours */}
                          {backgroundSlots.map((time) => {
                            const workHours = MOCK_WORK_HOURS;
                            const workHoursSleepParsed = parseTime(workHours.sleep);
                            const timeMins = parseTime(time);
                            const sleepTotal = workHoursSleepParsed.hours * 60 + workHoursSleepParsed.minutes;
                            const timeTotal = timeMins.hours * 60 + timeMins.minutes;
                            const hour23Total = 23 * 60;
                            const isInactive = timeTotal > sleepTotal && timeTotal < hour23Total;

                            const sleepTime = workHours.sleep;
                            const wakeTime = workHours.wake;
                            let isInSleepRange = false;
                            if (sleepTime && wakeTime) {
                              const sleepMins = parseTime(sleepTime);
                              const wakeMins = parseTime(wakeTime);
                              const sleepTotalMins = sleepMins.hours * 60 + sleepMins.minutes;
                              const wakeTotalMins = wakeMins.hours * 60 + wakeMins.minutes;
                              if (sleepTotalMins > wakeTotalMins) {
                                isInSleepRange = timeTotal >= sleepTotalMins || timeTotal < wakeTotalMins;
                              } else {
                                isInSleepRange = timeTotal >= sleepTotalMins;
                              }
                            }

                            if (!isInactive && !isInSleepRange) return null;

                            const isSleepRange = isInSleepRange;
                            const bgStyle: CSSProperties = isSleepRange
                              ? {
                                  backgroundImage: `radial-gradient(circle, rgba(107, 114, 128, 0.15) 1px, transparent 1px)`,
                                  backgroundSize: "8px 8px",
                                  backgroundColor: "rgba(107, 114, 128, 0.05)",
                                }
                              : {};

                            return (
                              <div
                                key={`bg-${time}`}
                                className={cn(
                                  "absolute left-0 right-0 z-[1]",
                                  !isSleepRange && "bg-gray-100/50 dark:bg-gray-900/50"
                                )}
                                style={{
                                  top: `${timeToPosition(time, DEFAULT_HOUR_HEIGHT)}px`,
                                  height: `${DEFAULT_HOUR_HEIGHT / 4}px`,
                                  ...bgStyle,
                                }}
                              />
                            );
                          })}

                          {/* Wake and Sleep time lines */}
                          {MOCK_WORK_HOURS.wake && (
                            <div
                              className="absolute left-0 right-0 z-[2] border-t-2 border-gray-400 dark:border-gray-500 pointer-events-none"
                              style={{
                                top: `${timeToPosition(MOCK_WORK_HOURS.wake, DEFAULT_HOUR_HEIGHT)}px`,
                              }}
                              title={`Wake ${MOCK_WORK_HOURS.wake}`}
                            />
                          )}
                          {MOCK_WORK_HOURS.sleep && (
                            <div
                              className="absolute left-0 right-0 z-[2] border-t-2 border-gray-400 dark:border-gray-500 pointer-events-none"
                              style={{
                                top: `${timeToPosition(MOCK_WORK_HOURS.sleep, DEFAULT_HOUR_HEIGHT)}px`,
                              }}
                              title={`Sleep ${MOCK_WORK_HOURS.sleep}`}
                            />
                          )}

                          {/* Grid lines - every 15 min dashed, every hour solid */}
                          {gridLinesSlots.map((time) => {
                            const [, minutesStr] = time.split(":");
                            const minutes = minutesStr ? Number(minutesStr) : 0;
                            const [hoursStr] = time.split(":");
                            const hours = hoursStr ? Number(hoursStr) : 0;
                            const isHourBoundary = minutes === 0;
                            const isMajorHour = hours === 0 || hours === 12 || hours === 24;
                            return (
                              <div
                                key={`line-${time}`}
                                className="absolute left-0 right-0 border-t border-border z-[1]"
                                style={{
                                  top: `${timeToPosition(time, DEFAULT_HOUR_HEIGHT)}px`,
                                  borderTopWidth: isHourBoundary && isMajorHour ? "1px" : "0.5px",
                                  borderTopStyle: isHourBoundary ? "solid" : "dashed",
                                }}
                              />
                            );
                          })}

                          {/* Routine blocks */}
                          <div className="relative z-[2]" style={{ height: `${HOURS_DISPLAY * DEFAULT_HOUR_HEIGHT}px` }}>
                            {dayBlocks.map((block) => (
                              <RoutineBlockItem key={block._id} block={block} tasks={tasks} hourHeight={DEFAULT_HOUR_HEIGHT} />
                            ))}
                          </div>

                          {/* Current time indicator - red line at real current time on today only */}
                          {mounted && currentTime && isToday(date) && (
                            <div
                              className="absolute left-0 right-0 z-[25] border-t-2 border-red-500 pointer-events-none"
                              style={{
                                top: `${timeToPosition(currentTime, DEFAULT_HOUR_HEIGHT)}px`,
                                height: 0,
                              }}
                              title={`Now: ${currentTime}`}
                            />
                          )}
                            {/* Hour 24 line at bottom - review sits directly below */}
                            <div
                              className="absolute left-0 right-0 border-t border-border z-[2]"
                              style={{
                                top: `${24 * DEFAULT_HOUR_HEIGHT}px`,
                                borderTopWidth: "0.5px",
                              }}
                            />
                          </div>

                          {/* Review rows - underneath last hour, match real app with icons and colors */}
                          <div className="flex flex-col shrink-0">
                            {/* Weekly Review - only on Sunday */}
                            <div className="flex-shrink-0 h-[30px] min-h-[30px] flex items-stretch">
                              {date.getDay() === 0 ? (
                                <a
                                  href={`${siteConfig.appUrl}/reviews`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-1.5 flex-1 min-h-0 w-full box-border overflow-hidden border-b text-left px-2 text-xs font-medium cursor-pointer transition-colors",
                                    "text-green-600 dark:text-green-500 hover:bg-accent"
                                  )}
                                  style={{
                                    borderBottomColor: "var(--border)",
                                    borderBottomWidth: "0.25px",
                                    borderBottomStyle: "dashed",
                                    minHeight: "30px",
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5 shrink-0" />
                                  <span>Weekly Review</span>
                                </a>
                              ) : (
                                <div
                                  className="flex-1 min-h-0"
                                  style={{
                                    borderBottomColor: "var(--border)",
                                    borderBottomWidth: "0.25px",
                                    borderBottomStyle: "dashed",
                                  }}
                                />
                              )}
                            </div>
                            {/* Daily Review - varied states (complete/in progress/not started) */}
                            {(() => {
                              const dayIdx = date.getDay();
                              const state =
                                dayIdx === 1 || dayIdx === 2 ? "complete" : dayIdx === 3 || dayIdx === 4 ? "in_progress" : "not_started";
                              return (
                                <a
                                  href={`${siteConfig.appUrl}/reviews`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-1.5 flex-1 min-h-0 h-[30px] w-full box-border overflow-hidden border-b text-left px-2 text-xs font-medium cursor-pointer transition-colors",
                                    state === "complete" && "text-green-600 dark:text-green-500",
                                    state === "in_progress" && "text-blue-600 dark:text-blue-500",
                                    state === "not_started" && "text-muted-foreground",
                                    "hover:bg-accent"
                                  )}
                                  style={{
                                    borderBottomColor: "var(--border)",
                                    borderBottomWidth: "0.25px",
                                    borderBottomStyle: "dashed",
                                    minHeight: "30px",
                                  }}
                                >
                                  {state === "complete" && <Check className="h-3.5 w-3.5 shrink-0" />}
                                  {state === "in_progress" && <Circle className="h-3.5 w-3.5 shrink-0" />}
                                  {state === "not_started" && <CircleDashed className="h-3.5 w-3.5 shrink-0" />}
                                  <span>Daily Review</span>
                                </a>
                              );
                            })()}
                            {/* Empty rows 3-5 */}
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="flex-shrink-0 box-border overflow-hidden border-b"
                                style={{
                                  height: "30px",
                                  borderTopWidth: "0px",
                                  borderBottomColor: "var(--border)",
                                  borderBottomWidth: "0.25px",
                                  borderBottomStyle: "dashed",
                                  margin: 0,
                                  padding: 0,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Right Todo Sidebar - Backlog - toggleable, closed by default, hidden on mobile */}
            <div
              className={cn(
                "h-full w-[300px] bg-background border-l z-20 flex flex-col absolute right-0 top-0 bottom-0",
                "transition-transform duration-300 ease-in-out",
                rightSidebarOpen ? "translate-x-0" : "translate-x-full",
                "hidden md:flex"
              )}
            >
              <div className="px-4 py-2 border-b bg-muted/50">
                <h3 className="text-sm font-semibold">Backlog</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {backlogTasks.map((task) => (
                  <TaskItem key={task._id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ElectronWindow>
    </div>
  );
}
