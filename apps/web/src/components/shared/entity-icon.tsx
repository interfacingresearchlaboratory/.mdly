import { Layers, SquareSlash, ClockCheck, Folder, Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@editor/ui/utils";

type EntityType = "project" | "task" | "review" | "category" | "container";

interface EntityIconProps {
  entityType: EntityType;
  className?: string;
  strokeWidth?: number;
}

const entityIconMap: Record<EntityType, LucideIcon> = {
  project: Layers,
  task: SquareSlash,
  review: ClockCheck,
  category: Folder,
  container: Box,
};

export function EntityIcon({
  entityType,
  className,
  strokeWidth = 1.5,
}: EntityIconProps) {
  const Icon = entityIconMap[entityType];

  return <Icon className={cn(className)} strokeWidth={strokeWidth} />;
}
