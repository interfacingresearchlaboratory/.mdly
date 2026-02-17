"use client";

import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { ElectronWindow } from "./electron-window";
import { cn } from "@editor/ui/utils";
import {
  getMockDataForSeed,
  getTasksByRoutineBlock,
  type MockRoutineBlock,
  type MockTask,
} from "@/lib/mock-data";
import { useMockSeed } from "./mock-seed-provider";

// Utility functions (simplified versions)
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

const DEFAULT_HOUR_HEIGHT = 60;
const START_HOUR = 7;
const END_HOUR = 23;

const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function RoutineBlockItem({
  block,
  tasks: allTasks,
  hourHeight = DEFAULT_HOUR_HEIGHT,
  startHourOffset = 0,
}: {
  block: MockRoutineBlock;
  tasks: MockTask[];
  hourHeight?: number;
  startHourOffset?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tasks = getTasksByRoutineBlock(block._id, allTasks);
  const hasTasks = tasks.length > 0;

  if (!block.startTime || !block.endTime) return null;

  const top = timeToPosition(block.startTime, hourHeight) - startHourOffset * hourHeight;
  const height = durationToHeight(block.startTime, block.endTime, hourHeight);
  const blockColor = block.color || "#3b82f6";
  const isDailySchedule = block.blockType === "daily_schedule";

  const getBackgroundStyle = () => {
    if (isHovered) {
      return { backgroundColor: hexToRgba(blockColor, 0.4) };
    }
    if (isDailySchedule) {
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(107, 114, 128, 0.25) 4px, rgba(107, 114, 128, 0.25) 5px)`,
        backgroundColor: "transparent",
      };
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
        right: isDailySchedule ? 0 : "4px",
        borderColor: isDailySchedule ? "hsl(var(--border))" : blockColor,
        borderWidth: "1px",
        borderStyle: "solid",
        transition: "background-color 0.2s ease",
      }}
      className={cn(
        "border p-1 text-xs cursor-pointer relative group",
        isDailySchedule ? "rounded-none bg-gray-200/80 dark:bg-gray-700/80" : "rounded-r-md",
        isHovered && "z-20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {isDailySchedule ? (
          <>
            <div className="font-medium truncate bg-background px-0.5 inline-block">{block.name}</div>
            {hasTasks && (
              <div className="mt-1 items-center gap-1 bg-background px-0.5 inline-flex">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: blockColor }} />
                <span className="text-xs opacity-75">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="font-medium truncate">{block.name}</div>
            {hasTasks && (
              <div className="mt-1 flex items-center gap-1">
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

export function RoutinesMockup() {
  const seedIndex = useMockSeed();
  const { routineBlocks, tasks } = getMockDataForSeed(seedIndex);

  // Group routine blocks by day of week
  const blocksByDay = useMemo(() => {
    const grouped: Record<number, MockRoutineBlock[]> = {};
    routineBlocks.forEach((block) => {
      if (block.dayOfWeek !== undefined) {
        if (!grouped[block.dayOfWeek]) {
          grouped[block.dayOfWeek] = [];
        }
        grouped[block.dayOfWeek].push(block);
      }
    });
    return grouped;
  }, [routineBlocks]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push(`${String(hour).padStart(2, "0")}:00`);
    }
    return slots;
  }, []);

  // Days of week (Monday to Friday for work week)
  const workDays = [1, 2, 3, 4, 5]; // Mon-Fri

  return (
    <ElectronWindow title="Routine Blocks" icon={<Clock className="h-3 w-3" />} className="w-full max-w-full">
      <div className="flex flex-col h-full overflow-hidden" style={{ maxHeight: "600px", height: "600px" }}>
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 py-3">
          <h1 className="text-base font-semibold">Weekly Routine Schedule</h1>
          <p className="text-xs text-muted-foreground mt-1">Template-based routines and daily schedules</p>
        </div>

        {/* Routine Blocks Grid */}
        <div className="flex-1 overflow-auto min-h-0">
          <div className="min-w-max h-full flex">
            {/* Time column */}
            <div className="w-[80px] border-r bg-muted/20 shrink-0">
              <div className="h-[40px] border-b"></div>
              <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * DEFAULT_HOUR_HEIGHT}px` }}>
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="absolute left-0 right-0 border-t border-dashed border-border/50"
                    style={{
                      top: `${timeToPosition(time, DEFAULT_HOUR_HEIGHT) - START_HOUR * DEFAULT_HOUR_HEIGHT}px`,
                      paddingLeft: "8px",
                      paddingTop: "2px",
                    }}
                  >
                    <span className="text-xs text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day columns */}
            {workDays.map((dayOfWeek) => {
              const blocks = blocksByDay[dayOfWeek] || [];
              return (
                <div
                  key={dayOfWeek}
                  className="w-[200px] border-r last:border-r-0 shrink-0 flex flex-col"
                >
                  {/* Day header */}
                  <div className="h-[40px] border-b bg-background flex items-center justify-center">
                    <span className="text-sm font-medium">{DAY_LABELS[dayOfWeek]}</span>
                  </div>

                  {/* Routine blocks */}
                  <div
                    className="relative flex-1 overflow-hidden"
                    style={{ height: `${(END_HOUR - START_HOUR) * DEFAULT_HOUR_HEIGHT}px` }}
                  >
                    {blocks.map((block) => (
                      <RoutineBlockItem
                        key={block._id}
                        block={block}
                        tasks={tasks}
                        hourHeight={DEFAULT_HOUR_HEIGHT}
                        startHourOffset={START_HOUR}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="border-t bg-muted/20 px-6 py-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border" style={{ backgroundColor: hexToRgba("#3b82f6", 0.2) }} />
              <span>Routine Block</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(59, 130, 246, 0.15) 2px,
                    rgba(59, 130, 246, 0.15) 3px
                  )`,
                }}
              />
              <span>Daily Schedule</span>
            </div>
          </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
