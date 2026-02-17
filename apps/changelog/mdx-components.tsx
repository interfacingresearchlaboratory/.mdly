import type { MDXComponents } from "mdx/types";
import {
  Accordion,
  AccordionContent as BaseAccordionContent,
  AccordionItem as BaseAccordionItem,
  AccordionTrigger as BaseAccordionTrigger,
} from "@editor/ui/accordion";
import { cn } from "@editor/ui/utils";

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
    ...components,
  };
}

export const useMDXComponents = getMDXComponents;
