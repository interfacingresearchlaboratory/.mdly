"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { cn } from "@editor/ui/utils";
import { siteConfig } from "./site-config";

interface ElectronWindowProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export function ElectronWindow({
  children,
  title = "Application",
  icon,
  className,
  onSidebarToggle,
  showSidebarToggle = false,
}: ElectronWindowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative bg-background rounded-lg border border-border overflow-hidden shadow-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 h-8 bg-background border-0">
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="w-3 h-3 rounded-full bg-gray-400" />
        </div>

        {/* Sidebar Toggle Button (Mobile Only) */}
        {showSidebarToggle && onSidebarToggle && (
          <button
            className="md:hidden flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
          {icon && (
            <span className="text-xs text-muted-foreground select-none shrink-0">
              {icon}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium select-none truncate max-w-[150px] md:max-w-[300px]">
            {title}
          </span>
        </div>

        <div className="w-[52px] flex items-center justify-end">
          {isHovered && (
            <Link
              href={siteConfig.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs !text-[#0101fd] hover:!opacity-70 transition-colors duration-200 px-1.5 py-0.5 rounded whitespace-nowrap flex items-center gap-1"
              style={{ textDecoration: 'none', color: 'rgb(249 115 22)' }}
            >
              Get MONOid
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100% - 2rem)', maxHeight: 'calc(100% - 2rem)' }}>{children}</div>
    </div>
  );
}
