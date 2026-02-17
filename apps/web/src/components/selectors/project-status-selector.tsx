"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import { cn } from "@editor/ui/utils";
import {
  PlayCircle,
  PauseCircle,
  CircleCheck,
  CircleDashed,
  XCircle,
} from "lucide-react";

export type ProjectStatus = "active" | "paused" | "done" | "backlog" | "cancelled";

export const projectStatusConfig: Record<
  ProjectStatus,
  { label: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    icon: <PlayCircle className="h-4 w-4" />,
  },
  paused: {
    label: "Paused",
    icon: <PauseCircle className="h-4 w-4" />,
  },
  done: {
    label: "Done",
    icon: <CircleCheck className="h-4 w-4" />,
  },
  backlog: {
    label: "Backlog",
    icon: <CircleDashed className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
  },
};

interface ProjectStatusSelectorProps {
  value: ProjectStatus | null;
  onChange: (value: ProjectStatus | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  withBackground?: boolean;
}

export function ProjectStatusSelector({
  value,
  onChange,
  placeholder = "Status",
  disabled = false,
  className,
  withBackground = false,
}: ProjectStatusSelectorProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onChange(val as ProjectStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          withBackground &&
            "w-fit border-none bg-muted/50 hover:bg-muted shadow-none text-muted-foreground [&_svg]:text-muted-foreground",
          className
        )}
      >
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              {projectStatusConfig[value].icon}
              <span>{projectStatusConfig[value].label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(["backlog", "active", "done", "paused", "cancelled"] as ProjectStatus[]).map((status) => {
          const config = projectStatusConfig[status];
          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                {config.icon}
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
