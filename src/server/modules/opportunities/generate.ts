import {
  MINUTES_PER_REPEATED_REPLY,
  PRIORITY_METHOD,
  SUPPORT_AGENT_NAME,
  type DraftSignal,
} from "@/server/domain";

export type DraftOpportunity = {
  sourceKey: string;
  title: string;
  description: string;
  problem: string;
  departments: string[];
  frequency: number;
  impactSummary: string;
  confidence: number;
  estimatedMinutesSaved: number;
  recommendedSolution: string;
  suggestedAgent: string;
  executable: boolean;
  complexity: "low" | "medium" | "high";
  priorityScore: number;
  priority: "low" | "medium" | "high";
  priorityMethod: string;
  signalFingerprints: string[];
  savingsAssumption: string;
};

const TEMPLATES: Record<
  DraftSignal["opportunityGroup"],
  {
    title: string;
    problem: string;
    solution: string;
    agent: string;
    executable: boolean;
    complexity: DraftOpportunity["complexity"];
    minutesEach: number;
    assumption: string;
  }
> = {
  support_automation: {
    title: "Automate repeated customer support answers",
    problem: "Customers ask the same questions often enough that agents retype approved answers.",
    solution: "Use the Customer Support Automation Agent to propose the approved answer and send it only after a person approves the opportunity. The first channel is a simulated inbox.",
    agent: SUPPORT_AGENT_NAME,
    executable: true,
    complexity: "low",
    minutesEach: MINUTES_PER_REPEATED_REPLY,
    assumption: `${MINUTES_PER_REPEATED_REPLY} minutes per repeated reply. This is an assumption, not a measured time study.`,
  },
  sales_followup: {
    title: "Close the gap on delayed sales follow-ups",
    problem: "Proposals and demos sit without a recorded follow-up for more than 5 days.",
    solution: "A sales follow-up agent could draft the next touch from the proposal record. No executor is configured for that agent in this release.",
    agent: "Sales Follow-up Agent",
    executable: false,
    complexity: "medium",
    minutesEach: 15,
    assumption: "15 minutes per delayed deal, an assumption for drafting a follow-up. Not a measured saving.",
  },
  reporting_automation: {
    title: "Draft the weekly status report from operational records",
    problem: "The same weekly status report is compiled by hand.",
    solution: "A reporting draft agent could assemble the recurring sections. No executor is configured for that agent in this release.",
    agent: "Reporting Draft Agent",
    executable: false,
    complexity: "medium",
    minutesEach: 25,
    assumption: "25 minutes per manual weekly report, an assumption. Not a measured saving.",
  },
};

export function scoreOpportunity(input: {
  frequency: number;
  severity: DraftSignal["severity"];
  confidence: number;
  complexity: DraftOpportunity["complexity"];
}) {
  const severityWeight = input.severity === "high" ? 30 : input.severity === "medium" ? 20 : 10;
  const complexityWeight = input.complexity === "low" ? 10 : input.complexity === "medium" ? 5 : 0;
  const score = severityWeight + Math.min(input.frequency, 40) + Math.round(input.confidence * 20) + complexityWeight;
  const priority: DraftOpportunity["priority"] = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
  return { score, priority, method: PRIORITY_METHOD };
}

export function buildOpportunities(signals: DraftSignal[]): DraftOpportunity[] {
  const groups = new Map<DraftSignal["opportunityGroup"], DraftSignal[]>();
  for (const signal of signals) {
    const list = groups.get(signal.opportunityGroup) ?? [];
    list.push(signal);
    groups.set(signal.opportunityGroup, list);
  }

  const drafts: DraftOpportunity[] = [];
  for (const [group, members] of groups) {
    const template = TEMPLATES[group];
    const frequency = members.reduce((sum, signal) => sum + signal.frequency, 0);
    const confidence = Number((members.reduce((sum, signal) => sum + signal.confidence, 0) / members.length).toFixed(2));
    const severity = members.some((signal) => signal.severity === "high")
      ? "high"
      : members.some((signal) => signal.severity === "medium")
        ? "medium"
        : "low";
    const scored = scoreOpportunity({
      frequency,
      severity,
      confidence,
      complexity: template.complexity,
    });
    const departments = [...new Set(members.flatMap((signal) => signal.departments))].sort();
    drafts.push({
      sourceKey: group,
      title: template.title,
      description: members.map((signal) => signal.description).join(" "),
      problem: template.problem,
      departments,
      frequency,
      impactSummary: `Estimated time related to this pattern: ${frequency * template.minutesEach} minutes. ${template.assumption}`,
      confidence,
      estimatedMinutesSaved: frequency * template.minutesEach,
      recommendedSolution: template.solution,
      suggestedAgent: template.agent,
      executable: template.executable,
      complexity: template.complexity,
      priorityScore: scored.score,
      priority: scored.priority,
      priorityMethod: scored.method,
      signalFingerprints: members.map((signal) => signal.fingerprint),
      savingsAssumption: template.assumption,
    });
  }
  return drafts.sort((a, b) => b.priorityScore - a.priorityScore || a.sourceKey.localeCompare(b.sourceKey));
}
