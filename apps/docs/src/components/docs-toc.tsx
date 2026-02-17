"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@editor/ui/utils";

interface DocsTOCProps {
  toc?: any[];
  className?: string;
}

export function DocsTOC({ toc, className }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    // Track all observed elements
    const observedElements = new Map<string, HTMLElement>();

    // Build a map of IDs to elements
    toc.forEach((item) => {
      const url = item.url || item.href || `#${item.id || item.slug || ""}`;
      const id = item.id || item.slug || (url.startsWith("#") ? url.slice(1) : url.split("#")[1] || "");
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          observedElements.set(id, element);
        }
      }
    });

    // Function to find the heading closest to the top of the viewport
    const findActiveHeading = () => {
      const scrollPosition = window.scrollY + 100; // Offset for header
      let activeElement: HTMLElement | null = null;
      let minDistance = Infinity;

      // First pass: find headings above or at the scroll position
      for (const element of observedElements.values()) {
        const rect = element.getBoundingClientRect();
        const elementTop = window.scrollY + rect.top;
        const distance = Math.abs(elementTop - scrollPosition);

        // Prefer headings that are above or at the scroll position
        if (elementTop <= scrollPosition + 50 && distance < minDistance) {
          minDistance = distance;
          activeElement = element;
        }
      }

      // Second pass: if no heading is above the scroll position, find the first one below
      if (activeElement === null) {
        minDistance = Infinity;
        for (const element of observedElements.values()) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;
          const distance = elementTop - scrollPosition;

          if (distance >= 0 && distance < minDistance) {
            minDistance = distance;
            activeElement = element;
          }
        }
      }

      if (activeElement && activeElement.id) {
        setActiveId(activeElement.id);
      }
    };

    // Initial check
    findActiveHeading();

    // Use IntersectionObserver for better performance
    const observerOptions = {
      rootMargin: "-100px 0% -60% 0%", // Trigger when heading is near top
      threshold: [0, 0.1, 0.5, 1],
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the entry that's closest to the top
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Sort by distance from top of viewport
        visibleEntries.sort((a, b) => {
          const aTop = a.boundingClientRect.top;
          const bTop = b.boundingClientRect.top;
          // Prefer entries that are above or near the top
          if (aTop <= 150 && bTop <= 150) {
            return Math.abs(aTop - 100) - Math.abs(bTop - 100);
          }
          return aTop - bTop;
        });

        const closestEntry = visibleEntries[0];
        if (closestEntry && closestEntry.target.id) {
          setActiveId(closestEntry.target.id);
        }
      } else {
        // Fallback to manual calculation if nothing is intersecting
        findActiveHeading();
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all headings
    observedElements.forEach((element) => {
      observer.observe(element);
    });

    // Also listen to scroll events as a fallback
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        findActiveHeading();
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [toc]);

  if (!toc || toc.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "hidden lg:block sticky top-14 self-start w-64 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-6 pt-4 pb-6 text-sm border-l",
        className
      )}
    >
      <h2 className="font-medium text-sm mb-4 text-muted-foreground uppercase tracking-wide">
        On this page
      </h2>
      <nav className="space-y-1">
        {toc.map((item, index) => {
          // Handle different possible TOC structures from fumadocs
          const title = item.title || item.text || item.name || "";
          const url = item.url || item.href || `#${item.id || item.slug || ""}`;
          // Extract ID from various possible sources
          const itemId = item.id || item.slug || (url.startsWith("#") ? url.slice(1) : url.split("#")[1] || "");
          // Fumadocs uses depth property: h1 = 1, h2 = 2, h3 = 3, etc.
          const depth = item.depth ?? item.level ?? 2;

          if (!title) return null;

          // Calculate padding based on depth
          // h1 (depth 1): 0px
          // h2 (depth 2): 0px (base level)
          // h3 (depth 3): 16px (1rem)
          // h4 (depth 4): 32px (2rem)
          // h5 (depth 5): 48px (3rem)
          // h6 (depth 6+): 64px (4rem)
          const paddingLeft = depth <= 2 ? 0 : (depth - 2) * 16;

          // Get font weight based on depth (same font size for all)
          const getFontWeight = (d: number) => {
            if (d === 1) return "font-medium";
            if (d === 2) return "font-medium";
            return "";
          };

          const isActive = activeId === itemId;

          const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            // Only handle anchor links for smooth scrolling
            if (url.startsWith("#")) {
              e.preventDefault();
              const id = url.slice(1);
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                // Update URL without triggering navigation
                window.history.pushState(null, "", url);
              }
            }
          };

          return (
            <Link
              key={index}
              href={url}
              onClick={handleClick}
              className={cn(
                "block py-1 text-sm transition-colors",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
                getFontWeight(depth)
              )}
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              {title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
