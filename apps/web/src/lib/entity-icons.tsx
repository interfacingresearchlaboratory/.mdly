import type { ComponentType } from "react";
import { Home, Settings } from "lucide-react";
import { EntityIcon } from "@/components/shared/entity-icon";

type EntityIconType = "home" | "project" | "review" | "task" | "category" | "container" | "settings";

export function getEntityIconOrNull(
  icon?: EntityIconType | ComponentType<{ className?: string }>
): ComponentType<{ className?: string }> | null {
  if (!icon) return null;
  
  // If it's a custom component, return it as-is
  if (typeof icon === "function") {
    return icon;
  }

  // Map icon types to components
  switch (icon) {
    case "home":
      return Home;
    case "project":
      return ({ className }) => (
        <EntityIcon entityType="project" className={className} />
      );
    case "review":
      return ({ className }) => (
        <EntityIcon entityType="review" className={className} />
      );
    case "task":
      return ({ className }) => (
        <EntityIcon entityType="task" className={className} />
      );
    case "category":
      return ({ className }) => (
        <EntityIcon entityType="category" className={className} />
      );
    case "container":
      return ({ className }) => (
        <EntityIcon entityType="container" className={className} />
      );
    case "settings":
      return Settings;
    default:
      return null;
  }
}
