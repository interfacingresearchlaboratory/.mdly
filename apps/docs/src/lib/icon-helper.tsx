import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Provider icons served as static SVGs from /providers/ */
const providerIcons: Record<string, string> = {
  notion: "/providers/notion.svg",
  linear: "/providers/linear.svg",
};

interface IconProps {
  name?: string;
  className?: string;
}

export function DynamicIcon({ name, className }: IconProps) {
  if (!name) return null;

  // Check for provider/brand icons first
  const providerSrc = providerIcons[name.toLowerCase()];
  if (providerSrc) {
    return (
      <img
        src={providerSrc}
        alt=""
        role="img"
        aria-hidden
        className={`${className ?? ""} opacity-60 dark:invert`}
      />
    );
  }

  // First try the name as-is (in case it's already PascalCase)
  let iconName = name;
  
  // If it contains hyphens, convert from kebab-case to PascalCase
  if (name.includes("-")) {
    iconName = name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  } else {
    // If it's already PascalCase, use it directly
    iconName = name;
  }

  // Get the icon component from lucide-react
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName] as LucideIcon | undefined;

  if (!IconComponent) {
    // Fallback to a default icon if not found
    const DefaultIcon = Icons.FileText;
    return <DefaultIcon className={className} />;
  }

  return <IconComponent className={className} />;
}
