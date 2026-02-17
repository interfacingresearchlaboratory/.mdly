"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

interface FeaturesLinkProps {
  className?: string;
  children: React.ReactNode;
}

export function FeaturesLink({ className, children }: FeaturesLinkProps) {
  const pathname = usePathname();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const el = document.getElementById("features");
      if (pathname === "/" && el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [pathname]
  );

  return (
    <a
      href="/#features"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
