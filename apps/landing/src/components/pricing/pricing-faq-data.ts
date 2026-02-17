export interface FaqItem {
  question: string;
  answer: string;
}

export const pricingFaqData: FaqItem[] = [
  {
    question: "Which integrations are included?",
    answer:
      "Every plan — including the free plan — includes Linear, Notion, calendar sync, and API access. There are no integration limits on any tier.",
  },
  {
    question: "Are there limits on tasks or projects?",
    answer:
      "Tasks are unlimited on every plan. Projects are capped at 50 on the free plan and unlimited on paid plans. Check the feature table above for the full breakdown of containers and workspaces.",
  },
  {
    question: "Which review types are available on each plan?",
    answer:
      "Daily and weekly reviews are included on every plan. Monthly reviews unlock on the Basic plan, and quarterly and annual reviews are available on the Team plan.",
  },
  {
    question: "Can I try MONOid before committing to a paid plan?",
    answer:
      "Yes — the free plan is fully functional with no time limit, so you can explore routine blocks, integrations, and weekly planning before deciding to upgrade. When you're ready, upgrading is instant.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. API access is included on every plan, so you can export your tasks, projects, reviews, and reflections at any time. Your data is yours — pipe it into agents, automations, and dashboards whenever you need to.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data stays available for export even after cancellation. Your account reverts to the free plan at the end of the billing period, so you keep access to everything you've created.",
  },
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes, you can switch at any time from your account settings. Both options are the same price right now. When switching, any remaining balance is prorated and applied to your new billing cycle.",
  },
];
