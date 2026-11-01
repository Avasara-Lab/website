export type ServiceOffer = {
  name: string;
  text: string;
};

export type ServicePage = {
  slug: string;
  title: string;
  problem: string;
  solution: string;
  capabilities: string[];
  cases: { title: string; text: string }[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  summary: string;
  outcome: string;
  offers: ServiceOffer[];
  page?: ServicePage;
};

export const serviceCategories: ServiceCategory[] = [
  {
    id: "agents",
    title: "AI Agents and Intelligent Automation",
    summary:
      "Custom agents and workflows that take the repeatable steps in sales, support, and operations, with a person still owning the judgment.",
    outcome: "Less copying between tools, faster first responses, and a clear handoff when a case needs a person.",
    offers: [
      { name: "Custom AI agents", text: "An agent scoped to one role, one set of tools, and one definition of done." },
      { name: "Multi-agent workflows", text: "Separate agents for research, drafting, and action, coordinated by explicit handoffs." },
      { name: "Business process automation", text: "Redesign a whole process, not only the last manual click." },
      { name: "Customer support automation", text: "Answer repeated questions and prepare the ticket a person still has to close." },
      { name: "Sales and CRM automation", text: "Qualify, follow up, and update the CRM from the conversation instead of retyping it." },
      { name: "WhatsApp and conversational automation", text: "Inbound chat or a stable voice script that captures the facts before a person joins." },
      { name: "Document and task automation", text: "Read invoices, forms, and contracts into fields, and route low-confidence rows to review." },
      { name: "AI-assisted internal operations", text: "Carry the reliable steps in an internal queue, and leave exceptions with the operator." },
    ],
    page: {
      slug: "ai-agents",
      title: "AI Agent Development",
      problem:
        "Teams hire or buy a chatbot and still retype the same lead, ticket, or status update. The missing piece is a role with tools, limits, and a handoff.",
      solution:
        "Avasara Lab designs a custom agent for one job: the inputs it may read, the actions it may take, and the moment a person takes over.",
      capabilities: [
        "Role definition, prompts, and tool access for a single business job",
        "Connections to CRM, inbox, chat, or internal APIs the team already uses",
        "Confidence checks and human approval on money, customers, or irreversible actions",
        "A short operating guide for the people who supervise the agent",
      ],
      cases: [
        { title: "Inbound qualification", text: "A chat intake captures need, timing, and budget band, then routes a complete note to the owner." },
        { title: "Support first response", text: "Repeated how-to questions get a sourced reply, and unusual cases open a ticket with the context attached." },
      ],
    },
  },
  {
    id: "generative",
    title: "Generative AI and Knowledge Systems",
    summary:
      "Applications that answer from your documents and records, with citations, access limits, and a boundary around what the model is allowed to do.",
    outcome: "People find the policy, account, or procedure without hunting through inboxes and shared drives.",
    offers: [
      { name: "Retrieval-augmented generation (RAG)", text: "Answers grounded in approved sources, with the passage attached." },
      { name: "Internal knowledge assistants", text: "A governed layer over SOPs, tickets, and notes for one department first." },
      { name: "Enterprise search", text: "Find the document or record by meaning, not only by the exact keyword." },
      { name: "Document intelligence", text: "Turn unstructured files into fields a system of record can store, with a review step." },
      { name: "Semantic search", text: "Cluster related wording so a search survives the way people actually phrase a problem." },
      { name: "AI-powered research and analysis", text: "Summarize a defined set of sources into a briefing a person can challenge." },
      { name: "LLM application development", text: "A task-specific application for drafting, extraction, or Q&A, not a raw chat window." },
    ],
    page: {
      slug: "generative-ai",
      title: "Generative AI and RAG",
      problem:
        "The answer exists in a policy, a ticket, or a contract, but people ask a colleague because search returns the wrong file.",
      solution:
        "We connect the approved sources, retrieve the relevant passages, and return an answer a person can check. Access follows the permissions you already have.",
      capabilities: [
        "Source inventory and a decision about what the assistant may read",
        "Retrieval, citations, and a refusal path when the source is missing",
        "Evaluation questions the team can rerun after the documents change",
        "Integration into chat, search, or an internal tool",
      ],
      cases: [
        { title: "Support knowledge", text: "Agents ask a question and see the SOP passage, not an unsourced paragraph." },
        { title: "Sales enablement", text: "A rep retrieves the current packaging and pricing note before a call." },
      ],
    },
  },
  {
    id: "data",
    title: "Data Engineering and Business Intelligence",
    summary:
      "Pipelines, models, and dashboards that make an operational question answerable without a Monday spreadsheet.",
    outcome: "One definition of the metric, a refresh the team trusts, and a view of what changed.",
    offers: [
      { name: "Data pipeline development", text: "Move product, CRM, and finance data on a schedule into tables the business can trust." },
      { name: "Data integration", text: "Join the systems that currently disagree about the same account." },
      { name: "Data processing and transformation", text: "Clean and model the records behind a metric, instead of copying another export." },
      { name: "Analytics dashboards", text: "Views for operators, not a chart for every column." },
      { name: "Business intelligence", text: "Recurring reports with an owner and a written definition." },
      { name: "Predictive analytics", text: "Estimates where the history is stable enough, including a ranked list a person still reviews." },
      { name: "Machine learning solutions", text: "Supervised models for a labeled outcome the team can audit." },
    ],
    page: {
      slug: "data-intelligence",
      title: "Data Analytics and Business Intelligence",
      problem:
        "Leaders ask why a number moved and the answer starts with someone exporting three spreadsheets.",
      solution:
        "We define the metric, build the pipeline that refreshes it, and put the view where the decision happens.",
      capabilities: [
        "Source mapping and a written metric definition",
        "Pipelines into a warehouse or the reporting tool you already pay for",
        "Dashboards for one operating question at a time",
        "Optional models for churn, anomalies, or forecasting when the history supports them",
      ],
      cases: [
        { title: "Weekly operating review", text: "Replace the copied forecast sheet with a refresh and an exception list." },
        { title: "Retention watch", text: "Surface accounts whose usage pattern changed, for a person to review." },
      ],
    },
  },
  {
    id: "software",
    title: "Custom Software and Product Engineering",
    summary:
      "Web, mobile, and internal products when the workflow needs software, not only an automation.",
    outcome: "A first version people can use, with the integrations and the quality bar written into the scope.",
    offers: [
      { name: "SaaS MVP development", text: "The smallest multi-tenant release that tests the business assumption." },
      { name: "Full-stack web applications", text: "Interface, API, and data model owned as one system." },
      { name: "Backend and API development", text: "Services, jobs, and contracts between the systems that have to stay in sync." },
      { name: "Internal business tools", text: "Admin and operations software shaped around a real queue of work." },
      { name: "AI-powered applications", text: "A product feature that uses a model only where it changes the job." },
      { name: "Workflow platforms", text: "Software for a process that a generic automation tool cannot hold." },
      { name: "Product prototyping", text: "Flows and a first version before the build hardens, including the checks that cannot silently break." },
    ],
    page: {
      slug: "saas-development",
      title: "AI-Powered SaaS Development",
      problem:
        "The product idea depends on software, and a generic automation tool cannot hold the workflow, the permissions, or the customer experience.",
      solution:
        "We design and build the application around the job to be done, including an AI feature only where it changes that job.",
      capabilities: [
        "Problem brief, success criteria, and an explicit out-of-scope list",
        "Product UX, application architecture, and the first release",
        "APIs and integrations with the systems the product depends on",
        "Tests and handover notes for the team that will own it",
      ],
      cases: [
        { title: "Internal operating tool", text: "Replace a shared spreadsheet with a queue, an owner, and an audit of what changed." },
        { title: "Customer-facing MVP", text: "Ship the one workflow that proves the offer, and leave the platform fantasy for later." },
      ],
    },
  },
  {
    id: "strategy",
    title: "AI Infrastructure and Implementation",
    summary:
      "Architecture, integration, deployment, and evaluation for an AI system someone on the team can actually run.",
    outcome: "A decision about what to build, what to leave alone, and how the result will be judged after it ships.",
    offers: [
      { name: "AI architecture consulting", text: "The shape of the system: data, model, tools, review, and what is out of scope." },
      { name: "Model and API integration", text: "Connect a model to the systems where the work already happens." },
      { name: "Deployment and monitoring", text: "Ship with a way to see quality, failure, and whether the workflow still behaves." },
      { name: "Cloud infrastructure", text: "Run the application on the cloud the company already uses, and resize a workload only with a reason." },
      { name: "MLOps implementation", text: "A path from a proof of concept to a model the team can redeploy and inspect." },
      { name: "AI workflow evaluation", text: "Checks the team can rerun after the documents, prompts, or process change." },
      { name: "Performance and cost optimization", text: "Choose the model, context, and controls for a defined task instead of an open-ended bill." },
    ],
    page: {
      slug: "opportunity-audits",
      title: "AI Architecture and Implementation",
      problem:
        "A company knows it wants AI and cannot yet point to the process, the owner, the architecture, or the number that should move.",
      solution:
        "We start with a short audit, then design the architecture, integration, and evaluation for a system the team can run. Sometimes the useful result is not to build.",
      capabilities: [
        "A short audit of the workflow, the data, and who owns the result",
        "An architecture for the model, tools, review path, and deployment",
        "Integration and evaluation checks the team can rerun",
        "A recommendation that includes what not to build",
      ],
      cases: [
        { title: "Operations bottleneck", text: "A weekly handoff between two systems is consistent enough to automate, with exceptions listed." },
        { title: "Premature platform", text: "The audit shows the data is not ready, and the next step is a source fix rather than a model." },
      ],
    },
  },
  {
    id: "growth",
    title: "AI-Powered Growth and Opportunity Intelligence",
    summary:
      "Research, visibility, and feedback work that helps a company see demand, friction, and the next operational move.",
    outcome: "A clearer picture of where customers struggle and where the business can respond.",
    offers: [
      { name: "Customer feedback analysis", text: "Group reviews, tickets, and notes into themes and a next step. The product direction is early." },
      { name: "Customer intelligence", text: "Read the conversations a company already has, without pretending a summary is the customer." },
      { name: "Business opportunity discovery", text: "Find the step that is repeated, slow, and well enough defined to change." },
      { name: "Lead intelligence", text: "Read inbound demand for patterns a person can act on." },
      { name: "Search and content intelligence", text: "Improve the pages and facts buyers and assistants need when they ask category questions." },
      { name: "GEO-related solutions", text: "Structure public information so AI answer engines can cite the company accurately." },
      { name: "Operational improvement analysis", text: "Describe the process as it is, including the workaround, and where work piles up." },
    ],
    page: {
      slug: "workflow-automation",
      title: "Opportunity Intelligence",
      problem:
        "Signals sit in tickets, reviews, search, and handoffs, and the team cannot yet name the opportunity worth acting on.",
      solution:
        "Opportunity Intelligence is available as an application in this site: upload records, review the evidence, and approve a simulated support workflow. A scoped analysis is still how a team starts when the data or the channel is outside that application.",
      capabilities: [
        "An inventory of the signals that matter for the question",
        "Themes and opportunities, with the constraint that makes each one real",
        "A recommended next step across feedback, search, leads, or operations",
        "A measure agreed before any build, such as repeat contacts or cycle time",
      ],
      cases: [
        { title: "Feedback theme", text: "Reviews and tickets describe the same billing gap. The reading names one product change and one support reply to test." },
        { title: "Search and GEO", text: "Public pages are missing facts an answer engine would need. The work lists what to publish. It does not promise citations." },
      ],
    },
  },
];

export const servicePages = serviceCategories.flatMap((category) =>
  category.page ? [{ ...category.page, categoryId: category.id, categoryTitle: category.title }] : [],
);

export function servicePageBySlug(slug: string) {
  return servicePages.find((page) => page.slug === slug);
}
