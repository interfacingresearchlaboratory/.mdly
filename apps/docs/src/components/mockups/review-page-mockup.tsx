"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Check,
  Circle,
  CircleCheck,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { ElectronWindow } from "./electron-window";
import { MockShellSidebar } from "./mock-shell-sidebar";
import { EntityIcon } from "@editor/ui/entity-icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@editor/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@editor/ui/table";
import { Badge } from "@editor/ui/badge";
import { Checkbox } from "@editor/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@editor/ui/collapsible";
import { Button } from "@editor/ui/button";
// Lightweight stub replacing ToolbarlessEditor (avoids pulling Lexical into docs)
function ToolbarlessEditor({
  placeholder,
  className,
  contentMinHeight,
}: {
  resetKey?: string;
  initialContent?: unknown;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  className?: string;
  contentMinHeight?: number;
  projects?: { _id: string; title: string }[];
  tasks?: { _id: string; title: string }[];
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background px-3 py-2 text-muted-foreground text-xs",
        className
      )}
      style={{ minHeight: contentMinHeight ?? 40 }}
    >
      {placeholder}
    </div>
  );
}
import { cn } from "@editor/ui/utils";
import { ProviderIcon } from "./provider-icon";
import {
  mockTasks,
  mockProjects,
  getProjectById,
  type MockTask,
  type MockProject,
} from "./mock-data";

const PROJECT_STATUS_ICON: Record<
  MockProject["status"],
  React.ComponentType<{ className?: string }>
> = {
  active: PlayCircle,
  paused: PauseCircle,
  done: CircleCheck,
  backlog: CircleDashed,
  cancelled: XCircle,
};

const TASK_BUCKET_ICON: Record<
  MockTask["bucket"],
  React.ComponentType<{ className?: string }>
> = {
  backlog: CircleDashed,
  shaping: Circle,
  todo: Circle,
  in_progress: Circle,
  in_review: Circle,
  done: CircleCheck,
  cancelled: XCircle,
};

const mockAccomplishments = [
  {
    _id: "acc-1",
    title: "Completed API refactor",
    description:
      "Refactored 15 legacy endpoints, improved response times by 40%",
    date: "Jan 12",
  },
  {
    _id: "acc-2",
    title: "Shipped dashboard redesign",
    description: "Launched new admin dashboard with improved UX",
    date: "Jan 13",
  },
];

const mockDisappointments = [
  {
    _id: "dis-1",
    title: "Missed code review deadline",
    description: "Didn't complete all PR reviews due to context switching",
    date: "Jan 11",
  },
  {
    _id: "dis-2",
    title: "Documentation incomplete",
    description: "API docs still missing for 3 endpoints",
    date: "Jan 13",
  },
];

const mockEmbeds = [
  { _id: "emb-1", provider: "notion", title: "Weekly goals" },
  { _id: "emb-2", provider: "linear", title: "Team board" },
  { _id: "emb-3", provider: "notion", title: "Meeting notes" },
  { _id: "emb-4", provider: "linear", title: "Sprint" },
] as const;

const mockNotionGoals = [
  "Ship API refactor to prod",
  "Complete dashboard QA",
  "Docs for new endpoints",
  "PR review batch by Wed",
];

const mockLinearIssues = [
  { id: "ENG-42", title: "Fix auth timeout", status: "Done" },
  { id: "ENG-43", title: "Dashboard filters", status: "In Progress" },
  { id: "ENG-44", title: "API rate limits", status: "Todo" },
];

const mockNotionNotes = [
  "Mon standup: API on track",
  "Wed: Design review 2pm",
  "Fri: Sprint retro notes",
];

type StepSource = "header" | "manual";

interface MockStep {
  _id: string;
  label: string;
  description?: string;
  order: number;
  source: StepSource;
}

const mockSteps: MockStep[] = [
  {
    _id: "step-1",
    label: "What went well this week?",
    order: 0,
    source: "header",
  },
  {
    _id: "step-2",
    label: "Reviewed accomplishments",
    order: 1,
    source: "manual",
  },
  {
    _id: "step-3",
    label: "What would you do differently?",
    order: 2,
    source: "header",
  },
  {
    _id: "step-4",
    label: "Reviewed disappointments",
    order: 3,
    source: "manual",
  },
  {
    _id: "step-5",
    label: "What blocked or slowed you down?",
    order: 4,
    source: "header",
  },
  {
    _id: "step-6",
    label: "Start, stop, or continue next week?",
    order: 5,
    source: "header",
  },
  { _id: "step-7", label: "Key takeaways", order: 6, source: "header" },
];

function textToLexicalState(text: string): { root: unknown } {
  const lines = text.split("\n");
  const children = lines.map((line) => ({
    children: line.trim()
      ? [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: line,
            type: "text",
            version: 1,
          },
        ]
      : [],
    direction: "ltr" as const,
    format: "",
    indent: 0,
    type: "paragraph" as const,
    version: 1,
  }));
  return {
    root: {
      children,
      direction: "ltr" as const,
      format: "",
      indent: 0,
      type: "root" as const,
      version: 1,
    },
  };
}

const initialContentByStep: Record<string, { root: unknown }> = {
  "step-1": textToLexicalState(
    "This week was productive overall. The API refactor went smoothly and the dashboard launch was successful.",
  ),
  "step-3": textToLexicalState(
    "Need to improve time management for code reviews. Documentation backlog is growing.",
  ),
  "step-5": textToLexicalState(
    "Context switching between PRs and feature work. Need to batch review time.",
  ),
  "step-6": textToLexicalState(
    "Start: docs sprint. Stop: ad-hoc meetings. Continue: morning deep work block.",
  ),
  "step-7": textToLexicalState(
    "Focus on batching PR reviews. Schedule docs time in calendar.",
  ),
};

function TaskRow({ task }: { task: MockTask }) {
  const [isHovered, setIsHovered] = useState(false);
  const project = task.projectId ? getProjectById(task.projectId) : undefined;
  const BucketIcon = TASK_BUCKET_ICON[task.bucket];

  return (
    <TableRow
      className={cn(
        "cursor-pointer transition-colors",
        isHovered && "bg-accent/50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <TableCell className="font-medium text-[10px] py-1 min-w-[140px]">
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate">{task.title}</span>
          <span className="flex items-center gap-2 flex-wrap text-[9px] text-muted-foreground">
            {task.linearIssueUrl && (
              <div
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground bg-muted rounded-full px-1 py-0.5"
                aria-label={`Open ${task.linearIssueIdentifier ?? "Linear issue"}`}
                onClick={(e) => e.stopPropagation()}>
                <ProviderIcon
                  provider="linear"
                  className="h-2.5 w-2.5 shrink-0 opacity-70"
                />
                <span>{task.linearIssueIdentifier ?? "Linear"}</span>
              </div>
            )}
            {task.notionPageUrl && (
              <div
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground bg-muted rounded-full px-1 py-0.5"
                aria-label={`Open ${task.notionPageTitle ?? "Notion page"}`}
                onClick={(e) => e.stopPropagation()}>
                <ProviderIcon
                  provider="notion"
                  className="h-2.5 w-2.5 shrink-0 opacity-70"
                />
                <span>{task.notionPageTitle ?? "Notion"}</span>
              </div>
            )}
          </span>
        </span>
      </TableCell>
      <TableCell className="py-1">
        {project && (
          <span className="flex items-center gap-1.5 text-[10px] text-foreground min-w-0 max-w-[80px]">
            <EntityIcon
              entityType="project"
              className="h-3 w-3 shrink-0 text-muted-foreground"
            />
            <span className="truncate">{project.title}</span>
          </span>
        )}
      </TableCell>
      <TableCell className="py-1 whitespace-nowrap">
        <Badge
          variant="secondary"
          className="text-[9px] font-normal px-1.5 py-0 gap-1">
          {BucketIcon && <BucketIcon className="h-2.5 w-2.5 shrink-0" />}
          {task.bucket.replace("_", " ")}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function MockNotionEmbed({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-h-0 overflow-auto">
      <div className="px-3 pt-2.5 pb-1.5 border-b border-border/60">
        <div className="text-[11px] font-semibold text-foreground">{title}</div>
      </div>
      <ul className="py-1.5 px-2 space-y-0.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[10px] text-foreground py-1 px-2 rounded-sm hover:bg-muted/50 transition-colors">
            <span
              className="mt-[0.35em] w-1.5 h-1.5 rounded-full bg-muted-foreground/50 shrink-0"
              aria-hidden
            />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MockLinearEmbed({
  issues,
}: {
  issues: { id: string; title: string; status: string }[];
}) {
  return (
    <div className="p-2 min-h-0 overflow-auto">
      <div className="space-y-1">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-2 text-[10px] py-1 border-b border-border/50 last:border-0">
            <span className="text-muted-foreground shrink-0">{issue.id}</span>
            <span className="truncate flex-1">{issue.title}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
              {issue.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

type MockEmbed = (typeof mockEmbeds)[number];

function MockEmbedContent({ embed }: { embed: MockEmbed }) {
  if (embed._id === "emb-1") {
    return <MockNotionEmbed title="This week" items={mockNotionGoals} />;
  }
  if (embed._id === "emb-2") {
    return <MockLinearEmbed issues={mockLinearIssues} />;
  }
  if (embed._id === "emb-3") {
    return <MockNotionEmbed title="Notes" items={mockNotionNotes} />;
  }
  if (embed._id === "emb-4") {
    return (
      <MockLinearEmbed
        issues={[
          {
            id: "ENG-45",
            title: "Sprint goal: API launch",
            status: "In Progress",
          },
          { id: "ENG-46", title: "Bug bash", status: "Todo" },
        ]}
      />
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80px] p-3 text-center">
      <ProviderIcon
        provider={(embed as MockEmbed).provider}
        className="h-6 w-6 opacity-50"
      />
      <span className="text-[10px] text-muted-foreground mt-1">
        {(embed as MockEmbed).title}
      </span>
    </div>
  );
}

interface ReviewStepsSectionMockProps {
  steps: MockStep[];
  completions: Record<string, boolean>;
  onCompletionChange: (stepId: string, completed: boolean) => void;
  stepsOpen: boolean;
  onStepsOpenChange: (open: boolean) => void;
}

function ReviewStepsSectionMock({
  steps,
  completions,
  onCompletionChange,
  stepsOpen,
  onStepsOpenChange,
}: ReviewStepsSectionMockProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const completedCount = sortedSteps.filter((s) => completions[s._id]).length;
  const allDone = steps.length > 0 && completedCount === steps.length;
  const someDone = completedCount > 0 && !allDone;

  return (
    <div className="pt-2 pb-1">
      <div
        className={cn(
          "border rounded-md shadow-sm bg-background/50 backdrop-blur-md transition-colors",
          allDone && "border-green-500/30 bg-green-500/5",
          someDone && "border-blue-500/30 bg-blue-500/5",
          !allDone && !someDone && "border-border",
        )}>
        <Collapsible open={stepsOpen} onOpenChange={onStepsOpenChange}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between p-1.5 h-auto gap-1.5 text-xs",
                allDone &&
                  "text-green-600 dark:text-green-500 hover:bg-green-500/10",
                someDone &&
                  "text-blue-600 dark:text-blue-500 hover:bg-blue-500/10",
              )}>
              <span className="flex items-center gap-1.5 font-medium">
                Review steps
                <span className="flex items-center gap-0.5" aria-hidden>
                  {sortedSteps.map((step) => {
                    const completed = completions[step._id];
                    const iconClassName = cn(
                      "h-3 w-3 shrink-0",
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
                <ChevronUp className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1 divide-y divide-border px-2 pb-2 pt-1">
              {sortedSteps.map((step) => (
                <div
                  key={step._id}
                  className="flex items-center gap-2 py-1.5 first:pt-1 last:pb-1">
                  <Checkbox
                    id={`step-${step._id}`}
                    checked={completions[step._id]}
                    onCheckedChange={(checked) =>
                      onCompletionChange(step._id, checked === true)
                    }
                    className="h-3 w-3"
                  />
                  <label
                    htmlFor={`step-${step._id}`}
                    className={cn(
                      "text-xs font-medium cursor-pointer flex-1",
                      completions[step._id] &&
                        "line-through text-muted-foreground",
                    )}>
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

export function ReviewPageMockup() {
  const [embedTab, setEmbedTab] = useState<string>(mockEmbeds[0]._id);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [completions, setCompletions] = useState<Record<string, boolean>>({
    "step-1": true,
    "step-2": true,
    "step-3": true,
    "step-4": false,
    "step-5": true,
    "step-6": true,
    "step-7": true,
  });
  const [sectionContent, setSectionContent] =
    useState<Record<string, { root: unknown }>>(initialContentByStep);

  const handleStepContentChange = useCallback((stepId: string) => {
    return (content: { root: unknown }) => {
      setSectionContent((prev) => ({ ...prev, [stepId]: content }));
    };
  }, []);

  const reviewTasks = mockTasks.filter(
    (task) =>
      task.bucket === "done" ||
      task.bucket === "in_progress" ||
      task.bucket === "in_review",
  );
  const reviewProjects = mockProjects.filter((p) => p.status === "active");

  const sortedSteps = [...mockSteps].sort((a, b) => a.order - b.order);

  return (
    <ElectronWindow
      title="Weekly Review"
      icon={<FileText className="h-3 w-3" />}
      className="w-full max-w-full">
      <div
        className="flex h-full overflow-hidden"
        style={{ maxHeight: "600px", height: "600px" }}>
        <MockShellSidebar forceCollapsedOnMobile initialCollapsed />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-l">
        {/* 4-quadrant grid */}
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 border-t border-border">
          {/* Top-left: Sticky steps + Editor sections */}
          <div className="border-r border-b border-border flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col overflow-auto">
              {/* Sticky review steps section */}
              <div className="sticky top-0 z-10 shrink-0 px-3 bg-background/95 backdrop-blur-sm">
                <ReviewStepsSectionMock
                  steps={mockSteps}
                  completions={completions}
                  onCompletionChange={(stepId, completed) =>
                    setCompletions((prev) => ({ ...prev, [stepId]: completed }))
                  }
                  stepsOpen={stepsOpen}
                  onStepsOpenChange={setStepsOpen}
                />
              </div>
              {/* Scrollable editor sections */}
              <div className="shrink-0 p-3 pt-1 space-y-1.5 pb-4">
                {sortedSteps.map((step) => {
                  if (step.source === "manual") {
                    return (
                      <div
                        key={step._id}
                        className="rounded-lg border border-border bg-card p-1 flex items-start gap-2 mb-6">
                        <Checkbox
                          id={`manual-${step._id}`}
                          checked={completions[step._id]}
                          onCheckedChange={(checked) =>
                            setCompletions((prev) => ({
                              ...prev,
                              [step._id]: checked === true,
                            }))
                          }
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`manual-${step._id}`}
                            className={cn(
                              "text-[10px] block cursor-pointer",
                              completions[step._id] &&
                                "line-through text-muted-foreground",
                            )}>
                            {step.label}
                          </label>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <section key={step._id} className="flex flex-col gap-0.5">
                      <div className="text-sm font-medium text-foreground">
                        {step.label}
                      </div>
                      <ToolbarlessEditor
                        resetKey={step._id}
                        initialContent={sectionContent[step._id]}
                        onChange={handleStepContentChange(step._id)}
                        placeholder={`Add notes for ${step.label}…`}
                        className="w-full text-[10px]"
                        contentMinHeight={40}
                        projects={reviewProjects.slice(0, 5).map((p) => ({
                          _id: p._id,
                          title: p.title,
                        }))}
                        tasks={reviewTasks.slice(0, 5).map((t) => ({
                          _id: t._id,
                          title: t.title,
                        }))}
                      />
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top-right: Tasks and Projects tabs */}
          <div className="border-b border-border flex flex-col min-h-0 overflow-hidden">
            <Tabs
              defaultValue="projects"
              className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto shrink-0">
                <TabsTrigger
                  value="projects"
                  className="group text-[10px] gap-1 rounded-none px-2.5 py-1.5 border-r border-border data-[state=active]:bg-muted data-[state=active]:text-foreground">
                  <EntityIcon
                    entityType="project"
                    className="h-3.5 w-3.5 opacity-70 group-data-[state=active]:opacity-100"
                  />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="group text-[10px] gap-1 rounded-none px-2.5 py-1.5 border-r border-border data-[state=active]:bg-muted data-[state=active]:text-foreground">
                  <EntityIcon
                    entityType="task"
                    className="h-3.5 w-3.5 opacity-70 group-data-[state=active]:opacity-100"
                  />
                  Tasks
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="projects"
                className="flex-1 min-h-0 overflow-auto border-0 mt-0 p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-0 hover:bg-transparent">
                      <TableHead className="text-[9px] py-1 h-auto font-medium min-w-[140px]">
                        Title
                      </TableHead>
                      <TableHead className="text-[9px] py-1 h-auto font-medium w-16">
                        Status
                      </TableHead>
                      <TableHead className="text-[9px] py-1 h-auto font-medium w-10">
                        Updated
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewProjects.slice(0, 12).map((project) => {
                      const StatusIcon = PROJECT_STATUS_ICON[project.status];
                      return (
                        <TableRow
                          key={project._id}
                          className="cursor-pointer hover:bg-accent/50">
                          <TableCell className="font-medium text-[10px] py-1 min-w-[200px]">
                            <span className="flex flex-col gap-0.5 min-w-0">
                              <span className="truncate">{project.title}</span>
                              <span className="flex items-center gap-2 flex-wrap text-[9px] text-muted-foreground">
                                {project.linearProjectUrl && (
                                  <div
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground bg-muted rounded-full px-1 py-0.5"
                                    aria-label={`Open ${project.linearProjectIdentifier ?? "Linear project"}`}
                                    onClick={(e) => e.stopPropagation()}>
                                    <ProviderIcon
                                      provider="linear"
                                      className="h-2.5 w-2.5 shrink-0 opacity-70"
                                    />
                                    <span>
                                      {project.linearProjectIdentifier ??
                                        "Linear"}
                                    </span>
                                  </div>
                                )}
                                {project.notionPageUrl && (
                                  <div
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground bg-muted rounded-full px-1 py-0.5"
                                    aria-label={`Open ${project.notionPageTitle ?? "Notion page"}`}
                                    onClick={(e) => e.stopPropagation()}>
                                    <ProviderIcon
                                      provider="notion"
                                      className="h-2.5 w-2.5 shrink-0 opacity-70"
                                    />
                                    <span>
                                      {project.notionPageTitle ?? "Notion"}
                                    </span>
                                  </div>
                                )}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="py-1 whitespace-nowrap">
                            <Badge
                              variant="secondary"
                              className="text-[9px] font-normal px-1.5 py-0 gap-1">
                              {StatusIcon && (
                                <StatusIcon className="h-2.5 w-2.5 shrink-0" />
                              )}
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[9px] text-muted-foreground py-1">
                            2d
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent
                value="tasks"
                className="flex-1 min-h-0 overflow-auto border-0 mt-0 p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-0 hover:bg-transparent">
                      <TableHead className="text-[9px] py-1 h-auto font-medium min-w-[140px]">
                        Title
                      </TableHead>
                      <TableHead className="text-[9px] py-1 h-auto font-medium w-20">
                        Project
                      </TableHead>
                      <TableHead className="text-[9px] py-1 h-auto font-medium w-16">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewTasks.slice(0, 12).map((task) => (
                      <TaskRow key={task._id} task={task} />
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bottom-left: Accomplishments and Disappointments */}
          <div className="border-r border-border flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-b border-border">
                <div className="text-[10px] font-medium px-2 h-7 border-b border-border shrink-0 bg-muted/50 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                  Accomplishments
                </div>
                <div className="flex-1 min-h-0 overflow-auto px-1.5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className="text-[9px] py-1 h-auto">
                          Title
                        </TableHead>
                        <TableHead className="text-[9px] py-1 h-auto">
                          Description
                        </TableHead>
                        <TableHead className="text-[9px] py-1 h-auto w-12">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAccomplishments.map((acc) => (
                        <TableRow
                          key={acc._id}
                          className="cursor-pointer hover:bg-accent/50">
                          <TableCell className="font-medium text-[10px] py-1">
                            {acc.title}
                          </TableCell>
                          <TableCell className="text-[9px] text-muted-foreground py-1 line-clamp-1">
                            {acc.description}
                          </TableCell>
                          <TableCell className="text-[9px] text-muted-foreground py-1">
                            {acc.date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="text-[10px] font-medium px-2 h-7 border-b border-border shrink-0 bg-muted/50 flex items-center gap-1.5">
                  <XCircle className="h-3 w-3 text-red-600 shrink-0" />
                  Disappointments
                </div>
                <div className="flex-1 min-h-0 overflow-auto px-1.5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableHead className="text-[9px] py-1 h-auto">
                          Title
                        </TableHead>
                        <TableHead className="text-[9px] py-1 h-auto">
                          Description
                        </TableHead>
                        <TableHead className="text-[9px] py-1 h-auto w-12">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDisappointments.map((dis) => (
                        <TableRow
                          key={dis._id}
                          className="cursor-pointer hover:bg-accent/50">
                          <TableCell className="font-medium text-[10px] py-1">
                            {dis.title}
                          </TableCell>
                          <TableCell className="text-[9px] text-muted-foreground py-1 line-clamp-1">
                            {dis.description}
                          </TableCell>
                          <TableCell className="text-[9px] text-muted-foreground py-1">
                            {dis.date}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-right: Embeds */}
          <div className="flex flex-col min-h-0 overflow-hidden">
            <Tabs
              value={embedTab}
              onValueChange={(v) => setEmbedTab(v)}
              className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-7 shrink-0 overflow-x-auto flex-nowrap">
                {mockEmbeds.map((embed) => (
                  <TabsTrigger
                    key={embed._id}
                    value={embed._id}
                    className="group text-[10px] gap-1 rounded-none px-2.5 h-7 border-r border-border data-[state=active]:bg-muted data-[state=active]:text-foreground shrink-0">
                    <ProviderIcon
                      provider={embed.provider}
                      className="opacity-70 group-data-[state=active]:opacity-100 shrink-0"
                    />
                    <span className="truncate whitespace-nowrap">
                      {embed.title}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {mockEmbeds.map((embed) => (
                <TabsContent
                  key={embed._id}
                  value={embed._id}
                  className="flex-1 min-h-0 overflow-auto border-0 mt-0 p-0">
                  <MockEmbedContent embed={embed} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        </div>
      </div>
    </ElectronWindow>
  );
}
