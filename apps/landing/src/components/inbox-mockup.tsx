"use client";

import { Inbox } from "lucide-react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@editor/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { ElectronWindow } from "./electron-window";
import { ProviderIcon } from "./provider-icon";
import { mockTasks, type MockTask } from "@/lib/mock-data";

const INBOX_TASK_IDS = [
  "task-shape-marketing",
  "task-todo-marketing",
  "task-3",
  "task-todo-admin",
  "task-todo-unlinked",
  "task-4",
  "task-1",
  "task-2",
  "task-shape-admin",
  "task-todo-dev",
  "task-todo-marketing-2",
  "task-todo-admin-2",
  "task-5",
  "task-shape-unlinked",
  "task-6",
  "task-7",
];

const inboxTasks = INBOX_TASK_IDS
  .map((id) => mockTasks.find((t) => t._id === id))
  .filter((t): t is MockTask => t != null);

function InboxTaskRow({ task }: { task: MockTask }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="min-w-0 px-2 py-1.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate min-w-0">{task.title}</span>
          <div className="flex items-center gap-1 shrink-0">
            {task.linearIssueId && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] bg-muted/50 text-muted-foreground whitespace-nowrap">
                <ProviderIcon provider="linear" className="h-2 w-2 opacity-50" />
                {task.linearIssueIdentifier ?? task.linearIssueId}
              </span>
            )}
            {task.notionPageId && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] bg-muted/50 text-muted-foreground whitespace-nowrap">
                <ProviderIcon provider="notion" className="h-2 w-2 opacity-50" />
                {task.notionPageTitle ?? "N"}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-1.5 whitespace-nowrap w-20">
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-4 w-4 p-0 bg-green-600 hover:bg-green-700"
                onClick={(e) => e.preventDefault()}
              >
                <Check className="h-2 w-2" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Schedule for this week
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-4 w-4 p-0"
                onClick={(e) => e.preventDefault()}
              >
                <ChevronRight className="h-2 w-2" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Schedule for next week
            </TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

export function InboxMockup() {
  return (
    <div className="w-full h-full flex items-stretch justify-center pt-3 px-3 md:pt-4 md:px-4 pb-0 translate-y-8 md:translate-y-12">
      <ElectronWindow title="My Inbox" icon={<Inbox className="h-3 w-3" />} className="w-full max-w-[92%] h-full min-h-0 shrink-0 rounded-t-lg rounded-b-none">
        <div className="flex flex-col h-full min-h-0 overflow-hidden border-t">
          <div className="flex-1 overflow-y-auto">
          <TooltipProvider>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-border">
                <th className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground text-left bg-muted/50 backdrop-blur-sm">
                  Task
                </th>
                <th className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground w-20 bg-muted/50 backdrop-blur-sm">
                  Schedule
                </th>
              </tr>
            </thead>
            <tbody>
              {inboxTasks.map((task) => (
                <InboxTaskRow key={task._id} task={task} />
              ))}
            </tbody>
          </table>
          </TooltipProvider>
          </div>
        </div>
      </ElectronWindow>
    </div>
  );
}
