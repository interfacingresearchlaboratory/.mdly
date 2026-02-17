"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import { cn } from "@editor/ui/utils";

export type ReviewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

interface ReviewTypeSelectorProps {
  value: ReviewType | null;
  onChange: (value: ReviewType | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  withBackground?: boolean;
}

export function ReviewTypeSelector({
  value,
  onChange,
  placeholder = "Review Type",
  disabled = false,
  className,
  withBackground = false,
}: ReviewTypeSelectorProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onChange(val as ReviewType)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          withBackground && "border-none bg-muted/50 hover:bg-muted shadow-none",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
        <SelectItem value="quarterly">Quarterly</SelectItem>
        <SelectItem value="annual">Annual</SelectItem>
      </SelectContent>
    </Select>
  );
}
