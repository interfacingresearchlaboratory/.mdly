/**
 * Mock data for landing page mockups
 * Represents realistic programmer workflows
 */

export interface MockContainer {
  _id: string;
  name: string;
  description?: string;
  linearTeamId?: string;
  linearTeamUrl?: string;
  notionPageId?: string;
  notionPageUrl?: string;
  notionPageTitle?: string;
}

export interface MockProject {
  _id: string;
  title: string;
  description?: string;
  status: "active" | "paused" | "done" | "backlog" | "cancelled";
  containerId?: string;
  linearProjectId?: string;
  linearProjectUrl?: string;
  linearProjectIdentifier?: string;
  notionPageId?: string;
  notionPageUrl?: string;
  notionPageTitle?: string;
}

export interface MockTask {
  _id: string;
  title: string;
  notes?: string;
  bucket: "backlog" | "shaping" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
  projectId?: string;
  containerId?: string;
  categoryId?: string;
  routineBlockId?: string;
  linearIssueId?: string;
  linearIssueUrl?: string;
  linearIssueIdentifier?: string;
  notionPageId?: string;
  notionPageUrl?: string;
  notionPageTitle?: string;
}

/** Minimal Lexical serialized editor state (root with one paragraph). */
export function mockRoutineBlockContent(text: string): { root: unknown } {
  return {
    root: {
      children: [
        {
          type: "paragraph",
          version: 1,
          format: "",
          indent: 0,
          direction: "ltr",
          children: [
            { type: "text", version: 1, text, format: 0, mode: "normal", detail: 0, style: "" },
          ],
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

/** Multiline text to Lexical root (paragraph per line). */
export function textToLexicalState(text: string): { root: unknown } {
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

export interface MockRoutineBlock {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: number; // 0-6, for recurring blocks
  date?: string; // YYYY-MM-DD, for one-off events
  templateBlockId?: string;
  color?: string;
  blockType?: "routine" | "daily_schedule";
  isTemplateBased?: boolean;
  displayDate?: string;
  /** Optional Lexical serialized state for drawer notes/description. */
  content?: { root: unknown };
}

export interface MockReview {
  _id: string;
  date: string;
  type: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
}

export interface MockCategory {
  _id: string;
  name: string;
  entityType: "task" | "project";
}

// Containers
export const mockContainers: MockContainer[] = [
  {
    _id: "container-1",
    name: "Product",
    description: "Main product development",
    linearTeamId: "TEAM-1",
    linearTeamUrl: "https://linear.app/team/product",
    notionPageId: "product-roadmap",
    notionPageUrl: "https://notion.so/Product-roadmap-product-roadmap",
    notionPageTitle: "Product roadmap",
  },
  {
    _id: "container-2",
    name: "Personal",
    description: "Personal projects and learning",
    linearTeamId: "TEAM-2",
    linearTeamUrl: "https://linear.app/team/personal",
    notionPageId: "personal-goals",
    notionPageUrl: "https://notion.so/Personal-goals-personal-goals",
    notionPageTitle: "Personal goals",
  },
  {
    _id: "container-3",
    name: "Side Projects",
    description: "Side hustles and experiments",
    linearTeamId: "TEAM-3",
    linearTeamUrl: "https://linear.app/team/side-projects",
    notionPageId: "side-projects",
    notionPageUrl: "https://notion.so/Side-projects-side-projects",
    notionPageTitle: "Side projects",
  },
];

// Projects
export const mockProjects: MockProject[] = [
  {
    _id: "project-1",
    title: "API Refactor",
    description: "Refactor legacy API endpoints for better performance",
    status: "active",
    containerId: "container-1",
    linearProjectId: "proj-api",
    linearProjectUrl: "https://linear.app/team/project/api-refactor",
    linearProjectIdentifier: "API",
    notionPageId: "api-refactor",
    notionPageUrl: "https://notion.so/API-Refactor-api-refactor",
    notionPageTitle: "API Refactor",
  },
  {
    _id: "project-2",
    title: "Dashboard UI",
    description: "Redesign admin dashboard with new components",
    status: "active",
    containerId: "container-1",
    linearProjectId: "proj-dash",
    linearProjectUrl: "https://linear.app/team/project/dashboard-ui",
    linearProjectIdentifier: "DASH",
    notionPageId: "dashboard-ui",
    notionPageUrl: "https://notion.so/Dashboard-UI-dashboard-ui",
    notionPageTitle: "Dashboard UI",
  },
  {
    _id: "project-3",
    title: "Bug Fixes",
    description: "Critical production bugs",
    status: "active",
    containerId: "container-1",
    linearProjectId: "proj-bugs",
    linearProjectUrl: "https://linear.app/team/project/bug-fixes",
    linearProjectIdentifier: "BUG",
    notionPageId: "bug-fixes",
    notionPageUrl: "https://notion.so/Bug-tracking-bug-fixes",
    notionPageTitle: "Bug tracking",
  },
  {
    _id: "project-4",
    title: "Code Review Automation",
    description: "Build tooling for automated code reviews",
    status: "active",
    containerId: "container-1",
    linearProjectId: "proj-cra",
    linearProjectUrl: "https://linear.app/team/project/code-review-automation",
    linearProjectIdentifier: "CRA",
    notionPageId: "code-review",
    notionPageUrl: "https://notion.so/Code-Review-code-review",
    notionPageTitle: "Code Review",
  },
  {
    _id: "project-5",
    title: "Learning TypeScript",
    description: "Deep dive into advanced TypeScript patterns",
    status: "active",
    containerId: "container-2",
    notionPageId: "learning-ts",
    notionPageUrl: "https://notion.so/Learning-TypeScript-learning-ts",
    notionPageTitle: "Learning TypeScript",
  },
  {
    _id: "project-7",
    title: "Health & Fitness",
    description: "Workout routines and habit tracking",
    status: "active",
    containerId: "container-2",
    notionPageId: "health-fitness",
    notionPageUrl: "https://notion.so/Health-Fitness-health-fitness",
    notionPageTitle: "Health & Fitness",
  },
  {
    _id: "project-8",
    title: "Reading List",
    description: "Book notes and reading goals",
    status: "active",
    containerId: "container-2",
    notionPageId: "reading-list",
    notionPageUrl: "https://notion.so/Reading-List-reading-list",
    notionPageTitle: "Reading List",
  },
  {
    _id: "project-6",
    title: "Portfolio Site",
    description: "Build personal portfolio website",
    status: "active",
    containerId: "container-3",
    linearProjectId: "proj-portfolio",
    linearProjectUrl: "https://linear.app/team/project/portfolio-site",
    linearProjectIdentifier: "PORT",
    notionPageId: "portfolio-site",
    notionPageUrl: "https://notion.so/Portfolio-Site-portfolio-site",
    notionPageTitle: "Portfolio Site",
  },
  {
    _id: "project-9",
    title: "Open Source",
    description: "Contributions and side libraries",
    status: "active",
    containerId: "container-3",
    linearProjectId: "proj-os",
    linearProjectUrl: "https://linear.app/team/project/open-source",
    linearProjectIdentifier: "OS",
    notionPageId: "open-source",
    notionPageUrl: "https://notion.so/Open-Source-open-source",
    notionPageTitle: "Open Source",
  },
  {
    _id: "project-10",
    title: "Tech Blog",
    description: "Technical writing and tutorials",
    status: "active",
    containerId: "container-3",
    notionPageId: "tech-blog",
    notionPageUrl: "https://notion.so/Tech-Blog-tech-blog",
    notionPageTitle: "Tech Blog",
  },
  {
    _id: "project-marketing",
    title: "Marketing",
    description: "Launch, content, and growth",
    status: "active",
    containerId: "container-1",
    notionPageId: "marketing",
    notionPageTitle: "Marketing",
  },
  {
    _id: "project-admin",
    title: "Admin",
    description: "Legal, finance, and operations",
    status: "active",
    containerId: "container-1",
    notionPageId: "admin",
    notionPageTitle: "Admin",
  },
];

// Categories
export const mockCategories: MockCategory[] = [
  { _id: "category-1", name: "Frontend", entityType: "task" },
  { _id: "category-2", name: "Backend", entityType: "task" },
  { _id: "category-3", name: "DevOps", entityType: "task" },
  { _id: "category-4", name: "Documentation", entityType: "task" },
  { _id: "category-marketing", name: "Marketing", entityType: "task" },
  { _id: "category-admin", name: "Admin", entityType: "task" },
];

// Tasks
export const mockTasks: MockTask[] = [
  // Shaping tasks
  {
    _id: "task-1",
    title: "Design API endpoint structure",
    notes: "Plan out new REST endpoints",
    bucket: "shaping",
    projectId: "project-1",
    categoryId: "category-2",
    routineBlockId: "routine-28",
    linearIssueId: "API-1",
    linearIssueUrl: "https://linear.app/team/issue/API-1",
    linearIssueIdentifier: "API-1",
  },
  {
    _id: "task-2",
    title: "Research component library options",
    notes: "Compare shadcn vs radix vs custom",
    bucket: "shaping",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-28",
    linearIssueId: "DASH-1",
    linearIssueUrl: "https://linear.app/team/issue/DASH-1",
    linearIssueIdentifier: "DASH-1",
  },
  {
    _id: "task-shape-unlinked",
    title: "Draft API error response format",
    bucket: "shaping",
    projectId: "project-1",
    categoryId: "category-2",
    linearIssueId: "API-ERR",
    linearIssueUrl: "https://linear.app/team/issue/API-ERR",
    linearIssueIdentifier: "API-ERR",
  },
  // Founder-style: shaping across dev, marketing, admin
  {
    _id: "task-shape-marketing",
    title: "Outline launch blog post",
    bucket: "shaping",
    projectId: "project-marketing",
    categoryId: "category-marketing",
    notionPageId: "launch-blog-outline",
    notionPageUrl: "https://notion.so/Marketing-launch-blog-outline",
    notionPageTitle: "Launch blog outline",
  },
  {
    _id: "task-shape-admin",
    title: "Q1 board deck structure",
    bucket: "shaping",
    projectId: "project-admin",
    categoryId: "category-admin",
    notionPageId: "q1-board-deck",
    notionPageUrl: "https://notion.so/Admin-q1-board-deck",
    notionPageTitle: "Q1 board deck",
  },
  // Todo tasks
  {
    _id: "task-todo-unlinked",
    title: "Review PR #247",
    bucket: "todo",
    projectId: "project-2",
    categoryId: "category-1",
    linearIssueId: "DASH-247",
    linearIssueUrl: "https://linear.app/team/issue/DASH-247",
    linearIssueIdentifier: "DASH-247",
  },
  // Founder-style: todo across dev, marketing, admin
  {
    _id: "task-todo-dev",
    title: "Ship login flow to staging",
    bucket: "todo",
    projectId: "project-1",
    categoryId: "category-2",
    linearIssueId: "API-LOGIN",
    linearIssueUrl: "https://linear.app/team/issue/API-LOGIN",
    linearIssueIdentifier: "API-LOGIN",
  },
  {
    _id: "task-todo-marketing",
    title: "Draft launch tweet thread",
    bucket: "todo",
    projectId: "project-marketing",
    categoryId: "category-marketing",
    notionPageId: "launch-tweets",
    notionPageUrl: "https://notion.so/Marketing-launch-tweets",
    notionPageTitle: "Launch tweet thread",
  },
  {
    _id: "task-todo-marketing-2",
    title: "Update landing page copy",
    bucket: "todo",
    projectId: "project-marketing",
    categoryId: "category-marketing",
    notionPageId: "landing-copy",
    notionPageUrl: "https://notion.so/Marketing-landing-copy",
    notionPageTitle: "Landing page copy",
  },
  {
    _id: "task-todo-admin",
    title: "Submit Q1 expenses",
    bucket: "todo",
    projectId: "project-admin",
    categoryId: "category-admin",
    notionPageId: "q1-expenses",
    notionPageUrl: "https://notion.so/Admin-q1-expenses",
    notionPageTitle: "Q1 expenses",
  },
  {
    _id: "task-todo-admin-2",
    title: "Schedule board meeting",
    bucket: "todo",
    projectId: "project-admin",
    categoryId: "category-admin",
    notionPageId: "board-meeting",
    notionPageUrl: "https://notion.so/Admin-board-meeting",
    notionPageTitle: "Board meeting",
  },
  {
    _id: "task-3",
    title: "Fix memory leak in data processing",
    notes: "Occurs after 2+ hours of runtime",
    bucket: "todo",
    projectId: "project-3",
    categoryId: "category-2",
    routineBlockId: "routine-6",
    linearIssueId: "BUG-123",
    linearIssueUrl: "https://linear.app/team/issue/BUG-123",
    linearIssueIdentifier: "BUG-123",
  },
  {
    _id: "task-4",
    title: "Add error boundaries to dashboard",
    bucket: "todo",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-8",
    linearIssueId: "DASH-2",
    linearIssueUrl: "https://linear.app/team/issue/DASH-2",
    linearIssueIdentifier: "DASH-2",
  },
  {
    _id: "task-5",
    title: "Write unit tests for auth middleware",
    bucket: "todo",
    projectId: "project-1",
    categoryId: "category-2",
    routineBlockId: "routine-3",
    linearIssueId: "API-2",
    linearIssueUrl: "https://linear.app/team/issue/API-2",
    linearIssueIdentifier: "API-2",
  },
  // In Progress
  {
    _id: "task-6",
    title: "Implement user authentication flow",
    notes: "Using NextAuth.js",
    bucket: "in_progress",
    projectId: "project-1",
    categoryId: "category-2",
    routineBlockId: "routine-1",
    linearIssueId: "API-3",
    linearIssueUrl: "https://linear.app/team/issue/API-3",
    linearIssueIdentifier: "API-3",
  },
  {
    _id: "task-7",
    title: "Build dashboard sidebar component",
    bucket: "in_progress",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-2",
    linearIssueId: "DASH-3",
    linearIssueUrl: "https://linear.app/team/issue/DASH-3",
    linearIssueIdentifier: "DASH-3",
  },
  // In Review
  {
    _id: "task-8",
    title: "Refactor database queries for performance",
    notes: "Added indexes, optimized joins",
    bucket: "in_review",
    projectId: "project-1",
    categoryId: "category-2",
    routineBlockId: "routine-18",
    linearIssueId: "API-4",
    linearIssueUrl: "https://linear.app/team/issue/API-4",
    linearIssueIdentifier: "API-4",
  },
  // Done
  {
    _id: "task-9",
    title: "Set up CI/CD pipeline",
    bucket: "done",
    projectId: "project-4",
    categoryId: "category-3",
    routineBlockId: "routine-20",
    linearIssueId: "CRA-1",
    linearIssueUrl: "https://linear.app/team/issue/CRA-1",
    linearIssueIdentifier: "CRA-1",
  },
  {
    _id: "task-10",
    title: "Document API endpoints",
    bucket: "done",
    projectId: "project-1",
    categoryId: "category-4",
    routineBlockId: "routine-15",
    linearIssueId: "API-42",
    linearIssueUrl: "https://linear.app/team/issue/API-42",
    linearIssueIdentifier: "API-42",
  },
  // Backlog
  {
    _id: "task-11",
    title: "Add dark mode support",
    bucket: "backlog",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-26",
    linearIssueId: "DASH-4",
    linearIssueUrl: "https://linear.app/team/issue/DASH-4",
    linearIssueIdentifier: "DASH-4",
  },
  {
    _id: "task-14",
    title: "Portfolio hero section",
    bucket: "in_progress",
    projectId: "project-6",
    categoryId: "category-1",
    routineBlockId: "routine-3e",
    linearIssueId: "PORT-1",
    linearIssueUrl: "https://linear.app/team/issue/PORT-1",
    linearIssueIdentifier: "PORT-1",
  },
  {
    _id: "task-12",
    title: "Implement search functionality",
    bucket: "backlog",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-13",
    linearIssueId: "DASH-5",
    linearIssueUrl: "https://linear.app/team/issue/DASH-5",
    linearIssueIdentifier: "DASH-5",
  },
  {
    _id: "task-13",
    title: "Optimize bundle size",
    bucket: "backlog",
    projectId: "project-2",
    categoryId: "category-1",
    routineBlockId: "routine-25",
    linearIssueId: "DASH-6",
    linearIssueUrl: "https://linear.app/team/issue/DASH-6",
    linearIssueIdentifier: "DASH-6",
  },
  // routine-1 Deep Work Mon - add 3 more
  { _id: "task-15", title: "OAuth provider integration", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-1", linearIssueId: "API-5", linearIssueUrl: "https://linear.app/team/issue/API-5", linearIssueIdentifier: "API-5" },
  { _id: "task-16", title: "Session persistence layer", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-1", linearIssueId: "API-6", linearIssueUrl: "https://linear.app/team/issue/API-6", linearIssueIdentifier: "API-6" },
  { _id: "task-17", title: "Password reset flow", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-1", linearIssueId: "API-7", linearIssueUrl: "https://linear.app/team/issue/API-7", linearIssueIdentifier: "API-7" },
  // routine-2 Team Standup Mon - add 3 more
  { _id: "task-18", title: "Sprint blockers list", bucket: "in_progress", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-2", linearIssueId: "BUG-1", linearIssueUrl: "https://linear.app/team/issue/BUG-1", linearIssueIdentifier: "BUG-1" },
  { _id: "task-19", title: "Deployment status update", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-2", linearIssueId: "CRA-2", linearIssueUrl: "https://linear.app/team/issue/CRA-2", linearIssueIdentifier: "CRA-2" },
  { _id: "task-20", title: "API migration progress", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-2", linearIssueId: "API-8", linearIssueUrl: "https://linear.app/team/issue/API-8", linearIssueIdentifier: "API-8" },
  // routine-3 Coding Block Mon - add 3 more
  { _id: "task-21", title: "Auth middleware tests", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-3", linearIssueId: "API-9", linearIssueUrl: "https://linear.app/team/issue/API-9", linearIssueIdentifier: "API-9" },
  { _id: "task-22", title: "JWT validation logic", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-3", linearIssueId: "API-10", linearIssueUrl: "https://linear.app/team/issue/API-10", linearIssueIdentifier: "API-10" },
  { _id: "task-23", title: "Role-based access helpers", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-3", linearIssueId: "API-11", linearIssueUrl: "https://linear.app/team/issue/API-11", linearIssueIdentifier: "API-11" },
  // routine-5 Afternoon Focus Mon - add 4
  { _id: "task-24", title: "Dashboard data fetch", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-5", linearIssueId: "DASH-7", linearIssueUrl: "https://linear.app/team/issue/DASH-7", linearIssueIdentifier: "DASH-7" },
  { _id: "task-25", title: "Chart component props", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-5", linearIssueId: "DASH-8", linearIssueUrl: "https://linear.app/team/issue/DASH-8", linearIssueIdentifier: "DASH-8" },
  { _id: "task-26", title: "Loading state UX", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-5", linearIssueId: "DASH-9", linearIssueUrl: "https://linear.app/team/issue/DASH-9", linearIssueIdentifier: "DASH-9" },
  { _id: "task-27", title: "Cache invalidation", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-5", linearIssueId: "API-12", linearIssueUrl: "https://linear.app/team/issue/API-12", linearIssueIdentifier: "API-12" },
  // routine-6 Deep Work Tue - add 3 more
  { _id: "task-28", title: "Profile API tests", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-6", linearIssueId: "API-13", linearIssueUrl: "https://linear.app/team/issue/API-13", linearIssueIdentifier: "API-13" },
  { _id: "task-29", title: "Memory profiler setup", bucket: "in_progress", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-6", linearIssueId: "BUG-2", linearIssueUrl: "https://linear.app/team/issue/BUG-2", linearIssueIdentifier: "BUG-2" },
  { _id: "task-30", title: "Heap snapshot analysis", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-6", linearIssueId: "BUG-3", linearIssueUrl: "https://linear.app/team/issue/BUG-3", linearIssueIdentifier: "BUG-3" },
  // routine-7 Team Standup Tue - add 4
  { _id: "task-31", title: "Bug triage notes", bucket: "in_progress", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-7", linearIssueId: "BUG-4", linearIssueUrl: "https://linear.app/team/issue/BUG-4", linearIssueIdentifier: "BUG-4" },
  { _id: "task-32", title: "PR review queue", bucket: "todo", projectId: "project-4", categoryId: "category-4", routineBlockId: "routine-7", linearIssueId: "CRA-3", linearIssueUrl: "https://linear.app/team/issue/CRA-3", linearIssueIdentifier: "CRA-3" },
  { _id: "task-33", title: "Standup action items", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-7", linearIssueId: "API-14", linearIssueUrl: "https://linear.app/team/issue/API-14", linearIssueIdentifier: "API-14" },
  { _id: "task-34", title: "Sprint velocity check", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-7", linearIssueId: "DASH-10", linearIssueUrl: "https://linear.app/team/issue/DASH-10", linearIssueIdentifier: "DASH-10" },
  // routine-8 Coding Block Tue - add 3 more
  { _id: "task-35", title: "Error boundary wrapper", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-8", linearIssueId: "DASH-11", linearIssueUrl: "https://linear.app/team/issue/DASH-11", linearIssueIdentifier: "DASH-11" },
  { _id: "task-36", title: "Fallback UI component", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-8", linearIssueId: "DASH-12", linearIssueUrl: "https://linear.app/team/issue/DASH-12", linearIssueIdentifier: "DASH-12" },
  { _id: "task-37", title: "Crash reporting hook", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-8", linearIssueId: "DASH-13", linearIssueUrl: "https://linear.app/team/issue/DASH-13", linearIssueIdentifier: "DASH-13" },
  // routine-10 Afternoon Focus Tue - add 4
  { _id: "task-38", title: "Dashboard layout grid", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-10", linearIssueId: "DASH-14", linearIssueUrl: "https://linear.app/team/issue/DASH-14", linearIssueIdentifier: "DASH-14" },
  { _id: "task-39", title: "Responsive breakpoints", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-10", linearIssueId: "DASH-15", linearIssueUrl: "https://linear.app/team/issue/DASH-15", linearIssueIdentifier: "DASH-15" },
  { _id: "task-40", title: "Mobile nav drawer", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-10", linearIssueId: "DASH-16", linearIssueUrl: "https://linear.app/team/issue/DASH-16", linearIssueIdentifier: "DASH-16" },
  { _id: "task-41", title: "API rate limit config", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-10", linearIssueId: "API-15", linearIssueUrl: "https://linear.app/team/issue/API-15", linearIssueIdentifier: "API-15" },
  // routine-11 Deep Work Wed - add 4
  { _id: "task-42", title: "GraphQL schema draft", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-11", linearIssueId: "API-16", linearIssueUrl: "https://linear.app/team/issue/API-16", linearIssueIdentifier: "API-16" },
  { _id: "task-43", title: "Resolver stubs", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-11", linearIssueId: "API-17", linearIssueUrl: "https://linear.app/team/issue/API-17", linearIssueIdentifier: "API-17" },
  { _id: "task-44", title: "DataLoader setup", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-11", linearIssueId: "API-18", linearIssueUrl: "https://linear.app/team/issue/API-18", linearIssueIdentifier: "API-18" },
  { _id: "task-45", title: "N+1 query fix", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-11", linearIssueId: "API-19", linearIssueUrl: "https://linear.app/team/issue/API-19", linearIssueIdentifier: "API-19" },
  // routine-12 Team Standup Wed - add 4
  { _id: "task-46", title: "Mid-sprint sync", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-12", linearIssueId: "DASH-17", linearIssueUrl: "https://linear.app/team/issue/DASH-17", linearIssueIdentifier: "DASH-17" },
  { _id: "task-47", title: "Design review prep", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-12", linearIssueId: "DASH-18", linearIssueUrl: "https://linear.app/team/issue/DASH-18", linearIssueIdentifier: "DASH-18" },
  { _id: "task-48", title: "Blockers escalation", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-12", linearIssueId: "BUG-5", linearIssueUrl: "https://linear.app/team/issue/BUG-5", linearIssueIdentifier: "BUG-5" },
  { _id: "task-49", title: "Cross-team dependency", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-12", linearIssueId: "CRA-4", linearIssueUrl: "https://linear.app/team/issue/CRA-4", linearIssueIdentifier: "CRA-4" },
  // routine-13 Coding Block Wed - add 3 more
  { _id: "task-50", title: "Search input component", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-13", linearIssueId: "DASH-19", linearIssueUrl: "https://linear.app/team/issue/DASH-19", linearIssueIdentifier: "DASH-19" },
  { _id: "task-51", title: "Debounce hook", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-13", linearIssueId: "DASH-20", linearIssueUrl: "https://linear.app/team/issue/DASH-20", linearIssueIdentifier: "DASH-20" },
  { _id: "task-52", title: "Search results list", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-13", linearIssueId: "DASH-21", linearIssueUrl: "https://linear.app/team/issue/DASH-21", linearIssueIdentifier: "DASH-21" },
  // routine-15 Afternoon Focus Wed - add 3 more
  { _id: "task-53", title: "API README sections", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-15", linearIssueId: "API-20", linearIssueUrl: "https://linear.app/team/issue/API-20", linearIssueIdentifier: "API-20" },
  { _id: "task-54", title: "OpenAPI spec update", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-15", linearIssueId: "API-21", linearIssueUrl: "https://linear.app/team/issue/API-21", linearIssueIdentifier: "API-21" },
  { _id: "task-55", title: "Example requests", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-15", linearIssueId: "API-22", linearIssueUrl: "https://linear.app/team/issue/API-22", linearIssueIdentifier: "API-22" },
  // routine-16 Deep Work Thu - add 4
  { _id: "task-56", title: "Batch processing refactor", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-16", linearIssueId: "API-23", linearIssueUrl: "https://linear.app/team/issue/API-23", linearIssueIdentifier: "API-23" },
  { _id: "task-57", title: "Queue worker setup", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-16", linearIssueId: "API-24", linearIssueUrl: "https://linear.app/team/issue/API-24", linearIssueIdentifier: "API-24" },
  { _id: "task-58", title: "Retry logic", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-16", linearIssueId: "API-25", linearIssueUrl: "https://linear.app/team/issue/API-25", linearIssueIdentifier: "API-25" },
  { _id: "task-59", title: "Dead letter handling", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-16", linearIssueId: "API-26", linearIssueUrl: "https://linear.app/team/issue/API-26", linearIssueIdentifier: "API-26" },
  // routine-17 Team Standup Thu - add 4
  { _id: "task-60", title: "Code review roundup", bucket: "in_progress", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-17", linearIssueId: "CRA-5", linearIssueUrl: "https://linear.app/team/issue/CRA-5", linearIssueIdentifier: "CRA-5" },
  { _id: "task-61", title: "PR merge status", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-17", linearIssueId: "API-27", linearIssueUrl: "https://linear.app/team/issue/API-27", linearIssueIdentifier: "API-27" },
  { _id: "task-62", title: "Deploy pipeline status", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-17", linearIssueId: "CRA-6", linearIssueUrl: "https://linear.app/team/issue/CRA-6", linearIssueIdentifier: "CRA-6" },
  { _id: "task-63", title: "Staging verification", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-17", linearIssueId: "DASH-22", linearIssueUrl: "https://linear.app/team/issue/DASH-22", linearIssueIdentifier: "DASH-22" },
  // routine-18 Code Review Thu - add 3 more
  { _id: "task-64", title: "PR #247 comments", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-18", linearIssueId: "API-28", linearIssueUrl: "https://linear.app/team/issue/API-28", linearIssueIdentifier: "API-28" },
  { _id: "task-65", title: "PR #248 approval", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-18", linearIssueId: "DASH-23", linearIssueUrl: "https://linear.app/team/issue/DASH-23", linearIssueIdentifier: "DASH-23" },
  { _id: "task-66", title: "PR #249 feedback", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-18", linearIssueId: "BUG-6", linearIssueUrl: "https://linear.app/team/issue/BUG-6", linearIssueIdentifier: "BUG-6" },
  // routine-20 Afternoon Focus Thu - add 3 more
  { _id: "task-67", title: "GitHub Actions workflow", bucket: "in_progress", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-20", linearIssueId: "CRA-7", linearIssueUrl: "https://linear.app/team/issue/CRA-7", linearIssueIdentifier: "CRA-7" },
  { _id: "task-68", title: "Deploy secrets rotation", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-20", linearIssueId: "CRA-8", linearIssueUrl: "https://linear.app/team/issue/CRA-8", linearIssueIdentifier: "CRA-8" },
  { _id: "task-69", title: "E2E test config", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-20", linearIssueId: "CRA-9", linearIssueUrl: "https://linear.app/team/issue/CRA-9", linearIssueIdentifier: "CRA-9" },
  // routine-21 Deep Work Fri - add 4
  { _id: "task-70", title: "Week summary notes", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-21", linearIssueId: "API-29", linearIssueUrl: "https://linear.app/team/issue/API-29", linearIssueIdentifier: "API-29", notionPageId: "jkl012", notionPageUrl: "https://notion.so/Week-summary-jkl012", notionPageTitle: "Week summary" },
  { _id: "task-71", title: "Tech debt list", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-21", linearIssueId: "DASH-24", linearIssueUrl: "https://linear.app/team/issue/DASH-24", linearIssueIdentifier: "DASH-24" },
  { _id: "task-72", title: "Sprint completion check", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-21", linearIssueId: "BUG-7", linearIssueUrl: "https://linear.app/team/issue/BUG-7", linearIssueIdentifier: "BUG-7" },
  { _id: "task-73", title: "Next week prep", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-21", linearIssueId: "CRA-10", linearIssueUrl: "https://linear.app/team/issue/CRA-10", linearIssueIdentifier: "CRA-10" },
  // routine-22 Team Standup Fri - add 4
  { _id: "task-74", title: "Friday wrap-up sync", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-22", linearIssueId: "API-30", linearIssueUrl: "https://linear.app/team/issue/API-30", linearIssueIdentifier: "API-30" },
  { _id: "task-75", title: "Week wins recap", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-22", linearIssueId: "DASH-25", linearIssueUrl: "https://linear.app/team/issue/DASH-25", linearIssueIdentifier: "DASH-25" },
  { _id: "task-76", title: "Monday priorities", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-22", linearIssueId: "BUG-8", linearIssueUrl: "https://linear.app/team/issue/BUG-8", linearIssueIdentifier: "BUG-8" },
  { _id: "task-77", title: "Weekend on-call handoff", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-22", linearIssueId: "CRA-11", linearIssueUrl: "https://linear.app/team/issue/CRA-11", linearIssueIdentifier: "CRA-11" },
  // routine-23 Coding Block Fri - add 4
  { _id: "task-78", title: "Quick bug fix BUG-124", bucket: "in_progress", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-23", linearIssueId: "BUG-124", linearIssueUrl: "https://linear.app/team/issue/BUG-124", linearIssueIdentifier: "BUG-124" },
  { _id: "task-79", title: "Hotfix deployment", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-23", linearIssueId: "BUG-9", linearIssueUrl: "https://linear.app/team/issue/BUG-9", linearIssueIdentifier: "BUG-9" },
  { _id: "task-80", title: "Log level config", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-23", linearIssueId: "API-31", linearIssueUrl: "https://linear.app/team/issue/API-31", linearIssueIdentifier: "API-31" },
  { _id: "task-81", title: "Env var cleanup", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-23", linearIssueId: "DASH-26", linearIssueUrl: "https://linear.app/team/issue/DASH-26", linearIssueIdentifier: "DASH-26" },
  // routine-25 Weekly Wrap-up Fri - add 3 more
  { _id: "task-82", title: "Sprint report draft", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-25", linearIssueId: "API-32", linearIssueUrl: "https://linear.app/team/issue/API-32", linearIssueIdentifier: "API-32" },
  { _id: "task-83", title: "Changelog update", bucket: "todo", projectId: "project-2", categoryId: "category-4", routineBlockId: "routine-25", linearIssueId: "DASH-27", linearIssueUrl: "https://linear.app/team/issue/DASH-27", linearIssueIdentifier: "DASH-27" },
  { _id: "task-84", title: "Release notes", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-25", linearIssueId: "BUG-10", linearIssueUrl: "https://linear.app/team/issue/BUG-10", linearIssueIdentifier: "BUG-10" },
  // routine-26 Personal Projects Sat - add 3 more
  { _id: "task-85", title: "Portfolio projects grid", bucket: "todo", projectId: "project-6", categoryId: "category-1", routineBlockId: "routine-26", linearIssueId: "PORT-2", linearIssueUrl: "https://linear.app/team/issue/PORT-2", linearIssueIdentifier: "PORT-2" },
  { _id: "task-86", title: "Theme toggle component", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-26", linearIssueId: "DASH-28", linearIssueUrl: "https://linear.app/team/issue/DASH-28", linearIssueIdentifier: "DASH-28" },
  { _id: "task-87", title: "About page copy", bucket: "todo", projectId: "project-6", categoryId: "category-4", routineBlockId: "routine-26", linearIssueId: "PORT-3", linearIssueUrl: "https://linear.app/team/issue/PORT-3", linearIssueIdentifier: "PORT-3" },
  // routine-27 Learning Sat - add 4
  { _id: "task-88", title: "TS generics deep dive", bucket: "in_progress", projectId: "project-5", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "LS-1", linearIssueUrl: "https://linear.app/team/issue/LS-1", linearIssueIdentifier: "LS-1", notionPageId: "ts-generics", notionPageUrl: "https://notion.so/TS-generics-deep-dive-ts-generics", notionPageTitle: "TS generics notes" },
  { _id: "task-89", title: "Utility types notes", bucket: "todo", projectId: "project-5", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "LS-2", linearIssueUrl: "https://linear.app/team/issue/LS-2", linearIssueIdentifier: "LS-2" },
  { _id: "task-90", title: "Mapped types exercises", bucket: "todo", projectId: "project-5", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "LS-3", linearIssueUrl: "https://linear.app/team/issue/LS-3", linearIssueIdentifier: "LS-3" },
  { _id: "task-91", title: "Conditional types", bucket: "todo", projectId: "project-5", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "LS-4", linearIssueUrl: "https://linear.app/team/issue/LS-4", linearIssueIdentifier: "LS-4" },
  // routine-28 Week Planning Sun - add 2 more
  { _id: "task-92", title: "Priority stack rank", bucket: "shaping", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-28", linearIssueId: "API-33", linearIssueUrl: "https://linear.app/team/issue/API-33", linearIssueIdentifier: "API-33" },
  { _id: "task-93", title: "Capacity planning", bucket: "shaping", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-28", linearIssueId: "DASH-29", linearIssueUrl: "https://linear.app/team/issue/DASH-29", linearIssueIdentifier: "DASH-29" },
  // Personal - Health & Fitness (project-7)
  { _id: "task-100", title: "Set up workout routine", bucket: "todo", projectId: "project-7", categoryId: "category-4", routineBlockId: "routine-26", linearIssueId: "HF-1", linearIssueUrl: "https://linear.app/team/issue/HF-1", linearIssueIdentifier: "HF-1", notionPageId: "workout-routine", notionPageUrl: "https://notion.so/Workout-routine-workout-routine", notionPageTitle: "Workout routine" },
  { _id: "task-101", title: "Track sleep schedule", bucket: "in_progress", projectId: "project-7", categoryId: "category-4", routineBlockId: "routine-26", linearIssueId: "HF-2", linearIssueUrl: "https://linear.app/team/issue/HF-2", linearIssueIdentifier: "HF-2" },
  { _id: "task-102", title: "Meal prep for week", bucket: "backlog", projectId: "project-7", categoryId: "category-4", routineBlockId: "routine-26", linearIssueId: "HF-3", linearIssueUrl: "https://linear.app/team/issue/HF-3", linearIssueIdentifier: "HF-3" },
  // Personal - Reading List (project-8)
  { _id: "task-103", title: "Finish TypeScript handbook notes", bucket: "in_progress", projectId: "project-8", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "RL-1", linearIssueUrl: "https://linear.app/team/issue/RL-1", linearIssueIdentifier: "RL-1", notionPageId: "ts-handbook", notionPageUrl: "https://notion.so/TypeScript-handbook-ts-handbook", notionPageTitle: "TS handbook notes" },
  { _id: "task-104", title: "Add Design of Everyday Things", bucket: "todo", projectId: "project-8", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "RL-2", linearIssueUrl: "https://linear.app/team/issue/RL-2", linearIssueIdentifier: "RL-2" },
  { _id: "task-105", title: "Update reading log", bucket: "done", projectId: "project-8", categoryId: "category-4", routineBlockId: "routine-27", linearIssueId: "RL-3", linearIssueUrl: "https://linear.app/team/issue/RL-3", linearIssueIdentifier: "RL-3" },
  // Side Projects - Open Source (project-9)
  { _id: "task-106", title: "PR for dnd-kit docs fix", bucket: "in_review", projectId: "project-9", categoryId: "category-4", routineBlockId: "routine-3e", linearIssueId: "OS-12", linearIssueUrl: "https://linear.app/team/issue/OS-12", linearIssueIdentifier: "OS-12" },
  { _id: "task-107", title: "Publish small utility package", bucket: "shaping", projectId: "project-9", categoryId: "category-2", routineBlockId: "routine-3e", linearIssueId: "OS-13", linearIssueUrl: "https://linear.app/team/issue/OS-13", linearIssueIdentifier: "OS-13" },
  { _id: "task-108", title: "Review open issues", bucket: "todo", projectId: "project-9", categoryId: "category-4", routineBlockId: "routine-3e", linearIssueId: "OS-14", linearIssueUrl: "https://linear.app/team/issue/OS-14", linearIssueIdentifier: "OS-14" },
  // Side Projects - Tech Blog (project-10)
  { _id: "task-109", title: "Draft React Server Components post", bucket: "in_progress", projectId: "project-10", categoryId: "category-4", routineBlockId: "routine-3e", linearIssueId: "TB-1", linearIssueUrl: "https://linear.app/team/issue/TB-1", linearIssueIdentifier: "TB-1", notionPageId: "rsc-post", notionPageUrl: "https://notion.so/RSC-post-draft-rsc-post", notionPageTitle: "RSC post draft" },
  { _id: "task-110", title: "Add syntax highlighting config", bucket: "todo", projectId: "project-10", categoryId: "category-1", routineBlockId: "routine-3e", linearIssueId: "TB-2", linearIssueUrl: "https://linear.app/team/issue/TB-2", linearIssueIdentifier: "TB-2" },
  { _id: "task-111", title: "Publish last week's post", bucket: "done", projectId: "project-10", categoryId: "category-4", routineBlockId: "routine-3e", linearIssueId: "TB-3", linearIssueUrl: "https://linear.app/team/issue/TB-3", linearIssueIdentifier: "TB-3" },
  // routine-28g Prep for week Sun - add 4
  { _id: "task-94", title: "Calendar block setup", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-28g", linearIssueId: "API-34", linearIssueUrl: "https://linear.app/team/issue/API-34", linearIssueIdentifier: "API-34" },
  { _id: "task-95", title: "Task migration", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-28g", linearIssueId: "DASH-30", linearIssueUrl: "https://linear.app/team/issue/DASH-30", linearIssueIdentifier: "DASH-30" },
  { _id: "task-96", title: "Routine sync", bucket: "todo", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-28g", linearIssueId: "CRA-12", linearIssueUrl: "https://linear.app/team/issue/CRA-12", linearIssueIdentifier: "CRA-12" },
  { _id: "task-97", title: "Monday AM checklist", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-28g", linearIssueId: "API-35", linearIssueUrl: "https://linear.app/team/issue/API-35", linearIssueIdentifier: "API-35" },
  // routine-3e Side project Wed eve - add 2 more
  { _id: "task-98", title: "Portfolio contact form", bucket: "todo", projectId: "project-6", categoryId: "category-1", routineBlockId: "routine-3e", linearIssueId: "PORT-4", linearIssueUrl: "https://linear.app/team/issue/PORT-4", linearIssueIdentifier: "PORT-4" },
  { _id: "task-99", title: "Animation tweaks", bucket: "todo", projectId: "project-6", categoryId: "category-1", routineBlockId: "routine-3e", linearIssueId: "PORT-5", linearIssueUrl: "https://linear.app/team/issue/PORT-5", linearIssueIdentifier: "PORT-5" },
  // Product - additional tasks
  { _id: "task-112", title: "API versioning strategy", bucket: "backlog", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-28", linearIssueId: "API-36", linearIssueUrl: "https://linear.app/team/issue/API-36", linearIssueIdentifier: "API-36" },
  { _id: "task-113", title: "Deprecation timeline", bucket: "backlog", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-28", linearIssueId: "API-37", linearIssueUrl: "https://linear.app/team/issue/API-37", linearIssueIdentifier: "API-37" },
  { _id: "task-114", title: "Legacy endpoint cleanup", bucket: "backlog", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-28", linearIssueId: "BUG-11", linearIssueUrl: "https://linear.app/team/issue/BUG-11", linearIssueIdentifier: "BUG-11" },
  { _id: "task-115", title: "Automated review rules", bucket: "shaping", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-28", linearIssueId: "CRA-13", linearIssueUrl: "https://linear.app/team/issue/CRA-13", linearIssueIdentifier: "CRA-13" },
  { _id: "task-116", title: "Rate limit rollout plan", bucket: "shaping", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-28", linearIssueId: "API-38", linearIssueUrl: "https://linear.app/team/issue/API-38", linearIssueIdentifier: "API-38" },
  { _id: "task-117", title: "Table pagination", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-10", linearIssueId: "DASH-31", linearIssueUrl: "https://linear.app/team/issue/DASH-31", linearIssueIdentifier: "DASH-31" },
  { _id: "task-118", title: "Reproduce prod bug BUG-130", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-7", linearIssueId: "BUG-130", linearIssueUrl: "https://linear.app/team/issue/BUG-130", linearIssueIdentifier: "BUG-130" },
  { _id: "task-119", title: "Review checklist template", bucket: "todo", projectId: "project-4", categoryId: "category-4", routineBlockId: "routine-7", linearIssueId: "CRA-14", linearIssueUrl: "https://linear.app/team/issue/CRA-14", linearIssueIdentifier: "CRA-14" },
  { _id: "task-120", title: "Sort and filter UX", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-13", linearIssueId: "DASH-32", linearIssueUrl: "https://linear.app/team/issue/DASH-32", linearIssueIdentifier: "DASH-32" },
  { _id: "task-121", title: "Database migration script", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-16", linearIssueId: "API-58", linearIssueUrl: "https://linear.app/team/issue/API-58", linearIssueIdentifier: "API-58" },
  { _id: "task-122", title: "Settings page layout", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-10", linearIssueId: "DASH-33", linearIssueUrl: "https://linear.app/team/issue/DASH-33", linearIssueIdentifier: "DASH-33" },
  { _id: "task-123", title: "User preferences API", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "routine-1", linearIssueId: "API-39", linearIssueUrl: "https://linear.app/team/issue/API-39", linearIssueIdentifier: "API-39" },
  { _id: "task-124", title: "PR #252 merge", bucket: "in_review", projectId: "project-4", categoryId: "category-3", routineBlockId: "routine-18", linearIssueId: "CRA-15", linearIssueUrl: "https://linear.app/team/issue/CRA-15", linearIssueIdentifier: "CRA-15" },
  { _id: "task-125", title: "Dashboard accessibility audit", bucket: "in_review", projectId: "project-2", categoryId: "category-1", routineBlockId: "routine-17", linearIssueId: "DASH-34", linearIssueUrl: "https://linear.app/team/issue/DASH-34", linearIssueIdentifier: "DASH-34" },
  { _id: "task-126", title: "API docs v2 publish", bucket: "done", projectId: "project-1", categoryId: "category-4", routineBlockId: "routine-22", linearIssueId: "API-40", linearIssueUrl: "https://linear.app/team/issue/API-40", linearIssueIdentifier: "API-40" },
  { _id: "task-127", title: "Stability improvements", bucket: "done", projectId: "project-3", categoryId: "category-2", routineBlockId: "routine-17", linearIssueId: "BUG-12", linearIssueUrl: "https://linear.app/team/issue/BUG-12", linearIssueIdentifier: "BUG-12" },
];

export interface MockSeedData {
  routineBlocks: MockRoutineBlock[];
  tasks: MockTask[];
}

// Seed 0: Software Engineer
const SEED_ENGINEER_ROUTINES: MockRoutineBlock[] = [
  // Monday - Deep Work Morning
  {
    _id: "routine-1",
    name: "Deep Work",
    startTime: "09:00",
    endTime: "11:00",
    dayOfWeek: 1, // Monday
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15", // Example Monday date
  },
  // Monday - Standup
  {
    _id: "routine-2",
    name: "Team Standup",
    startTime: "11:00",
    endTime: "11:30",
    dayOfWeek: 1,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  // Monday - Coding Block
  {
    _id: "routine-3",
    name: "Coding Block",
    startTime: "11:30",
    endTime: "13:00",
    dayOfWeek: 1,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  // Monday - Lunch
  {
    _id: "routine-4",
    name: "Lunch",
    startTime: "13:00",
    endTime: "14:00",
    dayOfWeek: 1,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-15",
    content: mockRoutineBlockContent("Salad from the place downstairs. Back by 14:00 for Afternoon Focus."),
  },
  // Monday - Afternoon Focus
  {
    _id: "routine-5",
    name: "Afternoon Focus",
    startTime: "14:00",
    endTime: "17:00",
    dayOfWeek: 1,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
    content: mockRoutineBlockContent("API refactor + code review. No meetings. Turn off Slack."),
  },
  // Monday - Daily schedule (diagonally hashed)
  { _id: "routine-1a", name: "Morning routine", startTime: "07:00", endTime: "07:30", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1a2", name: "Breakfast", startTime: "07:30", endTime: "08:30", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1b", name: "Meditation", startTime: "08:30", endTime: "09:00", dayOfWeek: 1, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1c", name: "Gym", startTime: "17:00", endTime: "18:00", dayOfWeek: 1, color: "#10b981", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1d", name: "Commute home", startTime: "18:00", endTime: "18:30", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1e", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1f", name: "Reading / Relax", startTime: "19:30", endTime: "21:00", dayOfWeek: 1, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1g", name: "Household admin", startTime: "21:00", endTime: "21:30", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "routine-1h", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  // Tuesday - Same pattern
  {
    _id: "routine-6",
    name: "Deep Work",
    startTime: "09:00",
    endTime: "11:00",
    dayOfWeek: 2, // Tuesday
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "routine-7",
    name: "Team Standup",
    startTime: "11:00",
    endTime: "11:30",
    dayOfWeek: 2,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "routine-8",
    name: "Coding Block",
    startTime: "11:30",
    endTime: "13:00",
    dayOfWeek: 2,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "routine-9",
    name: "Lunch",
    startTime: "13:00",
    endTime: "14:00",
    dayOfWeek: 2,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "routine-10",
    name: "Afternoon Focus",
    startTime: "14:00",
    endTime: "17:00",
    dayOfWeek: 2,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  // Tuesday - Daily schedule
  { _id: "routine-2a", name: "Morning routine", startTime: "07:00", endTime: "07:30", dayOfWeek: 2, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2a2", name: "Breakfast", startTime: "07:30", endTime: "08:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2b", name: "Meditation", startTime: "08:30", endTime: "09:00", dayOfWeek: 2, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2c", name: "Commute home", startTime: "17:00", endTime: "17:30", dayOfWeek: 2, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2c2", name: "Cook / Prep", startTime: "17:30", endTime: "18:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2d", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2e", name: "Reading / Relax", startTime: "19:30", endTime: "21:00", dayOfWeek: 2, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "routine-2f", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 2, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  // Wednesday
  { _id: "routine-11", name: "Deep Work", startTime: "09:00", endTime: "11:00", dayOfWeek: 3, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-12", name: "Team Standup", startTime: "11:00", endTime: "11:30", dayOfWeek: 3, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-13", name: "Coding Block", startTime: "11:30", endTime: "13:00", dayOfWeek: 3, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-14", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17", content: mockRoutineBlockContent("Salad from the place downstairs. Back by 14:00 for Afternoon Focus.") },
  { _id: "routine-15", name: "Afternoon Focus", startTime: "14:00", endTime: "17:00", dayOfWeek: 3, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17", content: mockRoutineBlockContent("API refactor + code review. No meetings. Turn off Slack.") },
  { _id: "routine-3a", name: "Morning routine", startTime: "07:00", endTime: "07:30", dayOfWeek: 3, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-3a2", name: "Breakfast", startTime: "07:30", endTime: "08:30", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-3b", name: "Gym", startTime: "17:00", endTime: "18:00", dayOfWeek: 3, color: "#10b981", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-3c", name: "Commute home", startTime: "18:00", endTime: "18:30", dayOfWeek: 3, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-3d", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "routine-3e", name: "Side project", startTime: "19:30", endTime: "21:00", dayOfWeek: 3, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17", content: mockRoutineBlockContent("Work on the CLI tool. Goal: finish the export command and add tests.") },
  { _id: "routine-3f", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 3, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  // Thursday
  { _id: "routine-16", name: "Deep Work", startTime: "09:00", endTime: "11:00", dayOfWeek: 4, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-17", name: "Team Standup", startTime: "11:00", endTime: "11:30", dayOfWeek: 4, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-18", name: "Code Review", startTime: "11:30", endTime: "13:00", dayOfWeek: 4, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-19", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-20", name: "Afternoon Focus", startTime: "14:00", endTime: "17:00", dayOfWeek: 4, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4a", name: "Morning routine", startTime: "07:00", endTime: "07:30", dayOfWeek: 4, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4a2", name: "Breakfast", startTime: "07:30", endTime: "08:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4b", name: "Meditation", startTime: "08:30", endTime: "09:00", dayOfWeek: 4, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4c", name: "Commute home", startTime: "17:00", endTime: "17:30", dayOfWeek: 4, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4d", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4e", name: "Social / Call family", startTime: "19:30", endTime: "20:30", dayOfWeek: 4, color: "#ec4899", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "routine-4f", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 4, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  // Friday
  { _id: "routine-21", name: "Deep Work", startTime: "09:00", endTime: "11:00", dayOfWeek: 5, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-22", name: "Team Standup", startTime: "11:00", endTime: "11:30", dayOfWeek: 5, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-23", name: "Coding Block", startTime: "11:30", endTime: "13:00", dayOfWeek: 5, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-24", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-25", name: "Weekly Wrap-up", startTime: "14:00", endTime: "17:00", dayOfWeek: 5, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5a", name: "Morning routine", startTime: "07:00", endTime: "07:30", dayOfWeek: 5, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5a2", name: "Breakfast", startTime: "07:30", endTime: "08:30", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5b", name: "Gym", startTime: "17:00", endTime: "18:00", dayOfWeek: 5, color: "#10b981", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5c", name: "Friday dinner out", startTime: "18:30", endTime: "20:00", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5d", name: "Movie / Relax", startTime: "20:00", endTime: "22:00", dayOfWeek: 5, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "routine-5e", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 5, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  // Saturday - full waking hours including weekly food shop
  { _id: "routine-26a", name: "Morning routine", startTime: "07:00", endTime: "08:00", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26b", name: "Breakfast", startTime: "08:00", endTime: "09:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26", name: "Personal Projects", startTime: "09:00", endTime: "11:00", dayOfWeek: 6, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26c", name: "Weekly food shop", startTime: "11:00", endTime: "13:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26d", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-27", name: "Learning", startTime: "14:00", endTime: "16:00", dayOfWeek: 6, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26e", name: "Errands / Chores", startTime: "16:00", endTime: "17:30", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26f", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26g", name: "Social / Hobbies", startTime: "19:30", endTime: "22:00", dayOfWeek: 6, color: "#ec4899", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "routine-26h", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  // Sunday - full waking hours including meal prep
  { _id: "routine-28a", name: "Morning routine", startTime: "07:00", endTime: "08:30", dayOfWeek: 0, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28b", name: "Breakfast", startTime: "08:30", endTime: "09:30", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28", name: "Week Planning", startTime: "09:30", endTime: "11:00", dayOfWeek: 0, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28c", name: "Meal prep", startTime: "11:00", endTime: "13:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28d", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-29", name: "Rest & Recharge", startTime: "14:00", endTime: "16:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28e", name: "Reading / Podcasts", startTime: "16:00", endTime: "18:00", dayOfWeek: 0, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28f", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28g", name: "Prep for week", startTime: "19:30", endTime: "21:00", dayOfWeek: 0, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "routine-28h", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 0, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
];

// Seed 1: Startup Founder
const SEED_FOUNDER_ROUTINES: MockRoutineBlock[] = [
  {
    _id: "founder-r1",
    name: "Investor Outreach",
    startTime: "08:00",
    endTime: "09:30",
    dayOfWeek: 1,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "founder-r2",
    name: "1:1s",
    startTime: "09:30",
    endTime: "11:00",
    dayOfWeek: 1,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "founder-r3",
    name: "Product Strategy",
    startTime: "11:00",
    endTime: "12:30",
    dayOfWeek: 1,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "founder-r4",
    name: "Lunch",
    startTime: "12:30",
    endTime: "13:30",
    dayOfWeek: 1,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "founder-r5",
    name: "Hiring Interviews",
    startTime: "13:30",
    endTime: "16:00",
    dayOfWeek: 1,
    color: "#ec4899",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  { _id: "founder-r1a", name: "Breakfast", startTime: "07:00", endTime: "08:00", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "founder-r1b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "founder-r1c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  {
    _id: "founder-r6",
    name: "Investor Outreach",
    startTime: "08:00",
    endTime: "09:30",
    dayOfWeek: 2,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "founder-r7",
    name: "Customer Calls",
    startTime: "09:30",
    endTime: "12:00",
    dayOfWeek: 2,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "founder-r8",
    name: "Lunch",
    startTime: "12:00",
    endTime: "13:00",
    dayOfWeek: 2,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "founder-r9",
    name: "Board Prep",
    startTime: "13:00",
    endTime: "17:00",
    dayOfWeek: 2,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  { _id: "founder-r2a", name: "Breakfast", startTime: "07:00", endTime: "08:00", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "founder-r2b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "founder-r2c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 2, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  // Wednesday
  { _id: "founder-r10", name: "Investor Outreach", startTime: "08:00", endTime: "09:30", dayOfWeek: 3, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r11", name: "Product Deep Dive", startTime: "09:30", endTime: "12:00", dayOfWeek: 3, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r12", name: "Lunch", startTime: "12:00", endTime: "13:00", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r13", name: "Hiring Interviews", startTime: "13:00", endTime: "17:00", dayOfWeek: 3, color: "#ec4899", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r3a", name: "Breakfast", startTime: "07:00", endTime: "08:00", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r3b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "founder-r3c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 3, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  // Thursday
  { _id: "founder-r14", name: "1:1s", startTime: "08:00", endTime: "10:30", dayOfWeek: 4, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r15", name: "Strategy Session", startTime: "10:30", endTime: "12:30", dayOfWeek: 4, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r16", name: "Lunch", startTime: "12:30", endTime: "13:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r17", name: "Customer Calls", startTime: "13:30", endTime: "17:00", dayOfWeek: 4, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r4a", name: "Breakfast", startTime: "07:00", endTime: "08:00", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r4b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "founder-r4c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 4, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  // Friday
  { _id: "founder-r18", name: "Investor Outreach", startTime: "08:00", endTime: "09:00", dayOfWeek: 5, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r19", name: "Team Sync", startTime: "09:00", endTime: "11:00", dayOfWeek: 5, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r20", name: "Lunch", startTime: "11:00", endTime: "12:00", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r21", name: "Weekly Review", startTime: "12:00", endTime: "16:00", dayOfWeek: 5, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r5a", name: "Breakfast", startTime: "07:00", endTime: "08:00", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r5b", name: "Dinner", startTime: "18:30", endTime: "20:00", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "founder-r5c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 5, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  // Saturday - full day with weekly food shop
  { _id: "founder-r22a", name: "Breakfast", startTime: "08:00", endTime: "09:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22", name: "Reading & Research", startTime: "09:00", endTime: "11:00", dayOfWeek: 6, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22b", name: "Weekly food shop", startTime: "11:00", endTime: "13:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22c", name: "Lunch", startTime: "13:00", endTime: "14:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22d", name: "Family time", startTime: "14:00", endTime: "18:00", dayOfWeek: 6, color: "#ec4899", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22e", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "founder-r22f", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  // Sunday
  { _id: "founder-r23a", name: "Breakfast", startTime: "08:00", endTime: "09:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23b", name: "Meal prep", startTime: "10:00", endTime: "12:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23b2", name: "Lunch", startTime: "12:00", endTime: "13:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23b3", name: "Rest / Reading", startTime: "13:00", endTime: "16:00", dayOfWeek: 0, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23", name: "Week Planning", startTime: "16:00", endTime: "17:30", dayOfWeek: 0, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23c", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "founder-r23d", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 0, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
];

// Seed 2: Project Manager
const SEED_PM_ROUTINES: MockRoutineBlock[] = [
  {
    _id: "pm-r1",
    name: "Team Standup",
    startTime: "09:00",
    endTime: "09:30",
    dayOfWeek: 1,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "pm-r2",
    name: "Sprint Planning",
    startTime: "09:30",
    endTime: "11:30",
    dayOfWeek: 1,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "pm-r3",
    name: "Stakeholder Sync",
    startTime: "11:30",
    endTime: "12:30",
    dayOfWeek: 1,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "pm-r4",
    name: "Lunch",
    startTime: "12:30",
    endTime: "13:30",
    dayOfWeek: 1,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "pm-r5",
    name: "Resource Allocation",
    startTime: "13:30",
    endTime: "15:00",
    dayOfWeek: 1,
    color: "#ec4899",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  {
    _id: "pm-r6",
    name: "Risk Review",
    startTime: "15:00",
    endTime: "17:00",
    dayOfWeek: 1,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-15",
  },
  { _id: "pm-r1a", name: "Breakfast", startTime: "07:00", endTime: "08:30", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "pm-r1b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 1, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  { _id: "pm-r1c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 1, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-15" },
  {
    _id: "pm-r7",
    name: "Team Standup",
    startTime: "09:00",
    endTime: "09:30",
    dayOfWeek: 2,
    color: "#8b5cf6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "pm-r8",
    name: "Status Updates",
    startTime: "09:30",
    endTime: "12:00",
    dayOfWeek: 2,
    color: "#3b82f6",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "pm-r9",
    name: "Lunch",
    startTime: "12:00",
    endTime: "13:00",
    dayOfWeek: 2,
    color: "#f59e0b",
    blockType: "daily_schedule",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  {
    _id: "pm-r10",
    name: "Retro Prep",
    startTime: "13:00",
    endTime: "17:00",
    dayOfWeek: 2,
    color: "#10b981",
    blockType: "routine",
    isTemplateBased: true,
    displayDate: "2024-01-16",
  },
  { _id: "pm-r2a", name: "Breakfast", startTime: "07:00", endTime: "08:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "pm-r2b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 2, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  { _id: "pm-r2c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 2, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-16" },
  // Wednesday
  { _id: "pm-r11", name: "Team Standup", startTime: "09:00", endTime: "09:30", dayOfWeek: 3, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r12", name: "Backlog Refinement", startTime: "09:30", endTime: "12:00", dayOfWeek: 3, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r13", name: "Lunch", startTime: "12:00", endTime: "13:00", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r14", name: "Stakeholder Sync", startTime: "13:00", endTime: "15:00", dayOfWeek: 3, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r15", name: "Documentation", startTime: "15:00", endTime: "17:00", dayOfWeek: 3, color: "#ec4899", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r3a", name: "Breakfast", startTime: "07:00", endTime: "08:30", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r3b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 3, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  { _id: "pm-r3c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 3, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-17" },
  // Thursday
  { _id: "pm-r16", name: "Team Standup", startTime: "09:00", endTime: "09:30", dayOfWeek: 4, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r17", name: "Risk Review", startTime: "09:30", endTime: "11:00", dayOfWeek: 4, color: "#ec4899", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r18", name: "Resource Allocation", startTime: "11:00", endTime: "12:30", dayOfWeek: 4, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r19", name: "Lunch", startTime: "12:30", endTime: "13:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r20", name: "Status Reports", startTime: "13:30", endTime: "17:00", dayOfWeek: 4, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r4a", name: "Breakfast", startTime: "07:00", endTime: "08:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r4b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 4, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  { _id: "pm-r4c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 4, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-18" },
  // Friday
  { _id: "pm-r21", name: "Team Standup", startTime: "09:00", endTime: "09:30", dayOfWeek: 5, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r22", name: "Sprint Retro", startTime: "09:30", endTime: "11:30", dayOfWeek: 5, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r23", name: "Lunch", startTime: "11:30", endTime: "12:30", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r24", name: "Week Wrap-up", startTime: "12:30", endTime: "17:00", dayOfWeek: 5, color: "#10b981", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r5a", name: "Breakfast", startTime: "07:00", endTime: "08:30", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r5b", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 5, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  { _id: "pm-r5c", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 5, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-19" },
  // Saturday - full day with weekly food shop
  { _id: "pm-r25a", name: "Breakfast", startTime: "08:00", endTime: "09:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25", name: "Inbox Zero", startTime: "09:00", endTime: "10:00", dayOfWeek: 6, color: "#8b5cf6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25b", name: "Weekly food shop", startTime: "10:00", endTime: "12:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25c", name: "Lunch", startTime: "12:00", endTime: "13:00", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25d", name: "Errands / Chores", startTime: "13:00", endTime: "15:00", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25e", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 6, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  { _id: "pm-r25f", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 6, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-20" },
  // Sunday - full day with meal prep
  { _id: "pm-r26a", name: "Breakfast", startTime: "08:00", endTime: "09:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26b", name: "Meal prep", startTime: "10:00", endTime: "12:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26c", name: "Lunch", startTime: "12:00", endTime: "13:00", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26c2", name: "Rest / Reading", startTime: "13:00", endTime: "15:00", dayOfWeek: 0, color: "#8b5cf6", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26", name: "Week Planning", startTime: "15:00", endTime: "16:30", dayOfWeek: 0, color: "#3b82f6", blockType: "routine", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26d", name: "Dinner", startTime: "18:30", endTime: "19:30", dayOfWeek: 0, color: "#f59e0b", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
  { _id: "pm-r26e", name: "Wind-down", startTime: "22:00", endTime: "23:00", dayOfWeek: 0, color: "#6b7280", blockType: "daily_schedule", isTemplateBased: true, displayDate: "2024-01-21" },
];

// Seed tasks - Founder
const SEED_FOUNDER_TASKS: MockTask[] = [
  { _id: "founder-t1", title: "Update pitch deck for Series A", bucket: "shaping", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r23", notionPageId: "pitch-deck", notionPageUrl: "https://notion.so/Founder-pitch-deck", notionPageTitle: "Pitch deck" },
  { _id: "founder-t2", title: "Prepare cap table for investors", bucket: "shaping", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r23", notionPageId: "cap-table", notionPageUrl: "https://notion.so/Founder-cap-table", notionPageTitle: "Cap table" },
  { _id: "founder-t3", title: "Follow up with VC intro", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r1", linearIssueId: "FUND-1", linearIssueUrl: "https://linear.app/team/issue/FUND-1", linearIssueIdentifier: "FUND-1" },
  { _id: "founder-t4", title: "Review term sheet draft", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r9", notionPageId: "term-sheet", notionPageUrl: "https://notion.so/Founder-term-sheet", notionPageTitle: "Term sheet" },
  { _id: "founder-t5", title: "Schedule board meeting", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r19", notionPageId: "board-meeting", notionPageUrl: "https://notion.so/Founder-board-meeting", notionPageTitle: "Board meeting" },
  { _id: "founder-t6", title: "Investor update email", bucket: "in_progress", projectId: "project-1", routineBlockId: "founder-r1" },
  { _id: "founder-t7", title: "Engineering 1:1 notes", bucket: "in_progress", projectId: "project-2", routineBlockId: "founder-r2" },
  { _id: "founder-t8", title: "Hiring scorecard draft", bucket: "in_review", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r13" },
  { _id: "founder-t9", title: "Customer discovery call notes", bucket: "done", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r7" },
  { _id: "founder-t10", title: "Fundraising tracker update", bucket: "done", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r21" },
  { _id: "founder-t11", title: "Advisor equity vesting", bucket: "backlog", projectId: "project-2", categoryId: "category-3", routineBlockId: "founder-r22" },
  { _id: "founder-t12", title: "Due diligence checklist", bucket: "backlog", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r21" },
  { _id: "founder-t13", title: "Data room refresh", bucket: "backlog", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r15" },
  // founder-r1 Investor Outreach Mon - add 3 more
  { _id: "founder-t14", title: "VC meeting prep Acme Capital", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r1" },
  { _id: "founder-t15", title: "Send deck to intro request", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r1" },
  { _id: "founder-t16", title: "Update pipeline spreadsheet", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r1" },
  // founder-r2 1:1s Mon - add 3 more
  { _id: "founder-t17", title: "Design lead 1:1 agenda", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r2" },
  { _id: "founder-t18", title: "Product 1:1 follow-ups", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r2" },
  { _id: "founder-t19", title: "Action items from 1:1s", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r2" },
  // founder-r3 Product Strategy Mon - add 4
  { _id: "founder-t20", title: "Roadmap Q2 prioritization", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r3" },
  { _id: "founder-t21", title: "Competitor analysis update", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r3" },
  { _id: "founder-t22", title: "Feature spec review", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r3" },
  { _id: "founder-t23", title: "Product metrics dashboard", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r3" },
  // founder-r5 Hiring Interviews Mon - add 3 more
  { _id: "founder-t24", title: "Senior eng scorecard", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r5" },
  { _id: "founder-t25", title: "Candidate feedback write-up", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r5" },
  { _id: "founder-t26", title: "Interview loop scheduling", bucket: "todo", projectId: "project-2", categoryId: "category-3", routineBlockId: "founder-r5" },
  // founder-r6 Investor Outreach Tue - add 4
  { _id: "founder-t27", title: "LP update draft", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r6" },
  { _id: "founder-t28", title: "Angel investor outreach", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r6" },
  { _id: "founder-t29", title: "Warm intro requests", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r6" },
  { _id: "founder-t30", title: "Fundraising calendar", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r6" },
  // founder-r7 Customer Calls Tue - add 3 more
  { _id: "founder-t31", title: "Enterprise call prep", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r7" },
  { _id: "founder-t32", title: "Churn interview notes", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r7" },
  { _id: "founder-t33", title: "NPS follow-up list", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r7" },
  // founder-r9 Board Prep Tue - add 3 more
  { _id: "founder-t34", title: "Board deck outline", bucket: "in_progress", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r9" },
  { _id: "founder-t35", title: "Financial projections update", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r9" },
  { _id: "founder-t36", title: "Board meeting agenda", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r9" },
  // founder-r10 Investor Outreach Wed - add 4
  { _id: "founder-t37", title: "Pitch practice notes", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r10" },
  { _id: "founder-t38", title: "VC research Sequoia", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r10" },
  { _id: "founder-t39", title: "Follow-up sequence draft", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r10" },
  { _id: "founder-t40", title: "Meeting debrief template", bucket: "todo", projectId: "project-2", categoryId: "category-4", routineBlockId: "founder-r10" },
  // founder-r11 Product Deep Dive Wed - add 4
  { _id: "founder-t41", title: "Technical architecture review", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r11" },
  { _id: "founder-t42", title: "UX flow critique", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r11" },
  { _id: "founder-t43", title: "Sprint demo prep", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r11" },
  { _id: "founder-t44", title: "Beta feedback triage", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r11" },
  // founder-r13 Hiring Interviews Wed - add 3 more
  { _id: "founder-t45", title: "PM candidate eval", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r13" },
  { _id: "founder-t46", title: "Offer letter review", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r13" },
  { _id: "founder-t47", title: "Reference check schedule", bucket: "todo", projectId: "project-2", categoryId: "category-3", routineBlockId: "founder-r13" },
  // founder-r14 1:1s Thu - add 4
  { _id: "founder-t48", title: "Ops lead 1:1 prep", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r14" },
  { _id: "founder-t49", title: "Marketing 1:1 agenda", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r14" },
  { _id: "founder-t50", title: "Performance check-in notes", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r14" },
  { _id: "founder-t51", title: "Career growth discussion", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "founder-r14" },
  // founder-r15 Strategy Session Thu - add 3 more
  { _id: "founder-t52", title: "Go-to-market revision", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r15" },
  { _id: "founder-t53", title: "Pricing model analysis", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r15" },
  { _id: "founder-t54", title: "Expansion strategy doc", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r15" },
  // founder-r17 Customer Calls Thu - add 4
  { _id: "founder-t55", title: "Champion call prep", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r17" },
  { _id: "founder-t56", title: "Renewal forecast update", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r17" },
  { _id: "founder-t57", title: "Case study interview", bucket: "todo", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r17" },
  { _id: "founder-t58", title: "Support escalations review", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r17" },
  // founder-r18 Investor Outreach Fri - add 4
  { _id: "founder-t59", title: "Friday pipeline update", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r18" },
  { _id: "founder-t60", title: "Week recap to leads", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r18" },
  { _id: "founder-t61", title: "Next week VC targets", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r18" },
  { _id: "founder-t62", title: "Pitch feedback log", bucket: "todo", projectId: "project-2", categoryId: "category-4", routineBlockId: "founder-r18" },
  // founder-r19 Team Sync Fri - add 3 more
  { _id: "founder-t63", title: "All-hands outline", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r19" },
  { _id: "founder-t64", title: "Team wins recap", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r19" },
  { _id: "founder-t65", title: "OKR progress check", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r19" },
  // founder-r21 Weekly Review Fri - add 2 more
  { _id: "founder-t66", title: "Metrics dashboard review", bucket: "in_progress", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r21" },
  { _id: "founder-t67", title: "Burn rate analysis", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r21" },
  // founder-r22 Reading & Research Sat - add 3 more
  { _id: "founder-t68", title: "Market trend report", bucket: "in_progress", projectId: "project-2", categoryId: "category-1", routineBlockId: "founder-r22" },
  { _id: "founder-t69", title: "Competitor pricing review", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r22" },
  { _id: "founder-t70", title: "SaaS benchmarks", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "founder-r22" },
  // founder-r23 Week Planning Sun - add 3 more
  { _id: "founder-t71", title: "Week priorities list", bucket: "shaping", projectId: "project-1", categoryId: "category-1", routineBlockId: "founder-r23", linearIssueId: "FUND-10", linearIssueUrl: "https://linear.app/team/issue/FUND-10", linearIssueIdentifier: "FUND-10" },
  { _id: "founder-t72", title: "Meeting calendar block", bucket: "shaping", projectId: "project-2", categoryId: "category-2", routineBlockId: "founder-r23", notionPageId: "week-plan", notionPageUrl: "https://notion.so/Founder-week-plan", notionPageTitle: "Week plan" },
  { _id: "founder-t73", title: "Key deliverables", bucket: "shaping", projectId: "project-1", categoryId: "category-3", routineBlockId: "founder-r23", linearIssueId: "FUND-11", linearIssueUrl: "https://linear.app/team/issue/FUND-11", linearIssueIdentifier: "FUND-11" },
];

// Seed tasks - PM
const SEED_PM_TASKS: MockTask[] = [
  { _id: "pm-t1", title: "Sprint goal alignment", bucket: "shaping", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r26", linearIssueId: "PM-1", linearIssueUrl: "https://linear.app/team/issue/PM-1", linearIssueIdentifier: "PM-1" },
  { _id: "pm-t2", title: "Dependency mapping", bucket: "shaping", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r26", notionPageId: "dependency-map", notionPageUrl: "https://notion.so/PM-dependency-map", notionPageTitle: "Dependency map" },
  { _id: "pm-t3", title: "Update Jira epic status", bucket: "todo", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r2", linearIssueId: "PM-2", linearIssueUrl: "https://linear.app/team/issue/PM-2", linearIssueIdentifier: "PM-2" },
  { _id: "pm-t4", title: "Risk log entries", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r17", notionPageId: "risk-log", notionPageUrl: "https://notion.so/PM-risk-log", notionPageTitle: "Risk log" },
  { _id: "pm-t5", title: "Stakeholder communication plan", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r3", notionPageId: "comms-plan", notionPageUrl: "https://notion.so/PM-comms-plan", notionPageTitle: "Comms plan" },
  { _id: "pm-t6", title: "Sprint backlog refinement", bucket: "in_progress", projectId: "project-1", routineBlockId: "pm-r2" },
  { _id: "pm-t7", title: "Status report draft", bucket: "in_progress", projectId: "project-2", routineBlockId: "pm-r8" },
  { _id: "pm-t8", title: "Resource allocation review", bucket: "in_review", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r18" },
  { _id: "pm-t9", title: "Retro action items", bucket: "done", projectId: "project-2", categoryId: "category-1", routineBlockId: "pm-r22" },
  { _id: "pm-t10", title: "Sprint metrics dashboard", bucket: "done", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r24" },
  { _id: "pm-t11", title: "Quarterly roadmap update", bucket: "backlog", projectId: "project-1", categoryId: "category-3", routineBlockId: "pm-r24" },
  { _id: "pm-t12", title: "Cross-team dependency tracking", bucket: "backlog", projectId: "project-2", categoryId: "category-4", routineBlockId: "pm-r12" },
  { _id: "pm-t13", title: "Stakeholder RACI matrix", bucket: "backlog", projectId: "project-3", categoryId: "category-1", routineBlockId: "pm-r14" },
  // pm-r1 Team Standup Mon - add 4
  { _id: "pm-t14", title: "Blockers escalation", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r1" },
  { _id: "pm-t15", title: "Velocity check", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "pm-r1" },
  { _id: "pm-t16", title: "WIP limits review", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r1" },
  { _id: "pm-t17", title: "Standup action items", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r1" },
  // pm-r2 Sprint Planning Mon - add 2 more
  { _id: "pm-t18", title: "Capacity planning sheet", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r2" },
  { _id: "pm-t19", title: "Story point calibration", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r2" },
  // pm-r3 Stakeholder Sync Mon - add 3 more
  { _id: "pm-t20", title: "Executive summary", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r3" },
  { _id: "pm-t21", title: "Timeline adjustment comms", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r3" },
  { _id: "pm-t22", title: "Scope change log", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r3" },
  // pm-r5 Resource Allocation Mon - add 4
  { _id: "pm-t23", title: "Team capacity matrix", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r5" },
  { _id: "pm-t24", title: "Cross-team requests", bucket: "todo", projectId: "project-1", categoryId: "category-2", routineBlockId: "pm-r5" },
  { _id: "pm-t25", title: "Skill gap analysis", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r5" },
  { _id: "pm-t26", title: "Contractor allocation", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r5" },
  // pm-r6 Risk Review Mon - add 4
  { _id: "pm-t27", title: "Risk register update", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r6" },
  { _id: "pm-t28", title: "Mitigation status", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r6" },
  { _id: "pm-t29", title: "Escalation thresholds", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r6" },
  { _id: "pm-t30", title: "Contingency plan review", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "pm-r6" },
  // pm-r7 Team Standup Tue - add 4
  { _id: "pm-t31", title: "Sprint progress update", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r7" },
  { _id: "pm-t32", title: "Blocker resolution", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r7" },
  { _id: "pm-t33", title: "Impediment list", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r7" },
  { _id: "pm-t34", title: "Focus area alignment", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r7" },
  // pm-r8 Status Updates Tue - add 3 more
  { _id: "pm-t35", title: "Jira board sync", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r8" },
  { _id: "pm-t36", title: "Burndown chart update", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r8" },
  { _id: "pm-t37", title: "Stakeholder email draft", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r8" },
  // pm-r10 Retro Prep Tue - add 4
  { _id: "pm-t38", title: "Retro format selection", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r10" },
  { _id: "pm-t39", title: "Feedback categories", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r10" },
  { _id: "pm-t40", title: "Previous retro follow-ups", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r10" },
  { _id: "pm-t41", title: "Retro facilitator prep", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r10" },
  // pm-r11 Team Standup Wed - add 4
  { _id: "pm-t42", title: "Mid-sprint sync", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r11" },
  { _id: "pm-t43", title: "Delivery confidence", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r11" },
  { _id: "pm-t44", title: "Scope creep check", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r11" },
  { _id: "pm-t45", title: "Dependency unblock", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "pm-r11" },
  // pm-r12 Backlog Refinement Wed - add 3 more
  { _id: "pm-t46", title: "Story splitting", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r12" },
  { _id: "pm-t47", title: "Acceptance criteria review", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r12" },
  { _id: "pm-t48", title: "Technical spike prioritization", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r12" },
  // pm-r14 Stakeholder Sync Wed - add 3 more
  { _id: "pm-t49", title: "Weekly sync agenda", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r14" },
  { _id: "pm-t50", title: "Demo preparation", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r14" },
  { _id: "pm-t51", title: "Feedback consolidation", bucket: "todo", projectId: "project-3", categoryId: "category-1", routineBlockId: "pm-r14" },
  // pm-r15 Documentation Wed - add 4
  { _id: "pm-t52", title: "Process doc update", bucket: "in_progress", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r15" },
  { _id: "pm-t53", title: "Confluence pages sync", bucket: "todo", projectId: "project-2", categoryId: "category-4", routineBlockId: "pm-r15" },
  { _id: "pm-t54", title: "Runbook updates", bucket: "todo", projectId: "project-3", categoryId: "category-4", routineBlockId: "pm-r15" },
  { _id: "pm-t55", title: "Decision log entry", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r15" },
  // pm-r16 Team Standup Thu - add 4
  { _id: "pm-t56", title: "Pre-release standup", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r16" },
  { _id: "pm-t57", title: "Deployment coordination", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r16" },
  { _id: "pm-t58", title: "Release blocker check", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r16" },
  { _id: "pm-t59", title: "Handoff notes", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r16" },
  // pm-r17 Risk Review Thu - add 3 more
  { _id: "pm-t60", title: "New risk assessment", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r17" },
  { _id: "pm-t61", title: "Risk probability update", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r17" },
  { _id: "pm-t62", title: "Impact analysis", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r17" },
  // pm-r18 Resource Allocation Thu - add 3 more
  { _id: "pm-t63", title: "Sprint capacity allocation", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r18" },
  { _id: "pm-t64", title: "Task reassignment", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r18" },
  { _id: "pm-t65", title: "Overtime tracking", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r18" },
  // pm-r20 Status Reports Thu - add 4
  { _id: "pm-t66", title: "Weekly status report", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r20" },
  { _id: "pm-t67", title: "Executive dashboard", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r20" },
  { _id: "pm-t68", title: "KPI summary", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r20" },
  { _id: "pm-t69", title: "Budget vs actual", bucket: "todo", projectId: "project-1", categoryId: "category-3", routineBlockId: "pm-r20" },
  // pm-r21 Team Standup Fri - add 4
  { _id: "pm-t70", title: "Week wrap standup", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r21" },
  { _id: "pm-t71", title: "Sprint completion status", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r21" },
  { _id: "pm-t72", title: "Rollover items", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r21" },
  { _id: "pm-t73", title: "Next sprint preview", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r21" },
  // pm-r22 Sprint Retro Fri - add 3 more
  { _id: "pm-t74", title: "Retro facilitation", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r22" },
  { _id: "pm-t75", title: "Action item capture", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r22" },
  { _id: "pm-t76", title: "Process improvement ideas", bucket: "todo", projectId: "project-3", categoryId: "category-3", routineBlockId: "pm-r22" },
  // pm-r24 Week Wrap-up Fri - add 2 more
  { _id: "pm-t77", title: "Sprint report finalize", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r24" },
  { _id: "pm-t78", title: "Archive completed sprint", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r24" },
  // pm-r25 Inbox Zero Sat - add 4
  { _id: "pm-t79", title: "Email triage", bucket: "in_progress", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r25" },
  { _id: "pm-t80", title: "Slack follow-ups", bucket: "todo", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r25" },
  { _id: "pm-t81", title: "Notification cleanup", bucket: "todo", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r25" },
  { _id: "pm-t82", title: "Meeting request batch", bucket: "todo", projectId: "project-1", categoryId: "category-4", routineBlockId: "pm-r25" },
  // pm-r26 Week Planning Sun - add 4
  { _id: "pm-t83", title: "Sprint goals draft", bucket: "shaping", projectId: "project-1", categoryId: "category-1", routineBlockId: "pm-r26", linearIssueId: "PM-10", linearIssueUrl: "https://linear.app/team/issue/PM-10", linearIssueIdentifier: "PM-10" },
  { _id: "pm-t84", title: "Priority backlog", bucket: "shaping", projectId: "project-2", categoryId: "category-2", routineBlockId: "pm-r26", linearIssueId: "PM-11", linearIssueUrl: "https://linear.app/team/issue/PM-11", linearIssueIdentifier: "PM-11" },
  { _id: "pm-t85", title: "Capacity forecast", bucket: "shaping", projectId: "project-3", categoryId: "category-2", routineBlockId: "pm-r26", notionPageId: "capacity-forecast", notionPageUrl: "https://notion.so/PM-capacity-forecast", notionPageTitle: "Capacity forecast" },
  { _id: "pm-t86", title: "Stakeholder calendar", bucket: "shaping", projectId: "project-1", categoryId: "category-3", routineBlockId: "pm-r26", notionPageId: "stakeholder-cal", notionPageUrl: "https://notion.so/PM-stakeholder-cal", notionPageTitle: "Stakeholder calendar" },
];

// Default/legacy export (uses engineer seed)
export const mockRoutineBlocks: MockRoutineBlock[] = SEED_ENGINEER_ROUTINES;

// MOCK_SEEDS for random persona selection
export const MOCK_SEEDS: MockSeedData[] = [
  { routineBlocks: SEED_ENGINEER_ROUTINES, tasks: mockTasks },
  { routineBlocks: SEED_FOUNDER_ROUTINES, tasks: SEED_FOUNDER_TASKS },
  { routineBlocks: SEED_PM_ROUTINES, tasks: SEED_PM_TASKS },
];

export const MOCK_SEED_LABELS = ["Dev", "Founder", "PM"] as const;

export function getMockDataForSeed(seedIndex: number): MockSeedData {
  const index = Math.max(0, Math.min(seedIndex, MOCK_SEEDS.length - 1));
  return MOCK_SEEDS[index]!;
}

// Reviews
export const mockReviews: MockReview[] = [
  {
    _id: "review-1",
    date: "2024-01-14", // Last Sunday
    type: "weekly",
  },
];

// Helper functions
export function getProjectById(id: string): MockProject | undefined {
  return mockProjects.find((p) => p._id === id);
}

export function getContainerById(id: string): MockContainer | undefined {
  return mockContainers.find((c) => c._id === id);
}

export function getCategoryById(id: string): MockCategory | undefined {
  return mockCategories.find((c) => c._id === id);
}

export function getTasksByBucket(bucket: MockTask["bucket"], tasks: MockTask[] = mockTasks): MockTask[] {
  return tasks.filter((t) => t.bucket === bucket);
}

export function getTasksByRoutineBlock(routineBlockId: string, tasks: MockTask[] = mockTasks): MockTask[] {
  return tasks.filter((t) => t.routineBlockId === routineBlockId);
}
