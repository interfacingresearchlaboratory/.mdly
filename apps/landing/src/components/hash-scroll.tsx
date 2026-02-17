"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash || pathname !== "/") return;

    const scrollToEl = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    if (scrollToEl()) return;
    const timers = [100, 300, 600].map((ms) => setTimeout(scrollToEl, ms));
    return () => timers.forEach((t) => clearTimeout(t));
  }, [pathname]);

  return null;
}
