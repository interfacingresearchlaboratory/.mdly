"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { cn } from "@editor/ui/utils";
import { siteConfig } from "@/lib/site-config";

interface ElectronWindowProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  initialPosition?: { x: number; y: number };
  allowOutsideBounds?: boolean;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export function ElectronWindow({
  children,
  title = "Application",
  icon,
  className,
  initialPosition = { x: 0, y: 0 },
  allowOutsideBounds = true,
  onSidebarToggle,
  showSidebarToggle = false,
}: ElectronWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerOffset, setContainerOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (!windowRef.current) return;
    e.preventDefault();
    const rect = windowRef.current.getBoundingClientRect();
    const parent = windowRef.current.offsetParent as HTMLElement;
    
    setIsDragging(true);
    
    // Calculate container offset (where the window's parent container is)
    const containerRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };
    setContainerOffset({
      x: containerRect.left,
      y: containerRect.top,
    });
    
    // dragStart is the offset from where user clicked relative to the window
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTitleBarTouchStart = (e: React.TouchEvent) => {
    if (!windowRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = windowRef.current.getBoundingClientRect();
    const parent = windowRef.current.offsetParent as HTMLElement;
    
    setIsDragging(true);
    
    // Calculate container offset
    const containerRect = parent?.getBoundingClientRect() || { left: 0, top: 0 };
    setContainerOffset({
      x: containerRect.left,
      y: containerRect.top,
    });
    
    // dragStart is the offset from where user touched relative to the window
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!windowRef.current) return;
      
      // Calculate new position relative to container
      // Mouse position minus container offset minus drag start offset
      let newX = e.clientX - containerOffset.x - dragStart.x;
      let newY = e.clientY - containerOffset.y - dragStart.y;
      
      // If allowOutsideBounds is false, constrain within container
      if (!allowOutsideBounds) {
        const parent = windowRef.current.offsetParent as HTMLElement;
        if (parent) {
          const containerRect = parent.getBoundingClientRect();
          const windowRect = windowRef.current.getBoundingClientRect();
          const maxX = containerRect.width - windowRect.width;
          const maxY = containerRect.height - windowRect.height;
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
        }
      }
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!windowRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      
      // Calculate new position relative to container
      let newX = touch.clientX - containerOffset.x - dragStart.x;
      let newY = touch.clientY - containerOffset.y - dragStart.y;
      
      if (!allowOutsideBounds) {
        const parent = windowRef.current.offsetParent as HTMLElement;
        if (parent) {
          const containerRect = parent.getBoundingClientRect();
          const windowRect = windowRef.current.getBoundingClientRect();
          const maxX = containerRect.width - windowRect.width;
          const maxY = containerRect.height - windowRect.height;
          newX = Math.max(0, Math.min(newX, maxX));
          newY = Math.max(0, Math.min(newY, maxY));
        }
      }
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart, containerOffset, allowOutsideBounds]);

  return (
    <div
      ref={windowRef}
      className={cn(
        "relative bg-background rounded-lg border border-border overflow-hidden shadow-2xl",
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className={cn(
          "flex items-center justify-between px-3 h-8 bg-background border-0",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleTitleBarMouseDown}
        onTouchStart={handleTitleBarTouchStart}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-1.5">
          <button
            className="w-3 h-3 rounded-full bg-gray-400 hover:bg-gray-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label="Close"
          />
          <button
            className="w-3 h-3 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label="Minimize"
          />
          <button
            className="w-3 h-3 rounded-full bg-gray-400 hover:bg-gray-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label="Maximize"
          />
        </div>

        {/* Sidebar Toggle Button (Mobile Only) */}
        {showSidebarToggle && onSidebarToggle && (
          <button
            className="md:hidden flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onSidebarToggle();
            }}
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
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
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
