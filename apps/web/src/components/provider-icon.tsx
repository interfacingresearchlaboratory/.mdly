"use client";

import { cn } from "@editor/ui/utils";

function createProviderImgIcon(src: string) {
  return function ProviderImgIcon({ className }: { className?: string }) {
    return (
      <img
        src={src}
        alt=""
        role="img"
        aria-hidden
        className={cn("size-3.5 shrink-0", className)}
      />
    );
  };
}

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  notion: createProviderImgIcon("/providers/notion.svg"),
  github: createProviderImgIcon("/providers/github.svg"),
  linear: createProviderImgIcon("/providers/linear.svg"),
  airtable: createProviderImgIcon("/providers/airtable.svg"),
};

interface ProviderIconProps {
  provider: string;
  className?: string;
}

export function ProviderIcon({ provider, className }: ProviderIconProps) {
  const Icon = providerIcons[provider.toLowerCase()];
  if (Icon) return <Icon className={className} />;
  return (
    <span
      className={cn("inline-block size-3.5 shrink-0 rounded bg-muted font-bold text-[8px] leading-[14px] text-center uppercase text-muted-foreground", className)}
      aria-hidden
    >
      {provider.charAt(0)}
    </span>
  );
}
