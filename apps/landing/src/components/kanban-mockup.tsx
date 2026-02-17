"use client";

import { useState } from "react";
import { Columns } from "lucide-react";
import { ElectronWindow } from "./electron-window";
import { cn } from "@editor/ui/utils";
import { Badge } from "@editor/ui/badge";
import {
  mockTasks,
  getProjectById,
  getCategoryById,
  getContainerById,
  type MockTask,
} from "@/lib/mock-data";

const BUCKET_COLUMNS = [
  { id: "backlog", label: "Backlog" },
  { id: "shaping", label: "Shaping" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "In Progress" },
  { id: "in_review", label: "In Review" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
] as const;

function TaskCard({ task }: { task: MockTask }) {
  const [isHovered, setIsHovered] = useState(false);
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const category = task.categoryId ? getCategoryById(task.categoryId) : undefined;
  const container = task.containerId ? getContainerById(task.containerId) : undefined;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border bg-background cursor-pointer transition-all",
        isHovered && "shadow-md border-primary/50 bg-accent"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-2">
        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
        {task.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.notes}</p>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          {project && (
            <Badge variant="outline" className="text-xs">
              {project.title}
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          )}
          {task.linearIssueId && (
            <Badge variant="outline" className="text-xs">
              {task.linearIssueIdentifier || task.linearIssueId}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanMockup() {
  // Group tasks by bucket
  const tasksByBucket = BUCKET_COLUMNS.reduce((acc, column) => {
    acc[column.id] = mockTasks.filter((task) => task.bucket === column.id);
    return acc;
  }, {} as Record<string, MockTask[]>);

  return (
    <ElectronWindow title="Kanban Board" icon={<Columns className="h-3 w-3" />} className="w-full max-w-full">
      <div className="flex flex-col h-full overflow-hidden" style={{ maxHeight: "600px", height: "600px" }}>
        {/* Header */}
        <div className="border-b bg-muted/30 px-6 py-3">
          <h1 className="text-base font-semibold">Kanban Board</h1>
        </div>

        {/* Kanban Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-w-max">
            {BUCKET_COLUMNS.map((column) => {
              const tasks = tasksByBucket[column.id] || [];
              return (
                <div
                  key={column.id}
                  className="w-[280px] shrink-0 border-r last:border-r-0 flex flex-col bg-muted/20"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b bg-background">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{column.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {tasks.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {tasks.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-8">
                        No tasks
                      </div>
                    ) : (
                      tasks.map((task) => <TaskCard key={task._id} task={task} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
