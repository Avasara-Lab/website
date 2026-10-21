"use client";

import { useState } from "react";

const demos = [
  {
    id: "opportunity",
    label: "AI Opportunity Intelligence",
    kicker: "Signals to a next step",
    body: "Sample support notes are grouped, then turned into an opportunity a team could investigate. This is not a client result.",
  },
  {
    id: "sales",
    label: "AI Sales Agents",
    kicker: "Intake before a person joins",
    body: "A synthetic conversation captures the operating problem and stops before it invents a price or a promise.",
  },
  {
    id: "workflow",
    label: "Intelligent Workflow Automation",
    kicker: "The reliable steps only",
    body: "A weekly CRM export is drawn as a path. Exceptions stay in a review queue.",
  },
  {
    id: "dashboard",
    label: "Business Intelligence Dashboards",
    kicker: "One operating question",
    body: "Sample theme counts show how a dashboard can rank attention. The figures are invented for the layout.",
  },
] as const;

export function DemoStage() {
  const [active, setActive] = useState<(typeof demos)[number]["id"]>("opportunity");
  const current = demos.find((demo) => demo.id === active) ?? demos[0];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Illustrative demonstrations">
        {demos.map((demo) => {
          const selected = demo.id === active;
          return (
            <button
              key={demo.id}
              type="button"
              role="tab"
              id={`tab-${demo.id}`}
              aria-selected={selected}
              aria-controls={`panel-${demo.id}`}
              onClick={() => setActive(demo.id)}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                selected ? "border-btn bg-btn text-on-btn" : "border-line bg-surface text-navy hover:border-cyan/40"
              }`}
            >
              {demo.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="panel mt-4 rounded-xl p-5 sm:p-7"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">Illustrative · synthetic data</p>
        <h3 className="mt-2 font-display text-3xl text-navy">{current.kicker}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{current.body}</p>
        <div className="mt-6">
          {current.id === "opportunity" ? <OpportunityDemo /> : null}
          {current.id === "sales" ? <SalesDemo /> : null}
          {current.id === "workflow" ? <WorkflowDemo /> : null}
          {current.id === "dashboard" ? <DashboardDemo /> : null}
        </div>
      </div>
    </div>
  );
}

function OpportunityDemo() {
  const rows = [
    ["Signal", "18 sample tickets mention invoice timing after a plan change."],
    ["Theme", "Billing handoff"],
    ["Opportunity", "Show the next invoice date in the confirmation."],
    ["Impact to test", "Repeat contacts about the same invoice within seven days."],
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([term, detail]) => (
        <div key={term} className="rounded-lg border border-line px-4 py-3">
          <dt className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">{term}</dt>
          <dd className="mt-1 text-sm leading-6 text-ink">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

function SalesDemo() {
  const lines = [
    ["Visitor", "We need help with a weekly forecast that still starts in the CRM."],
    ["Agent", "Who prepares it, and which fields are copied by hand?"],
    ["Visitor", "Revops. Stage, owner, and close month."],
    ["Agent", "Noted. A person should scope this. I will not estimate a price."],
  ];
  return (
    <ol className="space-y-3">
      {lines.map(([who, text]) => (
        <li key={text} className="flex gap-3 text-sm leading-6">
          <span className="w-16 shrink-0 font-semibold text-navy">{who}</span>
          <span className="text-ink">{text}</span>
        </li>
      ))}
    </ol>
  );
}

function WorkflowDemo() {
  const steps = ["CRM status changes", "Map the standard fields", "Write the forecast row", "Queue mismatches for review"];
  return (
    <ol className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step} className="rounded-lg bg-paper px-3 py-4">
          <span className="font-mono text-xs text-cyan">0{index + 1}</span>
          <p className="mt-2 text-sm leading-5 text-navy">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function DashboardDemo() {
  const bars = [
    ["Billing", 78],
    ["Onboarding", 54],
    ["Exports", 46],
    ["Permissions", 22],
  ];
  return (
    <div className="space-y-3" aria-label="Synthetic theme counts">
      {bars.map(([label, width]) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-muted">
            <span>{label}</span>
            <span>{width} sample notes</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-paper">
            <div className={`h-2 rounded-full ${label === "Billing" ? "bg-orange" : "bg-cyan"}`} style={{ width: `${width}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
