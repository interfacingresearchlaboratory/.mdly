"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from "@editor/ui/context-menu";
import { cn } from "@editor/ui/utils";

export type TableCompactness = "compact" | "regular" | "relaxed";

const CELL_PADDING = {
  compact: "px-2 py-1.5",
  regular: "px-2 py-2",
  relaxed: "px-3 py-2.5",
} as const;

export interface IndexListTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
  cellClassName?: string;
}

export interface IndexListTableProps<T> {
  columns: IndexListTableColumn<T>[];
  rows: T[];
  getRowId: (item: T) => string;
  visibleProperties: Record<string, boolean>;
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSortChange: (columnKey: string) => void;
  onRowClick?: (item: T) => void;
  /** When set, rows are grouped by this key and group header rows are rendered. */
  groupBy?: (item: T) => string;
  getGroupLabel?: (groupKey: string) => string;
  /** When set together with groupBy, adds a second level of grouping (sub-groups). Both levels are collapsible. */
  subGroupBy?: (item: T) => string;
  getSubGroupLabel?: (subKey: string) => string;
  compactness?: TableCompactness;
  className?: string;
  /** When set, each row is wrapped in a context menu with this content. */
  renderContextMenu?: (item: T) => ReactNode;
}

export function IndexListTable<T>({
  columns,
  rows,
  getRowId,
  visibleProperties,
  sortColumn,
  sortDirection,
  onSortChange,
  onRowClick,
  groupBy,
  getGroupLabel,
  subGroupBy,
  getSubGroupLabel,
  compactness = "regular",
  className,
  renderContextMenu,
}: IndexListTableProps<T>) {
  const padding = CELL_PADDING[compactness];
  const visibleColumns = columns.filter((col) => visibleProperties[col.key] !== false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const handleGroupHeaderKeyDown = (e: React.KeyboardEvent, groupKey: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleGroup(groupKey);
    }
  };

  const handleHeaderClick = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (col?.sortable) onSortChange(key);
  };

  const hasSubGrouping = groupBy && subGroupBy;

  const groupedRows = groupBy
    ? rows.reduce<{ groupKey: string; items: T[] }[]>((acc, item) => {
        const key = groupBy(item);
        const existing = acc.find((g) => g.groupKey === key);
        if (existing) existing.items.push(item);
        else acc.push({ groupKey: key, items: [item] });
        return acc;
      }, [])
    : null;

  type SubGroup = { subKey: string; items: T[] };
  const groupedRowsWithSub =
    groupedRows && hasSubGrouping && subGroupBy
      ? groupedRows.map(({ groupKey, items }) => {
          const subMap = new Map<string, T[]>();
          const subOrder: string[] = [];
          items.forEach((item) => {
            const subKey = subGroupBy(item);
            if (!subMap.has(subKey)) {
              subOrder.push(subKey);
              subMap.set(subKey, []);
            }
            subMap.get(subKey)!.push(item);
          });
          const subGroups: SubGroup[] = subOrder.map((subKey) => ({
            subKey,
            items: subMap.get(subKey)!,
          }));
          return { groupKey, subGroups };
        })
      : null;

  const renderRow = (item: T) => {
    const row = (
      <tr
        key={getRowId(item)}
        onClick={onRowClick ? () => onRowClick(item) : undefined}
        className={cn(
          "border-t transition-colors",
          onRowClick && "cursor-pointer hover:bg-muted/30"
        )}
      >
        {visibleColumns.map((col, i) => (
          <td
            key={col.key}
            className={cn(
              "text-sm",
              padding,
              i === 0 && "pl-6",
              i === visibleColumns.length - 1 && "pr-6",
              col.cellClassName
            )}
          >
            {col.render(item)}
          </td>
        ))}
      </tr>
    );
    return renderContextMenu ? (
      <ContextMenu key={getRowId(item)}>
        <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
        <ContextMenuContent>{renderContextMenu(item)}</ContextMenuContent>
      </ContextMenu>
    ) : (
      <React.Fragment key={getRowId(item)}>{row}</React.Fragment>
    );
  };

  const bodyContent = groupedRowsWithSub ? (
    groupedRowsWithSub.map(({ groupKey, subGroups }) => {
      const primaryExpanded = !collapsedGroups.has(groupKey);
      return (
        <React.Fragment key={groupKey}>
          <tr
            role="button"
            tabIndex={0}
            className="border-t border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => toggleGroup(groupKey)}
            onKeyDown={(e) => handleGroupHeaderKeyDown(e, groupKey)}
          >
            <td
              colSpan={visibleColumns.length}
              className={cn("font-semibold capitalize text-sm", padding, "pl-6 pr-6")}
            >
              <span className="inline-flex items-center gap-2">
                {primaryExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                {getGroupLabel ? getGroupLabel(groupKey) : groupKey || "—"}
              </span>
            </td>
          </tr>
          {primaryExpanded &&
            subGroups.map(({ subKey, items }) => {
              const compositeKey = `${groupKey}|${subKey}`;
              const subExpanded = !collapsedGroups.has(compositeKey);
              return (
                <React.Fragment key={compositeKey}>
                  <tr
                    role="button"
                    tabIndex={0}
                    className="border-t border-border bg-muted/60 cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={() => toggleGroup(compositeKey)}
                    onKeyDown={(e) => handleGroupHeaderKeyDown(e, compositeKey)}
                  >
                    <td
                      colSpan={visibleColumns.length}
                      className={cn(
                        "text-muted-foreground text-xs font-medium",
                        padding,
                        "pl-10 pr-6"
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        {subExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {getSubGroupLabel ? getSubGroupLabel(subKey) : subKey || "—"}
                      </span>
                    </td>
                  </tr>
                  {subExpanded && items.map((item) => renderRow(item))}
                </React.Fragment>
              );
            })}
        </React.Fragment>
      );
    })
  ) : groupedRows ? (
    groupedRows.map(({ groupKey, items }) => {
      const isExpanded = !collapsedGroups.has(groupKey);
      return (
        <React.Fragment key={groupKey}>
          <tr
            role="button"
            tabIndex={0}
            className="border-t border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={() => toggleGroup(groupKey)}
            onKeyDown={(e) => handleGroupHeaderKeyDown(e, groupKey)}
          >
            <td
              colSpan={visibleColumns.length}
              className={cn("font-semibold capitalize text-sm", padding, "pl-6 pr-6")}
            >
              <span className="inline-flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                {getGroupLabel ? getGroupLabel(groupKey) : groupKey || "—"}
              </span>
            </td>
          </tr>
          {isExpanded && items.map((item) => renderRow(item))}
        </React.Fragment>
      );
    })
  ) : (
    rows.map((item) => renderRow(item))
  );

  return (
    <div className={cn("overflow-hidden", className)}>
      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            {visibleColumns.map((col, i) => (
              <th
                key={col.key}
                className={cn(
                  "text-left font-medium text-sm text-muted-foreground",
                  padding,
                  i === 0 && "pl-6",
                  i === visibleColumns.length - 1 && "pr-6",
                  col.sortable && "cursor-pointer select-none hover:text-foreground"
                )}
                onClick={() => handleHeaderClick(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortColumn === col.key && (
                    sortDirection === "asc" ? (
                      <ArrowUpNarrowWide className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ArrowDownNarrowWide className="h-3.5 w-3.5 shrink-0" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{bodyContent}</tbody>
      </table>
    </div>
  );
}
