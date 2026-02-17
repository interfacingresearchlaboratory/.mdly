"use client";

import { useState } from "react";
import { TrendingUp, Info, Binoculars, Calendar } from "lucide-react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@editor/ui/tooltip";
import { Checkbox as UICheckbox } from "@editor/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@editor/ui/select";
import { ElectronWindow } from "./electron-window";

// Currency formatting function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Mock data
const accountItems = [
  { _id: "1", name: "Operating Account", account: 175000 },
  { _id: "2", name: "Savings Account", account: 75000 },
];

const assets = [
  { _id: "1", name: "MacBook Pro 16\" M3 Max", cost: 17495 },
  { _id: "2", name: "iPad Pro 12.9\"", cost: 5495 },
  { _id: "3", name: "Wacom Intuos Pro", cost: 1750 },
  { _id: "4", name: "4K Monitor", cost: 4000 },
  { _id: "5", name: "Studio headphones", cost: 1250 },
];

const scouts = [
  { _id: "1", name: "New Studio/Office", estimatedCost: 90000 },
  { _id: "2", name: "Apple Studio Display", estimatedCost: 7995 },
  { _id: "3", name: "Ergonomic standing desk", estimatedCost: 4000 },
  { _id: "4", name: "Wacom Cintiq Pro 24", estimatedCost: 9995 },
  { _id: "5", name: "Color calibration tool", estimatedCost: 1250 },
  { _id: "6", name: "Design reference books", estimatedCost: 750 },
];

const totalAccountValue = accountItems.reduce((sum, item) => sum + (item.account || 0), 0);
const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.cost || 0), 0);
const totalScoutingValue = scouts.reduce((sum, scout) => sum + (scout.estimatedCost || 0), 0);

// Chart data - trending upwards with variations from scout investments
const chartData = [
  { month: "Jan 2024", balance: 250000, isNegative: false },
  { month: "Feb 2024", balance: 265000, isNegative: false }, // Income
  { month: "Mar 2024", balance: 255000, isNegative: false }, // Scout purchase (Apple Studio Display)
  { month: "Apr 2024", balance: 270000, isNegative: false }, // Income
  { month: "May 2024", balance: 285000, isNegative: false }, // Income
  { month: "Jun 2024", balance: 195000, isNegative: false }, // Large scout purchase (New Office)
  { month: "Jul 2024", balance: 210000, isNegative: false }, // Income
  { month: "Aug 2024", balance: 225000, isNegative: false }, // Income
  { month: "Sep 2024", balance: 215000, isNegative: false }, // Scout purchase (Wacom Cintiq)
  { month: "Oct 2024", balance: 230000, isNegative: false }, // Income
  { month: "Nov 2024", balance: 245000, isNegative: false }, // Income
  { month: "Dec 2024", balance: 260000, isNegative: false }, // Income
  { month: "Jan 2025", balance: 275000, isNegative: false }, // Income
  { month: "Feb 2025", balance: 265000, isNegative: false }, // Scout purchase
  { month: "Mar 2025", balance: 280000, isNegative: false }, // Income
  { month: "Apr 2025", balance: 295000, isNegative: false }, // Income
  { month: "May 2025", balance: 310000, isNegative: false }, // Income
  { month: "Jun 2025", balance: 300000, isNegative: false }, // Scout purchase
  { month: "Jul 2025", balance: 315000, isNegative: false }, // Income
  { month: "Aug 2025", balance: 330000, isNegative: false }, // Income
  { month: "Sep 2025", balance: 320000, isNegative: false }, // Scout purchase
  { month: "Oct 2025", balance: 335000, isNegative: false }, // Income
  { month: "Nov 2025", balance: 350000, isNegative: false }, // Income
  { month: "Dec 2025", balance: 365000, isNegative: false }, // Income
];

const monthsWithScouts = new Set(["Mar 2024", "Jun 2024", "Sep 2024", "Feb 2025", "Jun 2025", "Sep 2025"]);
const monthsWithEvents = new Set(["Feb 2024", "Apr 2024", "May 2024", "Jul 2024", "Aug 2024", "Oct 2024", "Nov 2024", "Dec 2024", "Jan 2025", "Mar 2025", "Apr 2025", "May 2025", "Jul 2025", "Aug 2025", "Oct 2025", "Nov 2025", "Dec 2025"]);

// Month breakdown data - trending upwards with scout investments causing variations
const monthBreakdown = [
  { month: "Jan 2024", burn: -2000, change: -2000, balance: 50000, scouts: [], singleEvents: [] },
  { month: "Feb 2024", burn: -2000, change: 5000, balance: 53000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Mar 2024", burn: -2000, change: -2000, balance: 51000, scouts: [{ name: "Apple Studio Display", estimatedCost: 1599 }], singleEvents: [] }, // Scout purchase
  { month: "Apr 2024", burn: -2000, change: 5000, balance: 54000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "May 2024", burn: -2000, change: 5000, balance: 57000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Jun 2024", burn: -2000, change: -18000, balance: 39000, scouts: [{ name: "New Studio/Office", estimatedCost: 18000 }], singleEvents: [] }, // Large scout purchase
  { month: "Jul 2024", burn: -2000, change: 5000, balance: 42000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Aug 2024", burn: -2000, change: 5000, balance: 45000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Sep 2024", burn: -2000, change: -2000, balance: 43000, scouts: [{ name: "Wacom Cintiq Pro 24", estimatedCost: 1999 }], singleEvents: [] }, // Scout purchase
  { month: "Oct 2024", burn: -2000, change: 5000, balance: 46000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Nov 2024", burn: -2000, change: 5000, balance: 49000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Dec 2024", burn: -2000, change: 5000, balance: 52000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Jan 2025", burn: -2000, change: 5000, balance: 55000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Feb 2025", burn: -2000, change: -2000, balance: 53000, scouts: [{ name: "Ergonomic standing desk", estimatedCost: 800 }], singleEvents: [] }, // Scout purchase
  { month: "Mar 2025", burn: -2000, change: 5000, balance: 56000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Apr 2025", burn: -2000, change: 5000, balance: 59000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "May 2025", burn: -2000, change: 5000, balance: 62000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Jun 2025", burn: -2000, change: -2000, balance: 60000, scouts: [{ name: "Color calibration tool", estimatedCost: 250 }], singleEvents: [] }, // Scout purchase
  { month: "Jul 2025", burn: -2000, change: 5000, balance: 63000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Aug 2025", burn: -2000, change: 5000, balance: 66000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Sep 2025", burn: -2000, change: -2000, balance: 64000, scouts: [{ name: "Design reference books", estimatedCost: 150 }], singleEvents: [] }, // Scout purchase
  { month: "Oct 2025", burn: -2000, change: 5000, balance: 67000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
  { month: "Nov 2025", burn: -2000, change: 5000, balance: 70000, scouts: [], singleEvents: [{ name: "Revenue", totalValue: 7000 }] }, // Income
  { month: "Dec 2025", burn: -2000, change: 5000, balance: 73000, scouts: [], singleEvents: [{ name: "Client Payment", totalValue: 7000 }] }, // Income
];

const scoutingDistribution = [
  { name: "Design Studio", value: 40000, count: 5 },
  { name: "Office Setup", value: 25000, count: 3 },
  { name: "Workshop", value: 10000, count: 2 },
];

const assetDistribution = [
  { name: "Design Studio", value: 60000, count: 8 },
  { name: "Office Setup", value: 40000, count: 5 },
  { name: "Workshop", value: 25000, count: 3 },
];

// Mock recurs
const recurs = [
  { _id: "1", name: "Operating Expenses", monthlyTotal: -10000, selected: true, dateRange: "Ongoing" },
  { _id: "2", name: "Marketing Budget", monthlyTotal: -7500, selected: true, dateRange: "01/01/24-Present" },
  { _id: "3", name: "Development Costs", monthlyTotal: -15000, selected: false, dateRange: "Ongoing" },
];


// Chart colors
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

// Custom tooltip for line chart - will be recreated with filtered data
function createLineChartTooltip(monthBreakdownData: any[]) {
  return function LineChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload?: any; value?: number }>; label?: string }) {
    if (active && payload && payload.length) {
      const monthBreakdownItem = monthBreakdownData.find((d: any) => d.month === label);
      const scouts = monthBreakdownItem?.scouts || [];
      const singleEvents = monthBreakdownItem?.singleEvents || [];
      
      return (
        <div className="rounded-lg border bg-background p-3 shadow-sm space-y-2">
          <div className="text-xs font-semibold">{label || "Month"}</div>
          <div className="text-sm font-semibold">Balance: {formatCurrency(payload[0]?.value || 0)}</div>
          {scouts.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Scouts:</div>
              {scouts.map((scout: any, idx: number) => (
                <div key={idx} className="text-xs flex items-center gap-2">
                  <Binoculars className="h-3 w-3 text-muted-foreground" />
                  <span>{scout.name}</span>
                  <span className="text-muted-foreground">({formatCurrency(scout.estimatedCost)})</span>
                </div>
              ))}
            </div>
          )}
          {singleEvents.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Events:</div>
              {singleEvents.map((event: any, idx: number) => (
                <div key={idx} className="text-xs flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{event.name}</span>
                  <span className="text-muted-foreground">({formatCurrency(event.totalValue)})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };
}

// Custom tooltip for pie charts
function PieChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const entry = data.payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.fill }}
          />
          <span className="text-xs font-medium">{entry.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Value: <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function ProjectionsPageMockup() {
  const [projectionPeriod, setProjectionPeriod] = useState("12 months");
  const [runwayDisplayUnit, setRunwayDisplayUnit] = useState<"months" | "years">("months");
  
  // Calculate runway (mock calculation - in real app this comes from projection data)
  const runwayValue = runwayDisplayUnit === "years" ? "1.75" : "21";
  
  // Filter chart data and month breakdown based on selected period
  const monthsToShow = projectionPeriod === "6 months" ? 6 : projectionPeriod === "12 months" ? 12 : 24;
  const filteredChartData = chartData.slice(0, monthsToShow);
  const filteredMonthBreakdown = monthBreakdown.slice(0, monthsToShow);
  // Only include months that actually have scouts or events in the filtered breakdown
  const filteredMonthsWithScouts = new Set(
    filteredMonthBreakdown
      .filter(month => month.scouts && month.scouts.length > 0)
      .map(month => month.month)
  );
  const filteredMonthsWithEvents = new Set(
    filteredMonthBreakdown
      .filter(month => month.singleEvents && month.singleEvents.length > 0)
      .map(month => month.month)
  );
  
  // Create tooltip with filtered month breakdown
  const LineChartTooltip = createLineChartTooltip(filteredMonthBreakdown);

  return (
    <ElectronWindow
      title="Projections"
      icon={<TrendingUp className="h-3 w-3" />}
      className="w-full h-full max-w-full max-h-full"
      allowOutsideBounds={true}
    >
      <div className="flex flex-col h-full overflow-y-auto mx-2 border-l border-t border-r border-border rounded-t-lg" style={{ height: '100%', maxHeight: '100%' }}>
        <div className="container mx-auto p-3 md:p-4 space-y-3">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
            <div className="text-sm font-medium">Projections Calculator</div>
          </div>

          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Account Value Card */}
            <div className="rounded-lg border p-2 md:p-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-muted-foreground">Total Account Value</span>
                      <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Sum of account balances from all selected recurs. This represents the starting cash balance for projections.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-xl md:text-2xl font-medium mb-2">{formatCurrency(totalAccountValue)}</div>
              <div className="space-y-0.5">
                {accountItems.map((item) => (
                  <div key={item._id} className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    <span className="ml-2">{formatCurrency(item.account || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Value Card */}
            <div className="rounded-lg border p-2 md:p-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-muted-foreground">Total Asset Value</span>
                      <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Sum of costs from all selected assets. These are one-time costs included in the projection.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-xl md:text-2xl font-medium mb-2">{formatCurrency(totalAssetValue)}</div>
              <div className="space-y-0.5">
                {assets.slice(0, 3).map((asset) => (
                  <div key={asset._id} className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span className="truncate">{asset.name}</span>
                    <span className="ml-2">{formatCurrency(asset.cost || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scouting Value Card */}
            <div className="rounded-lg border p-2 md:p-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-muted-foreground">Total Scouting Value</span>
                      <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Sum of estimated costs from all selected scouts. These costs are applied when scouts are purchased in the specified months.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-xl md:text-2xl font-medium mb-2">{formatCurrency(totalScoutingValue)}</div>
              <div className="space-y-0.5">
                {scouts.slice(0, 3).map((scout) => (
                  <div key={scout._id} className="text-[10px] text-muted-foreground flex items-center justify-between">
                    <span className="truncate">{scout.name}</span>
                    <span className="ml-2">{formatCurrency(scout.estimatedCost || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projection Line Chart */}
          <div className="rounded-lg border p-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0 mb-2">
              <div className="text-[10px] font-medium">Projection Chart</div>
              <Select value={projectionPeriod} onValueChange={setProjectionPeriod}>
                <SelectTrigger className="h-7 text-[10px] w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="12 months">12 months</SelectItem>
                  <SelectItem value="24 months">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart key={projectionPeriod} data={filteredChartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs text-muted-foreground"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs text-muted-foreground"
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `$${(value / 1000).toFixed(0)}k`;
                      }
                      return `$${value}`;
                    }}
                  />
                  <RechartsTooltip content={<LineChartTooltip />} />
                  <ReferenceLine
                    y={totalAccountValue}
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    y={totalAssetValue}
                    stroke="hsl(var(--chart-3))"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                  {Array.from(filteredMonthsWithScouts).map((month) => (
                    <ReferenceLine
                      key={`scout-${month}`}
                      x={month}
                      stroke="#ec4899"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                    />
                  ))}
                  {Array.from(filteredMonthsWithEvents).map((month) => (
                    <ReferenceLine
                      key={`event-${month}`}
                      x={month}
                      stroke="#a855f7"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      strokeOpacity={0.6}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-6 h-0.5 bg-[hsl(var(--chart-1))]"></div>
                <span className="text-muted-foreground">Balance</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-[hsl(var(--chart-2))]"></div>
                <span className="text-muted-foreground">Account ({formatCurrency(totalAccountValue)})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-[hsl(var(--chart-3))]"></div>
                <span className="text-muted-foreground">Asset ({formatCurrency(totalAssetValue)})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-0.5 h-3 border-l-2 border-dashed border-[#ec4899] opacity-60"></div>
                <span className="text-muted-foreground">Scouts</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-0.5 h-3 border-l-2 border-dashed border-[#a855f7] opacity-60"></div>
                <span className="text-muted-foreground">Events</span>
              </div>
            </div>
          </div>

          {/* Runway and Month-by-Month Breakdown - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Runway Section */}
            <div className="rounded-lg border p-2 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Remaining Runway</span>
                        <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Number of months or years until the balance reaches zero, based on the current burn rate and projection settings.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRunwayDisplayUnit("months")}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                      runwayDisplayUnit === "months"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Months
                  </button>
                  <button
                    onClick={() => setRunwayDisplayUnit("years")}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                      runwayDisplayUnit === "years"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Years
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="text-xl md:text-2xl font-medium">
                  {runwayValue}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {runwayDisplayUnit === "years" ? "years" : "months"}
                </div>
              </div>
            </div>

            {/* Month-by-Month Breakdown */}
            <div className="rounded-lg border p-2">
              <div className="flex items-center justify-between mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">Month-by-Month Breakdown</span>
                        <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Detailed monthly projection showing burn rate, scout purchases, single events, balance change, and ending balance for each month.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            <div className="max-h-32 overflow-y-auto overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b">
                    <th className="text-left py-0.5 px-1">Month</th>
                    <th className="text-right py-0.5 px-1">Burn</th>
                    <th className="text-center py-0.5 px-1">Scouts</th>
                    <th className="text-center py-0.5 px-1">Events</th>
                    <th className="text-right py-0.5 px-1">Change</th>
                    <th className="text-right py-0.5 px-1">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMonthBreakdown.map((item, index) => {
                    const hasScoutsOrEvents = (item.scouts?.length || 0) > 0 || (item.singleEvents?.length || 0) > 0;
                    return (
                      <tr
                        key={index}
                        className={hasScoutsOrEvents ? "bg-muted/30" : ""}
                      >
                        <td className="py-0.5 px-1">{item.month}</td>
                        <td className="text-right py-0.5 px-1">{formatCurrency(item.burn || 0)}</td>
                        <td className="text-center py-0.5 px-1">
                          {item.scouts && item.scouts.length > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center gap-0.5">
                                    <Binoculars className="h-2.5 w-2.5 text-muted-foreground" />
                                    <span>{item.scouts.length}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    {item.scouts.map((scout: any, idx: number) => (
                                      <div key={idx} className="text-[10px]">
                                        <div className="font-medium">{scout.name}</div>
                                        <div className="text-muted-foreground">
                                          {formatCurrency(scout.estimatedCost)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="text-center py-0.5 px-1">
                          {item.singleEvents && item.singleEvents.length > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center gap-0.5">
                                    <Calendar className="h-2.5 w-2.5 text-muted-foreground" />
                                    <span>{item.singleEvents.length}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    {item.singleEvents.map((event: any, idx: number) => (
                                      <div key={idx} className="text-[10px]">
                                        <div className="font-medium">{event.name}</div>
                                        <div className="text-muted-foreground">
                                          {formatCurrency(event.totalValue)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="text-right py-0.5 px-1">
                          <span className={item.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {item.change >= 0 ? "+" : ""}{formatCurrency(item.change || 0)}
                          </span>
                        </td>
                        <td className="text-right py-0.5 px-1">{formatCurrency(item.balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
          </div>

          {/* Recurs, Scouts, Assets Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Recurs */}
            <div className="rounded-lg border p-2 space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-[10px] font-medium flex items-center gap-1">
                        Recurs
                        <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Recurs linked to this project. Select which recurs to include in the projection calculation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-1 flex-1 min-h-0 overflow-y-auto max-h-32">
                {recurs.map((recur) => (
                  <div
                    key={recur._id}
                    className="flex items-center justify-between gap-1.5 p-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <UICheckbox
                        checked={recur.selected}
                        className="h-3 w-3"
                        disabled
                      />
                      <span className="text-[10px] truncate">{recur.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{recur.dateRange}</span>
                      <span className="text-[10px] text-muted-foreground w-[60px] text-right">
                        {formatCurrency(recur.monthlyTotal)}/mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scouts */}
            <div className="rounded-lg border p-2 space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-[10px] font-medium flex items-center gap-1">
                        Scouts
                        <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Scouts in this project. Select which scouts to include in the projection and when they'll be purchased.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-1 flex-1 min-h-0 overflow-y-auto max-h-32">
                {scouts.slice(0, 4).map((scout) => (
                  <div
                    key={scout._id}
                    className="flex items-center justify-between gap-1.5 p-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <UICheckbox
                        checked={true}
                        className="h-3 w-3"
                        disabled
                      />
                      <span className="text-[10px] truncate">{scout.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatCurrency(scout.estimatedCost || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assets */}
            <div className="rounded-lg border p-2 space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-[10px] font-medium flex items-center gap-1">
                        Assets
                        <Info className="h-2.5 w-2.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Assets in this project. Select which assets to include in the projection calculation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-1 flex-1 min-h-0 overflow-y-auto max-h-32">
                {assets.slice(0, 4).map((asset) => (
                  <div
                    key={asset._id}
                    className="flex items-center justify-between gap-1.5 p-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <UICheckbox
                        checked={true}
                        className="h-3 w-3"
                        disabled
                      />
                      <span className="text-[10px] truncate">{asset.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatCurrency(asset.cost || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Charts Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-medium">Distribution</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Scouting Distribution */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-medium">
                  Scouting Value by Project
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={scoutingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent, x, y }) => 
                        percent > 0.05 ? (
                          <text 
                            x={x} 
                            y={y} 
                            fill="currentColor" 
                            textAnchor="middle" 
                            dominantBaseline="central"
                            style={{ fontSize: "8px" }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null
                      }
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {scoutingDistribution.map((entry, index) => (
                        <Cell
                          key={`scouting-cell-${index}`}
                          fill={getColor(index)}
                          stroke={getColor(index)}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Asset Distribution */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground font-medium">
                  Asset Value by Project
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={assetDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent, x, y }) => 
                        percent > 0.05 ? (
                          <text 
                            x={x} 
                            y={y} 
                            fill="currentColor" 
                            textAnchor="middle" 
                            dominantBaseline="central"
                            style={{ fontSize: "8px" }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null
                      }
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {assetDistribution.map((entry, index) => (
                        <Cell
                          key={`asset-cell-${index}`}
                          fill={getColor(index)}
                          stroke={getColor(index)}
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
