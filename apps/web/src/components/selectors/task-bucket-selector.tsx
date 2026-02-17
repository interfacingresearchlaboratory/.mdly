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
  taskBucketConfig,
  type TaskBucket,
} from "@/lib/task-bucket-config";

interface TaskBucketSelectorProps {
  value: TaskBucket | null;
  onChange: (value: TaskBucket | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  withBackground?: boolean;
}

const BUCKET_ORDER: TaskBucket[] = [
  "backlog",
  "shaping",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];

export function TaskBucketSelector({
  value,
  onChange,
  placeholder = "Bucket",
  disabled = false,
  className,
  withBackground = false,
}: TaskBucketSelectorProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onChange(val as TaskBucket)}
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
              {taskBucketConfig[value].icon}
              <span>{taskBucketConfig[value].label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {BUCKET_ORDER.map((bucket) => {
          const config = taskBucketConfig[bucket];
          return (
            <SelectItem key={bucket} value={bucket}>
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
