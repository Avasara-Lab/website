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
      { name: "Multi-agent systems", text: "Separate agents for research, drafting, and action, coordinated by explicit handoffs." },
      { name: "Role-based AI coworkers", text: "Sales, support, or operations roles built into the tools the team already uses." },
      { name: "AI assistants and copilots", text: "In-product help that drafts, summarizes, or looks up the next step." },
      { name: "AI chatbots and virtual assistants", text: "Guided conversations for common questions, with a path to a person." },
      { name: "Voice AI agents", text: "Phone or voice flows for intake, scheduling, and status, where the script is stable." },
      { name: "WhatsApp and chat automation", text: "Inbound chat that captures the facts a team needs before a person joins." },
      { name: "Customer support automation", text: "Deflect repeated questions and prepare the ticket a person still has to close." },
      { name: "Sales and marketing automation", text: "Follow-up, qualification notes, and campaign handoffs tied to the CRM." },
      { name: "CRM automation", text: "Create and update records from conversations instead of retyping them." },
      { name: "Lead qualification and routing", text: "Score intent from the conversation and send the right leads to the right owner." },
      { name: "Appointment and follow-up scheduling", text: "Offer times, confirm the meeting, and record the outcome." },
      { name: "Workflow automation", text: "Move a defined process from trigger to completion across the systems involved." },
      { name: "Business process automation", text: "Redesign a whole process, not only the last manual click." },
      { name: "AI-powered document processing", text: "Read invoices, forms, and contracts into structured fields." },
      { name: "Human-in-the-loop workflows", text: "Route low-confidence or high-impact steps to a reviewer before anything is committed." },
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
    title: "Generative AI and Enterprise Intelligence",
    summary:
      "Applications that answer from your documents and records, with citations, access limits, and a boundary around what the model is allowed to do.",
    outcome: "People find the policy, account, or procedure without hunting through inboxes and shared drives.",
    offers: [
      { name: "Generative AI application development", text: "A product surface around a model, not a raw chat window." },
      { name: "Large language model applications", text: "Task-specific apps for drafting, classification, extraction, or Q&A." },
      { name: "Retrieval-augmented generation", text: "Answers grounded in approved sources, with the passage attached." },
      { name: "Enterprise knowledge assistants", text: "A governed layer over SOPs, tickets, email, and notes for one department first." },
      { name: "AI-powered search", text: "Find the document or record by meaning, not only by the exact keyword." },
      { name: "Semantic search", text: "Cluster related wording so a search survives the way customers actually phrase a problem." },
      { name: "Document intelligence", text: "Turn unstructured files into fields a system of record can store." },
      { name: "AI copilots", text: "Side-panel help inside an internal tool or product workflow." },
      { name: "LLM integration and optimization", text: "Choose the model, the context window, and the cost controls for a defined task." },
      { name: "Custom AI applications", text: "Software built around one business question rather than a general assistant." },
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
      { name: "Data engineering", text: "Reliable tables for the questions the business actually asks." },
      { name: "ETL and ELT pipelines", text: "Move data from product, CRM, and finance systems on a schedule." },
      { name: "Data integration", text: "Join the systems that currently disagree about the same account." },
      { name: "Data warehousing", text: "A modeled store for reporting, not a copy of every raw export." },
      { name: "Business intelligence dashboards", text: "Views for operators, not a chart for every column." },
      { name: "Data analytics and reporting", text: "Recurring reports with an owner and a definition." },
      { name: "Predictive analytics", text: "Models where history is stable enough to estimate a future state." },
      { name: "Machine learning", text: "Supervised models for a labeled outcome the team can audit." },
      { name: "Customer analytics", text: "Read behavior by segment without mixing definitions." },
      { name: "Revenue analytics", text: "Connect pipeline, billing, and retention to the same account." },
      { name: "Customer segmentation", text: "Groups you can act on, with the rule written down." },
      { name: "Churn prediction", text: "A ranked list of accounts to review, not an automatic cancellation." },
      { name: "Anomaly detection", text: "Flag a break in a metric so a person can investigate." },
      { name: "Forecasting and optimization", text: "Planning views for demand, capacity, or workload." },
      { name: "Decision intelligence", text: "Tie a metric movement to the operational choice in front of a team." },
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
      { name: "SaaS application development", text: "Multi-tenant product work from the workflow outward." },
      { name: "AI-powered SaaS development", text: "A product feature that uses a model where it changes the job." },
      { name: "MVP development", text: "The smallest release that tests the business assumption." },
      { name: "Full-stack development", text: "Interface, API, and data model owned as one system." },
      { name: "Web application development", text: "Browser products for customers or internal teams." },
      { name: "Mobile application development", text: "iOS and Android when the job happens away from a desk." },
      { name: "API development and integrations", text: "Contracts between the systems that have to stay in sync." },
      { name: "Backend engineering", text: "Services, jobs, and data access behind the interface." },
      { name: "Internal business tools", text: "Admin and operations software shaped around a real queue of work." },
      { name: "Admin dashboards", text: "Controls for the people who run the product day to day." },
      { name: "Legacy application modernization", text: "Replace the fragile path without a rewrite for its own sake." },
      { name: "UI and UX design and prototyping", text: "Flows and interface structure before the build hardens." },
      { name: "Software testing and quality assurance", text: "Checks tied to the workflows that cannot silently break." },
      { name: "Low-code internal tools", text: "A faster internal surface when a full custom build is not the point." },
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
    title: "AI Strategy and Infrastructure",
    summary:
      "A scoped path from the business question to an architecture, a proof of concept, and a system someone can run.",
    outcome: "A decision about what to build, what to leave alone, and how the result will be judged.",
    offers: [
      { name: "AI readiness assessments", text: "Look at data, process, and ownership before a build starts." },
      { name: "AI strategy consulting", text: "Choose the few use cases that match how the company actually works." },
      { name: "AI opportunity audits", text: "Find the workflow where time, errors, or missed follow-up are concrete." },
      { name: "Proof-of-concept development", text: "A small build that answers whether the approach is worth continuing." },
      { name: "AI architecture and implementation", text: "The shape of the system: data, model, tools, and review." },
      { name: "Cloud application development", text: "Applications deployed on the cloud the company already uses." },
      { name: "Cloud migration and optimization", text: "Move or resize a workload with a reason, not a slogan." },
      { name: "Model deployment and MLOps", text: "Ship a model with a way to see whether it still behaves." },
      { name: "AI monitoring and evaluation", text: "Checks for quality, cost, and failure after launch." },
      { name: "AI system integration", text: "Connect the model to the systems where the work already happens." },
      { name: "Ongoing maintenance and optimization", text: "Keep a shipped workflow current as the process changes." },
    ],
    page: {
      slug: "opportunity-audits",
      title: "AI Opportunity Audits",
      problem:
        "A company knows it wants AI and cannot yet point to the process, the owner, or the number that should move.",
      solution:
        "The audit names a small set of opportunities, the evidence for each, and whether a build is justified yet. Sometimes the useful result is not to build.",
      capabilities: [
        "Interviews and a map of the current workflow",
        "A ranked set of opportunities with the constraint that makes each one real",
        "A recommended first engagement, including what is out of scope",
        "Success criteria the team can revisit after any build",
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
      { name: "Generative engine optimization", text: "Structure public information so AI answer engines can cite the company accurately." },
      { name: "AI-assisted search visibility", text: "Improve the pages and facts assistants need when buyers ask category questions." },
      { name: "Lead intelligence", text: "Read inbound demand for patterns a person can act on." },
      { name: "Customer feedback intelligence", text: "Group reviews, tickets, and notes into themes and a next step. The product direction is early." },
      { name: "Business process analysis", text: "Describe the process as it is, including the workaround." },
      { name: "Workflow opportunity discovery", text: "Find the step that is repeated, slow, and well enough defined to change." },
      { name: "AI-powered operational analysis", text: "Use the company's own records to see where work piles up." },
      { name: "AI-assisted customer research", text: "Summarize interviews and tickets without pretending the summary is the customer." },
      { name: "AI-powered market research", text: "Assemble public and internal signals into a briefing a team can challenge." },
      { name: "Business intelligence automation", text: "Deliver the recurring view without a manual assembly step." },
    ],
    page: {
      slug: "workflow-automation",
      title: "AI Workflow Automation",
      problem:
        "A reliable process still depends on someone copying status, files, or follow-ups between systems.",
      solution:
        "We map the path, automate the steps that do not need judgment, and leave a queue for the exceptions.",
      capabilities: [
        "A current-state map of tools, handoffs, and failure points",
        "Automation for the consistent steps, with logs a person can inspect",
        "Exception handling instead of a silent failure",
        "A measure agreed before the build, such as cycle time or repeat contacts",
      ],
      cases: [
        { title: "Revenue operations", text: "A CRM change updates the forecast fields that used to be pasted into a sheet." },
        { title: "Document intake", text: "An invoice becomes structured fields, and low-confidence rows wait for review." },
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
