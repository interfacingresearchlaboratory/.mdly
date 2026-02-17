"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Client component that handles smooth scrolling for anchor links
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Handle smooth scrolling for anchor links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (!link) return;

      const href = link.getAttribute("href");
      
      // Only handle anchor links (starting with #)
      if (href && href.startsWith("#")) {
        const id = href.slice(1);
        const element = document.getElementById(id);
        
        if (element) {
          e.preventDefault();
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  // Handle hash links on page load/navigation
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [pathname]);

  return null;
}
