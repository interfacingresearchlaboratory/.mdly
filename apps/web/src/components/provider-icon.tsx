"use client";

import Image from "next/image";
import { cn } from "@editor/ui/utils";

function createProviderImgIcon(src: string) {
  return function ProviderImgIcon({ className }: { className?: string }) {
    return (
      <Image
        src={src}
        alt=""
        role="img"
        aria-hidden
        width={14}
        height={14}
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
