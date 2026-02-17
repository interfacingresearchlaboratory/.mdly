"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Check, ChevronDown, ChevronUp, Circle, User, Building2 } from "lucide-react";
import { Checkbox } from "@editor/ui/checkbox";
import { Button } from "@editor/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@editor/ui/collapsible";
import { ToolbarlessEditor } from "@editor/ui/editor/toolbarless-editor";
import { ElectronWindow } from "./electron-window";
import { DemoColumnCard } from "./demo-column-cards";
import { cn } from "@editor/ui/utils";
import { textToLexicalState } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

type ReviewType = "daily" | "weekly" | "monthly" | "quarterly";
type StepSource = "header" | "manual";
type StepOrg = "personal" | "acme";

interface StepDef {
  _id: string;
  label: string;
  source: StepSource;
  organization: StepOrg;
}

const PERIOD_LABELS: Record<ReviewType, string> = {
  daily: "Mon, Feb 10",
  weekly: "Week of Feb 3–9",
  monthly: "February 2025",
  quarterly: "Q1 2025",
};

const STEPS: Record<ReviewType, StepDef[]> = {
  daily: [
    { _id: "daily-1", label: "What went well today?", source: "header", organization: "acme" },
    { _id: "daily-2", label: "What blocked or slowed you down?", source: "header", organization: "acme" },
    { _id: "daily-3", label: "Tomorrow's top 3 priorities", source: "header", organization: "personal" },
  ],
  weekly: [
    { _id: "weekly-1", label: "What went well this week?", source: "header", organization: "acme" },
    { _id: "weekly-2", label: "Reviewed accomplishments", source: "manual", organization: "acme" },
    { _id: "weekly-3", label: "What went well personally?", source: "header", organization: "personal" },
    { _id: "weekly-4", label: "What would you do differently?", source: "header", organization: "acme" },
    { _id: "weekly-5", label: "Reviewed disappointments", source: "manual", organization: "personal" },
    { _id: "weekly-6", label: "What blocked or slowed you down?", source: "header", organization: "acme" },
    { _id: "weekly-7", label: "Start, stop, or continue next week?", source: "header", organization: "personal" },
  ],
  monthly: [
    { _id: "monthly-1", label: "Big wins this month", source: "header", organization: "acme" },
    { _id: "monthly-2", label: "Reviewed monthly accomplishments", source: "manual", organization: "acme" },
    { _id: "monthly-3", label: "Personal highlights", source: "header", organization: "personal" },
    { _id: "monthly-4", label: "What didn't go well?", source: "header", organization: "acme" },
    { _id: "monthly-5", label: "Key learnings", source: "header", organization: "personal" },
    { _id: "monthly-6", label: "Next month's focus areas", source: "header", organization: "acme" },
  ],
  quarterly: [
    { _id: "quarterly-1", label: "Quarterly wins and metrics", source: "header", organization: "acme" },
    { _id: "quarterly-2", label: "Reviewed quarterly goals", source: "manual", organization: "acme" },
    { _id: "quarterly-3", label: "What fell short?", source: "header", organization: "personal" },
    { _id: "quarterly-4", label: "Key learnings and patterns", source: "header", organization: "acme" },
    { _id: "quarterly-5", label: "Next quarter's focus", source: "header", organization: "personal" },
  ],
};

/** Content for header steps only, keyed by step _id. */
const STEP_CONTENT: Record<string, string> = {
  "daily-1": "Solid morning focus 9–11 on auth flow. Shipped the timeout fix.",
  "daily-2": "Afternoon fragmented—3 back-to-back meetings. Context-switched 4x before lunch.",
  "daily-3": "1. Protect 9am block. 2. Batch admin work to 2pm. 3. Review PR batch.",
  "weekly-1": "Shipped dashboard v2 and API refactor. Wed 9–11 deep work block was key.",
  "weekly-3": "Gym 4x, meal prepped, caught up with family.",
  "weekly-4": "Need to batch PR reviews; docs fell behind.",
  "weekly-6": "Context switching between PRs and feature work.",
  "weekly-7": "Start: docs sprint Tue/Thu. Stop: ad-hoc meetings. Continue: morning deep work block.",
  "monthly-1": "Strong month—Q1 plan locked, 2 hires, onboarding improved.",
  "monthly-3": "Consistent exercise, side project progress.",
  "monthly-4": "Code review lag spiked mid-month; post-mortem for P0 still open.",
  "monthly-5": "Batching reviews helps; protecting roadmap from scope creep.",
  "monthly-6": "Focus on reliability work and closing that loop.",
  "quarterly-1": "Revenue +18%, shipped 2 major initiatives, team scaled well.",
  "quarterly-3": "Side project scope crept; NPS missed target.",
  "quarterly-4": "Protect roadmap from scope creep; double down on support tooling.",
  "quarterly-5": "Reliability, NPS, and finishing what we started.",
};

/** Chart data: stacked by project (api, dashboard, docs), with completed vs uncompleted bars per period. */
interface ChartDataPoint {
  name: string;
  completedApi: number;
  completedDashboard: number;
  completedDocs: number;
  uncompletedApi: number;
  uncompletedDashboard: number;
  uncompletedDocs: number;
}

/** Past period summaries and stats for weekly, monthly, quarterly. */
const CADENCE_SUMMARY: Record<
  Exclude<ReviewType, "daily">,
  { items: string[]; stats: string[]; chartData: ChartDataPoint[] }
> = {
  weekly: {
    items: [
      "Mon: Shipped auth fix. Focus block solid.",
      "Tue: 3 meetings, inbox cleared.",
      "Wed: Deep work 9–11, API refactor.",
      "Thu: PR review batch, design sync.",
      "Fri: Dashboard launch, retro.",
    ],
    stats: ["5/5 days reviewed", "12 tasks done", "3 deep work blocks"],
    chartData: [
      { name: "Mon", completedApi: 2, completedDashboard: 1, completedDocs: 0, uncompletedApi: 1, uncompletedDashboard: 0, uncompletedDocs: 1 },
      { name: "Tue", completedApi: 1, completedDashboard: 1, completedDocs: 0, uncompletedApi: 0, uncompletedDashboard: 1, uncompletedDocs: 1 },
      { name: "Wed", completedApi: 2, completedDashboard: 1, completedDocs: 1, uncompletedApi: 1, uncompletedDashboard: 0, uncompletedDocs: 0 },
      { name: "Thu", completedApi: 2, completedDashboard: 0, completedDocs: 1, uncompletedApi: 0, uncompletedDashboard: 1, uncompletedDocs: 1 },
      { name: "Fri", completedApi: 1, completedDashboard: 2, completedDocs: 2, uncompletedApi: 1, uncompletedDashboard: 1, uncompletedDocs: 0 },
    ],
  },
  monthly: {
    items: [
      "Week 1: Q1 planning, roadmap finalized.",
      "Week 2: 2 hires, onboarding flow shipped.",
      "Week 3: Code review batching, docs sprint.",
      "Week 4: Reliability focus, P0 post-mortem.",
    ],
    stats: ["4/4 weeks reviewed", "48 tasks", "Top focus: API refactor"],
    chartData: [
      { name: "W1", completedApi: 4, completedDashboard: 3, completedDocs: 3, uncompletedApi: 2, uncompletedDashboard: 1, uncompletedDocs: 2 },
      { name: "W2", completedApi: 5, completedDashboard: 4, completedDocs: 5, uncompletedApi: 1, uncompletedDashboard: 2, uncompletedDocs: 1 },
      { name: "W3", completedApi: 3, completedDashboard: 5, completedDocs: 4, uncompletedApi: 2, uncompletedDashboard: 1, uncompletedDocs: 2 },
      { name: "W4", completedApi: 4, completedDashboard: 4, completedDocs: 4, uncompletedApi: 1, uncompletedDashboard: 2, uncompletedDocs: 1 },
    ],
  },
  quarterly: {
    items: [
      "Jan: Q1 locked, onboarding -25% time-to-value.",
      "Feb: 2 hires, review batching, dashboard v2.",
      "Mar: Reliability, NPS tooling, revenue +18%.",
    ],
    stats: ["3/3 months reviewed", "Revenue +18%", "2 major initiatives shipped"],
    chartData: [
      { name: "Jan", completedApi: 12, completedDashboard: 10, completedDocs: 8, uncompletedApi: 3, uncompletedDashboard: 2, uncompletedDocs: 5 },
      { name: "Feb", completedApi: 14, completedDashboard: 12, completedDocs: 10, uncompletedApi: 2, uncompletedDashboard: 4, uncompletedDocs: 2 },
      { name: "Mar", completedApi: 16, completedDashboard: 14, completedDocs: 12, uncompletedApi: 4, uncompletedDashboard: 2, uncompletedDocs: 4 },
    ],
  },
};

const CHART_COMPLETED_COLORS = ["#60a5fa", "#3b82f6", "#2563eb"];
const CHART_UNCOMPLETED_COLORS = ["#f472b6", "#ec4899", "#db2777"];

function OrgBadge({ org }: { org: StepOrg }) {
  const isAcme = org === "acme";
  const Icon = isAcme ? Building2 : User;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1 py-0.5 text-[7px] font-medium shrink-0",
        isAcme
          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {isAcme ? "Acme" : "Personal"}
    </span>
  );
}

const CADENCE_TITLE: Record<Exclude<ReviewType, "daily">, string> = {
  weekly: "This past week",
  monthly: "This past month",
  quarterly: "This past quarter",
};

function CadenceSummaryBlock({ type }: { type: Exclude<ReviewType, "daily"> }) {
  const { items, stats, chartData } = CADENCE_SUMMARY[type];
  return (
    <div className="mb-2 rounded border border-border bg-muted/30 p-1.5">
      <div className="text-[8px] font-medium text-muted-foreground mb-1 text-left">
        {CADENCE_TITLE[type]}
      </div>
      <ul className="list-none pl-0 pr-0 ml-0 mr-0 space-y-0.5 mb-1.5 text-left">
        {items.map((item, i) => (
          <li key={i} className="text-[9px] truncate text-foreground/90">
            {item}
          </li>
        ))}
      </ul>
      <div className="h-24 mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 20 }} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 8 }}
              tickLine={true}
              axisLine={true}
            />
            <YAxis
              tick={{ fontSize: 8 }}
              tickLine={true}
              axisLine={true}
              domain={[0, "auto"]}
            />
            <Bar dataKey="completedApi" stackId="completed" fill={CHART_COMPLETED_COLORS[0]} radius={0} />
            <Bar dataKey="completedDashboard" stackId="completed" fill={CHART_COMPLETED_COLORS[1]} radius={0} />
            <Bar dataKey="completedDocs" stackId="completed" fill={CHART_COMPLETED_COLORS[2]} radius={0} />
            <Bar dataKey="uncompletedApi" stackId="uncompleted" fill={CHART_UNCOMPLETED_COLORS[0]} radius={0} />
            <Bar dataKey="uncompletedDashboard" stackId="uncompleted" fill={CHART_UNCOMPLETED_COLORS[1]} radius={0} />
            <Bar dataKey="uncompletedDocs" stackId="uncompleted" fill={CHART_UNCOMPLETED_COLORS[2]} radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[8px] text-muted-foreground">
        {stats.map((stat, i) => (
          <span key={i}>{stat}</span>
        ))}
      </div>
    </div>
  );
}

function ReviewStepsBar({
  steps,
  completions,
  onCompletionChange,
  stepsOpen,
  onStepsOpenChange,
}: {
  steps: StepDef[];
  completions: Record<string, boolean>;
  onCompletionChange: (stepId: string, completed: boolean) => void;
  stepsOpen: boolean;
  onStepsOpenChange: (open: boolean) => void;
}) {
  const completedCount = steps.filter((s) => completions[s._id]).length;
  const allDone = steps.length > 0 && completedCount === steps.length;
  const someDone = completedCount > 0 && !allDone;

  return (
    <div className="pb-1.5">
      <div
        className={cn(
          "border rounded-md shadow-sm bg-background/50 backdrop-blur-md transition-colors",
          allDone && "border-green-500/30 bg-green-500/5",
          someDone && "border-blue-500/30 bg-blue-500/5",
          !allDone && !someDone && "border-border",
        )}
      >
        <Collapsible open={stepsOpen} onOpenChange={onStepsOpenChange}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between p-1.5 h-auto gap-1.5 text-[10px]",
                allDone &&
                  "text-green-600 dark:text-green-500 hover:bg-green-500/10",
                someDone &&
                  "text-blue-600 dark:text-blue-500 hover:bg-blue-500/10",
              )}
            >
              <span className="flex items-center gap-1.5 font-medium">
                Review steps
                <span className="flex items-center gap-0.5" aria-hidden>
                  {steps.map((step) => {
                    const completed = completions[step._id];
                    const iconClassName = cn(
                      "h-2.5 w-2.5 shrink-0",
                      allDone && "text-green-600 dark:text-green-500",
                      someDone && "text-blue-600 dark:text-blue-500",
                      !allDone && !someDone && "text-muted-foreground",
                    );
                    return completed ? (
                      <Check key={step._id} className={iconClassName} />
                    ) : (
                      <Circle key={step._id} className={iconClassName} />
                    );
                  })}
                </span>
              </span>
              {stepsOpen ? (
                <ChevronUp className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-0.5 divide-y divide-border px-2 pb-1.5 pt-0.5">
              {steps.map((step) => (
                <div
                  key={step._id}
                  className="flex items-center gap-2 py-1 first:pt-1 last:pb-1 text-left"
                >
                  <OrgBadge org={step.organization} />
                  <Checkbox
                    id={`step-${step._id}`}
                    checked={completions[step._id]}
                    onCheckedChange={(checked) =>
                      onCompletionChange(step._id, checked === true)
                    }
                    className="h-2.5 w-2.5"
                  />
                  <label
                    htmlFor={`step-${step._id}`}
                    className={cn(
                      "text-[11px] font-medium cursor-pointer flex-1 min-w-0",
                      completions[step._id] && "line-through text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

function ReviewEditorDemoContent({ type }: { type: ReviewType }) {
  const steps = STEPS[type];
  const headerSteps = steps.filter((s) => s.source === "header");
  const [stepsOpen, setStepsOpen] = useState(false);
  const [completions, setCompletions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s, i) => [s._id, i < 2])),
  );
  const [sectionContent, setSectionContent] = useState<
    Record<string, { root: unknown }>
  >(() =>
    Object.fromEntries(
      headerSteps.map((s) => [
        s._id,
        textToLexicalState(STEP_CONTENT[s._id] ?? ""),
      ]),
    ),
  );

  const handleStepContentChange = useCallback((stepId: string) => {
    return (content: { root: unknown }) => {
      setSectionContent((prev) => ({ ...prev, [stepId]: content }));
    };
  }, []);

  const hasSummary = type !== "daily";

  return (
    <div className="w-full h-full flex items-stretch justify-center pt-3 px-3 md:pt-4 md:px-4 pb-0 translate-y-8 md:translate-y-12">
      <ElectronWindow
        title="Review"
        icon={<FileText className="h-3 w-3" />}
        className="w-full max-w-[92%] h-full min-h-0 shrink-0 rounded-t-lg rounded-b-none"
      >
        <div className="flex flex-col h-full min-h-0 overflow-hidden border-t">
          <div className="flex-1 min-h-0 flex flex-col overflow-auto">
            <div className="sticky top-0 z-10 shrink-0 px-3 pt-2 bg-background/95 backdrop-blur-sm">
              <div className="text-[9px] text-muted-foreground font-medium mb-1">
                {PERIOD_LABELS[type]}
              </div>
              <ReviewStepsBar
                steps={steps}
                completions={completions}
                onCompletionChange={(stepId, completed) =>
                  setCompletions((prev) => ({ ...prev, [stepId]: completed }))
                }
                stepsOpen={stepsOpen}
                onStepsOpenChange={setStepsOpen}
              />
            </div>
            <div className="shrink-0 p-3 pt-1 space-y-2 pb-4">
              {hasSummary && <CadenceSummaryBlock type={type} />}
              {steps.map((step) => {
                if (step.source === "manual") {
                  return (
                    <div
                      key={step._id}
                      className="rounded-lg border border-border bg-card p-1.5 flex items-start gap-2 text-left"
                    >
                      <OrgBadge org={step.organization} />
                      <Checkbox
                        id={`manual-${step._id}`}
                        checked={completions[step._id]}
                        onCheckedChange={(checked) =>
                          setCompletions((prev) => ({
                            ...prev,
                            [step._id]: checked === true,
                          }))
                        }
                        className="h-2.5 w-2.5 shrink-0 mt-0.5"
                      />
                      <label
                        htmlFor={`manual-${step._id}`}
                        className={cn(
                          "text-xs block cursor-pointer flex-1",
                          completions[step._id] &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </label>
                    </div>
                  );
                }
                return (
                  <section key={step._id} className="flex flex-col gap-0.5 text-left">
                    <div className="flex items-center gap-2">
                      <OrgBadge org={step.organization} />
                      <div className="text-xs font-medium text-foreground">
                        {step.label}
                      </div>
                    </div>
                    <ToolbarlessEditor
                      resetKey={`${type}-${step._id}`}
                      initialContent={sectionContent[step._id]}
                      onChange={handleStepContentChange(step._id)}
                      placeholder={`Add notes for ${step.label}…`}
                      className="w-full text-[9px]"
                      contentMinHeight={32}
                      projects={[]}
                      tasks={[]}
                    />
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </ElectronWindow>
    </div>
  );
}

interface ReviewEditorDemoCardProps {
  title?: string;
  description?: string;
  gradient?: "green";
}

const REVIEW_TYPE_OPTIONS: { value: ReviewType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export function ReviewEditorDemoCard({
  title = "Make reviews a routine",
  description = "Daily, weekly, and monthly reviews keep you aligned with what matters. Reflect on accomplishments and adjust without starting from scratch.",
  gradient = "green",
}: ReviewEditorDemoCardProps) {
  const [reviewType, setReviewType] = useState<ReviewType>("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [autoCycleStopped, setAutoCycleStopped] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = REVIEW_TYPE_OPTIONS.findIndex((o) => o.value === reviewType);
  const targetIndex = hoveredIndex ?? activeIndex;

  useEffect(() => {
    if (autoCycleStopped) return;
    const id = setInterval(() => {
      setReviewType((prev) => {
        const idx = REVIEW_TYPE_OPTIONS.findIndex((o) => o.value === prev);
        const nextIdx = (idx + 1) % REVIEW_TYPE_OPTIONS.length;
        return REVIEW_TYPE_OPTIONS[nextIdx].value;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [autoCycleStopped]);

  const handleTypeClick = (value: ReviewType) => {
    setReviewType(value);
    setAutoCycleStopped(true);
  };

  useEffect(() => {
    const btn = buttonRefs.current[targetIndex];
    const container = containerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [targetIndex]);

  return (
    <DemoColumnCard
      title={title}
      description={description}
      demo={<ReviewEditorDemoContent key={reviewType} type={reviewType} />}
      footer={
        <div className="flex justify-start w-full">
          <div
            ref={containerRef}
            className="relative flex gap-0.5 p-0.5 rounded-lg border border-border bg-muted/30"
          >
            {REVIEW_TYPE_OPTIONS.map(({ value, label }, index) => (
              <button
                key={value}
                ref={(el) => { buttonRefs.current[index] = el; }}
                type="button"
                onClick={() => handleTypeClick(value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative z-10 flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  targetIndex === index
                    ? "!text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
            <div
              className="absolute z-0 top-0.5 bottom-0.5 rounded-md bg-[#0101fd] transition-all duration-200 ease-out"
              style={{
                left: pillStyle.left,
                width: pillStyle.width,
                opacity: pillStyle.opacity,
              }}
            />
          </div>
        </div>
      }
      gradient={gradient}
    />
  );
}
