import type { MDXComponents } from "mdx/types";
import {
  Accordion,
  AccordionContent as BaseAccordionContent,
  AccordionItem as BaseAccordionItem,
  AccordionTrigger as BaseAccordionTrigger,
} from "@editor/ui/accordion";
import { Separator } from "@editor/ui/separator";
import { cn } from "@editor/ui/utils";
import { HeroHeading } from "@/components/hero-heading";
import { DownloadButton } from "@/components/download-button";
import { LandingHeroImage } from "@/components/landing-hero-image";
import { SectionBreak } from "@/components/section-break";
import { SectionBuffer } from "@/components/section-buffer";
import { FullWidthSeparator } from "@/components/full-width-separator";
import { DemoColumnCards, DemoColumnCard } from "@/components/demo-column-cards";
import { SolutionCards } from "@/components/solution-cards";
import { SolutionCard } from "@/components/solution-card";
import { RecentUpdates } from "@/components/recent-updates";
import { CenteredHeading } from "@/components/centered-heading";
import { SpacedSection } from "@/components/spaced-section";
import { LightText } from "@/components/light-text";
import { CTASection } from "@/components/cta-section";
import { FinalMessage } from "@/components/final-message";
import { ProjectionsPageMockup } from "@/components/projections-page-mockup";
import { CalendarWeekMockup } from "@/components/calendar-week-mockup";
import { ReviewPageMockup } from "@/components/review-page-mockup";
import { RoutinesMockup } from "@/components/routines-mockup";
import { TimeAwareSchedulingMockup } from "@/components/time-aware-scheduling-mockup";
import { KanbanMockup } from "@/components/kanban-mockup";
import { UnifiedOrgKanbanMockup } from "@/components/unified-org-kanban-mockup";
import { ProblemSection } from "@/components/problem-section";
import { ProblemCard } from "@/components/problem-card";
import { FeatureCard } from "@/components/feature-card";
import { FeatureCards } from "@/components/feature-cards";
import { SectionWrapper } from "@/components/section-wrapper";
import { HeroCopyWithMockup } from "@/components/hero-copy-with-mockup";
import { CalendarDayViewMockup } from "@/components/calendar-day-view-mockup";
import { InboxMockup } from "@/components/inbox-mockup";
import { IntegrationsDiagram } from "@/components/integrations-diagram";
import { ReviewEditorDemoCard } from "@/components/review-editor-demo-mockup";

const AccordionTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordionTrigger>) => (
  <BaseAccordionTrigger
    className={cn("font-normal !text-base !py-2", className)}
    {...props}
  />
);

const AccordionContent = ({
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordionContent>) => (
  <BaseAccordionContent
    className={cn("!text-base", className)}
    {...props}
  />
);

const AccordionItem = ({
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordionItem>) => (
  <BaseAccordionItem
    className={cn("!border-b border-border [&:first-child]:border-t [&:last-child]:!border-b", className)}
    {...props}
  />
);

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    img: ({ className, ...props }: React.ComponentProps<"img">) => (
      <img className={cn("rounded-md border", className)} {...props} />
    ),
    video: ({ className, ...props }: React.ComponentProps<"video">) => (
      <video
        className={cn("rounded-md border", className)}
        controls
        loop
        {...props}
      />
    ),
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    SectionBreak,
    SectionBuffer,
    FullWidthSeparator,
    DemoColumnCards,
    DemoColumnCard,
    SolutionCards,
    SolutionCard,
    RecentUpdates,
    DownloadButton,
    HeroHeading,
    LandingHeroImage,
    CenteredHeading,
    SpacedSection,
    LightText,
    CTASection,
    FinalMessage,

    ProjectionsPageMockup,
   
    CalendarWeekMockup,
    ReviewPageMockup,
    RoutinesMockup,
    TimeAwareSchedulingMockup,
    KanbanMockup,
    UnifiedOrgKanbanMockup,
    ProblemSection,
    ProblemCard,
    FeatureCard,
    FeatureCards,
    SectionWrapper,
    HeroCopyWithMockup,
    CalendarDayViewMockup,
    InboxMockup,
    IntegrationsDiagram,
    ReviewEditorDemoCard,
    Separator,
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
