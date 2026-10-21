export const problems = [
  {
    title: "Repetitive work between tools",
    text: "People still copy account data, status updates, or handoffs that a reliable workflow could carry.",
  },
  {
    title: "Feedback with no shared reading",
    text: "Reviews, tickets, and call notes describe the same issue in different words, so the pattern stays hidden.",
  },
  {
    title: "Unclear product priorities",
    text: "Teams can list complaints, but they cannot yet tell which problems deserve investigation first.",
  },
  {
    title: "Automation without a business case",
    text: "A process feels slow, and the team needs a concrete place where AI or automation would change the work.",
  },
] as const;

export const services = [
  {
    id: "automation",
    title: "AI & Workflow Automation",
    summary:
      "Design AI agents and automated workflows to reduce repetitive work and connect business processes.",
    detail:
      "We map a process that already consumes time, then design the automation that can carry the reliable steps. People keep the exceptions, decisions, and customer judgment.",
    deliverables: [
      "A map of the current workflow, including the tools and handoffs involved",
      "An agent or automation design for the steps that are consistent enough to run",
      "A working workflow in the systems the team already uses",
      "An operating checklist for the people who will supervise it",
    ],
  },
  {
    id: "development",
    title: "Custom AI Development",
    summary:
      "Build AI-powered applications, internal tools, prototypes, and integrations around specific business needs.",
    detail:
      "When the work needs software rather than a workflow alone, we build the application, internal tool, or integration that fits the problem. The result is scoped to a defined use, not a generic platform.",
    deliverables: [
      "A written problem brief and the criteria for a useful first version",
      "A prototype or application the team can use in the workflow",
      "Integrations with the systems that already hold the relevant data",
      "Documentation for the people who will own and maintain it",
    ],
  },
  {
    id: "intelligence",
    title: "Data & Feedback Intelligence",
    summary:
      "Turn customer reviews, support tickets, and business data into prioritized insights and actionable recommendations.",
    detail:
      "We organize the signals a company already collects and turn them into a reading the product and operations teams can share. The output is a priority list and a recommended next step, not a larger dashboard.",
    deliverables: [
      "An inventory of the feedback and data sources that matter for the question",
      "A theme model the team can review and correct",
      "A priority view for product, support, or operations",
      "A recommendation format that names the next action and how to judge it",
    ],
  },
] as const;

export const steps = [
  {
    name: "Discover",
    text: "Start from a defined business problem, the people involved, and the signals the company already has.",
  },
  {
    name: "Design",
    text: "Shape a scoped solution, the workflow it changes, and the criteria that will show whether it worked.",
  },
  {
    name: "Build",
    text: "Implement the automation, application, or analysis with the team that will use it.",
  },
  {
    name: "Measure",
    text: "Compare the result with the criteria agreed at the start, then decide what to keep, change, or stop.",
  },
] as const;

export const scopeItems = [
  "The business problem, stated in operational terms",
  "Who is affected and who will use the result",
  "What this phase will produce",
  "What is explicitly out of scope",
  "How success will be judged",
  "The sequence of work and the review points",
] as const;

export const signals = [
  {
    id: "billing",
    source: "Support tickets",
    title: "Billing questions doubled after plan changes",
    detail: "Conversations cluster around invoice timing when a customer changes plans.",
    theme: "Billing handoff",
    severity: "High" as const,
    why: "The same question is reaching support because the product does not show invoice status at the moment of change.",
    action: "Draft one status reply and route plan-change tickets to a single queue.",
    measure: "Repeat contacts about the same invoice within seven days.",
  },
  {
    id: "onboarding",
    source: "Reviews",
    title: "New teams stall in the first week",
    detail: "Public reviews describe setup as unclear, especially around inviting teammates.",
    theme: "Onboarding friction",
    severity: "Medium" as const,
    why: "The language differs, but the drop-off sits between account creation and the first shared workspace.",
    action: "Write a first-week checklist and test it with three recent signups.",
    measure: "Share of new workspaces that invite a second teammate within seven days.",
  },
  {
    id: "export",
    source: "Internal ops",
    title: "Monday export still happens by hand",
    detail: "An operations manager copies account status from the CRM into a spreadsheet.",
    theme: "Manual reporting",
    severity: "Medium" as const,
    why: "The steps are consistent, the source data already exists, and the exceptions are easy to spot.",
    action: "Automate the standard rows and leave mismatched accounts for review.",
    measure: "Minutes spent preparing the Monday report.",
  },
  {
    id: "reliability",
    source: "Call notes",
    title: "Exports fail for larger workspaces",
    detail: "Customer calls mention timeouts when a report includes a full year of activity.",
    theme: "Reliability",
    severity: "High" as const,
    why: "The reports are few, but they come from accounts that depend on the export for their own customers.",
    action: "Reproduce the timeout and decide whether the fix is a job queue or a narrower export.",
    measure: "Successful completion of full-year exports.",
  },
] as const;

export const useCases = [
  {
    title: "Analyzing recurring support tickets",
    text: "A support queue keeps answering the same billing question. An illustrative engagement would group those tickets, separate a product gap from a reply that can be standardized, and define what fewer repeats would look like.",
  },
  {
    title: "Automating repetitive internal workflows",
    text: "An operations lead copies account data between the CRM and a spreadsheet every week. An illustrative engagement would map that path, automate the reliable steps, and leave the exceptions with a person.",
  },
  {
    title: "Converting customer feedback into product priorities",
    text: "Reviews and call notes describe the same onboarding drop-off in different words. An illustrative engagement would cluster those notes and turn the strongest themes into a ranked list for product investigation.",
  },
] as const;

export const feedbackItems = [
  {
    id: "fb-1",
    source: "Ticket",
    theme: "Billing",
    severity: "High" as const,
    productArea: "Plan changes",
    quote:
      "We upgraded on Tuesday and still cannot tell whether the invoice will include the old seats.",
    nextStep:
      "Add the upcoming invoice date to the plan-change confirmation, and give support a single reply for the current gap.",
  },
  {
    id: "fb-2",
    source: "Review",
    theme: "Onboarding",
    severity: "Medium" as const,
    productArea: "Workspace setup",
    quote:
      "The product looks capable, but we spent two days figuring out how to invite the rest of the team.",
    nextStep:
      "Test a first-week checklist with new workspaces and watch whether a second teammate gets invited.",
  },
  {
    id: "fb-3",
    source: "Call note",
    theme: "Reliability",
    severity: "High" as const,
    productArea: "Exports",
    quote:
      "The annual export times out once the workspace passes a few thousand activities. We need it for our own customers.",
    nextStep:
      "Reproduce the timeout on a large workspace and choose between a background job and a narrower default export.",
  },
  {
    id: "fb-4",
    source: "Ticket",
    theme: "Onboarding",
    severity: "Low" as const,
    productArea: "Permissions",
    quote:
      "A new admin could not find where to change a teammate from viewer to editor.",
    nextStep:
      "Place the role control on the member row and check whether this ticket theme declines.",
  },
  {
    id: "fb-5",
    source: "Review",
    theme: "Billing",
    severity: "Medium" as const,
    productArea: "Invoices",
    quote:
      "Support was helpful, but I should not have needed a ticket to learn when the next invoice is generated.",
    nextStep:
      "Show the next invoice date in billing settings, next to the current plan.",
  },
  {
    id: "fb-6",
    source: "Call note",
    theme: "Reporting",
    severity: "Medium" as const,
    productArea: "Weekly digest",
    quote:
      "Our operations lead still copies the Monday numbers into a sheet because the digest misses two fields.",
    nextStep:
      "Add the two missing fields to the digest, or automate the sheet from the same source.",
  },
] as const;

export const feedbackThemes = [
  "All",
  "Billing",
  "Onboarding",
  "Reliability",
  "Reporting",
] as const;

export const helpOptions = [
  { value: "automation", label: "AI agents and workflow automation" },
  { value: "development", label: "Custom software and product engineering" },
  { value: "intelligence", label: "Data, feedback, and decision intelligence" },
  { value: "strategy", label: "AI strategy and opportunity audit" },
  { value: "product", label: "Feedback Intelligence direction" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const budgetOptions = [
  { value: "unsure", label: "Not sure yet" },
  { value: "under-10", label: "Under $10,000" },
  { value: "10-25", label: "$10,000–$25,000" },
  { value: "25-50", label: "$25,000–$50,000" },
  { value: "50-plus", label: "$50,000 or more" },
] as const;

export const feedbackValue = [
  {
    title: "Read the conversations",
    text: "Bring reviews, support tickets, and call notes into one working set.",
  },
  {
    title: "Name the repeating themes",
    text: "Group different wording that points at the same product or service issue.",
  },
  {
    title: "Rank what to investigate",
    text: "Separate a sharp operational problem from a note that can wait.",
  },
  {
    title: "Recommend the next action",
    text: "Attach a concrete step and a way to tell whether it helped.",
  },
] as const;
