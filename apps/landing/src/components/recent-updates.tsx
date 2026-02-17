"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";
import { RecentUpdateItem } from "./recent-update-item";

interface ChangelogEntry {
  date: string;
  version?: string;
  tags?: string[];
  title: string;
  url: string;
  description?: string;
}

export function RecentUpdates() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const response = await fetch("/api/changelog?limit=4");
        if (response.ok) {
          const loadedEntries = await response.json();

          // Ensure we have an array
          if (Array.isArray(loadedEntries)) {
            setEntries(loadedEntries);
          } else {
            setEntries([]);
          }
        }
      } catch (error) {
        console.warn("Failed to load changelog entries:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  if (loading) {
    return null;
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8">
      <div className="p-2 md:p-10">
        <div className="text-5xl md:text-6xl font-base text-[#0101fd] mb-4">
          Recent Updates
        </div>
        <Link
          href={siteConfig.changelogUrl}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          Check out what&apos;s new in MONOid
          <span className="text-lg">→</span>
        </Link>
      </div>
      <div className="min-w-0">
        <div className="flex flex-col divide-y divide-border">
          {entries.map((entry) => {
            const date = new Date(entry.date);
            const formattedDate = formatDate(date);

            return (
              <RecentUpdateItem
                key={entry.url}
                title={entry.title}
                date={formattedDate}
                version={entry.version}
                description={entry.description}
                href={`${siteConfig.changelogUrl}#${entry.date}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
