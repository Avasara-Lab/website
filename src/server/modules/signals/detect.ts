import {
  type DraftSignal,
  type MemoryEventInput,
  boolAttr,
  excerpt,
  stringAttr,
} from "@/server/domain";

const SUPPORT_MIN = 8;
const SALES_DELAY_DAYS = 5;
const SALES_MIN = 5;
const REPORT_MIN = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const INTENT_RULES: { intent: string; label: string; pattern: RegExp }[] = [
  { intent: "password_reset", label: "password reset", pattern: /\b(password reset|reset (my |the )?password|locked out)\b/i },
  { intent: "invoice_copy", label: "invoice copy", pattern: /\b(invoice copy|copy of (the |my )?invoice|resend (the |my )?invoice)\b/i },
  { intent: "api_rate_limit", label: "API rate limit", pattern: /\b(rate limit|429|too many requests)\b/i },
  { intent: "workspace_sso", label: "workspace SSO access", pattern: /\b(single sign-?on|\bsso\b|workspace access)\b/i },
];

export function classifySupportIntent(event: MemoryEventInput) {
  const explicit = stringAttr(event.attributes, "intent");
  if (explicit) return { intent: explicit, explicit: true };
  const haystack = `${event.title}\n${event.body}`;
  const match = INTENT_RULES.find((rule) => rule.pattern.test(haystack));
  return match ? { intent: match.intent, explicit: false } : null;
}

function severityFor(frequency: number, medium: number, high: number): DraftSignal["severity"] {
  if (frequency >= high) return "high";
  if (frequency >= medium) return "medium";
  return "low";
}

function trendFor(dates: Date[], start: Date, end: Date): DraftSignal["trend"] {
  if (dates.length < 4) return "flat";
  const mid = start.getTime() + (end.getTime() - start.getTime()) / 2;
  const early = dates.filter((date) => date.getTime() <= mid).length;
  const late = dates.length - early;
  if (late > early * 1.15) return "up";
  if (late < early * 0.85) return "down";
  return "flat";
}

function departmentsFrom(events: MemoryEventInput[]) {
  return [...new Set(events.map((event) => stringAttr(event.attributes, "department")).filter((value): value is string => Boolean(value)))].sort();
}

function span(events: MemoryEventInput[]) {
  const times = events.map((event) => event.occurredAt.getTime());
  return {
    first: new Date(Math.min(...times)),
    last: new Date(Math.max(...times)),
  };
}

export function detectSignals(events: MemoryEventInput[], asOf: Date): DraftSignal[] {
  const signals: DraftSignal[] = [];
  signals.push(...detectSupport(events));
  signals.push(...detectSales(events, asOf));
  signals.push(...detectReporting(events));
  return signals.sort((a, b) => b.frequency - a.frequency || a.fingerprint.localeCompare(b.fingerprint));
}

function detectSupport(events: MemoryEventInput[]): DraftSignal[] {
  const groups = new Map<string, { events: MemoryEventInput[]; explicit: number }>();
  for (const event of events) {
    if (event.type !== "support_conversation") continue;
    const classified = classifySupportIntent(event);
    if (!classified) continue;
    const current = groups.get(classified.intent) ?? { events: [], explicit: 0 };
    current.events.push(event);
    if (classified.explicit) current.explicit += 1;
    groups.set(classified.intent, current);
  }

  const drafts: DraftSignal[] = [];
  for (const [intent, group] of groups) {
    if (group.events.length < SUPPORT_MIN) continue;
    const { first, last } = span(group.events);
    const explicitRatio = group.explicit / group.events.length;
    const confidence = Math.min(0.95, 0.55 + group.events.length / 120) * (explicitRatio === 1 ? 1 : 0.85);
    const label = INTENT_RULES.find((rule) => rule.intent === intent)?.label ?? intent.replaceAll("_", " ");
    drafts.push({
      fingerprint: `repeated_support_question:${intent}`,
      category: "repeated_support_question",
      title: `Repeated support question: ${label}`,
      description: `${group.events.length} observed support conversations match “${label}”. The count is deterministic. It is not a model estimate.`,
      frequency: group.events.length,
      firstObserved: first,
      lastObserved: last,
      departments: departmentsFrom(group.events),
      primaryEventIds: group.events.map((event) => event.id),
      supportingEventIds: [],
      confidence: Number(confidence.toFixed(2)),
      severity: severityFor(group.events.length, 12, 20),
      trend: trendFor(group.events.map((event) => event.occurredAt), first, last),
      detectionMethod: "deterministic",
      opportunityGroup: "support_automation",
    });
  }
  return drafts;
}

function detectSales(events: MemoryEventInput[], asOf: Date): DraftSignal[] {
  const sales = events.filter((event) => event.type === "sales_activity");
  const byDeal = new Map<string, MemoryEventInput[]>();
  for (const event of sales) {
    const dealId = stringAttr(event.attributes, "dealId");
    if (!dealId) continue;
    const list = byDeal.get(dealId) ?? [];
    list.push(event);
    byDeal.set(dealId, list);
  }

  const delayed: MemoryEventInput[] = [];
  for (const dealEvents of byDeal.values()) {
    const proposals = dealEvents
      .filter((event) => {
        const activity = stringAttr(event.attributes, "activityType");
        return activity === "proposal" || activity === "quote" || activity === "demo";
      })
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
    const proposal = proposals[0];
    if (!proposal) continue;
    const deadline = proposal.occurredAt.getTime() + SALES_DELAY_DAYS * DAY_MS;
    if (asOf.getTime() < deadline) continue;
    const timely = dealEvents.some((event) => {
      const activity = stringAttr(event.attributes, "activityType");
      if (activity !== "follow_up" && activity !== "followup") return false;
      const time = event.occurredAt.getTime();
      return time > proposal.occurredAt.getTime() && time <= deadline;
    });
    if (!timely) delayed.push(proposal);
  }

  if (delayed.length < SALES_MIN) return [];
  const { first, last } = span(delayed);
  return [
    {
      fingerprint: "delayed_sales_followup:proposal",
      category: "delayed_sales_followup",
      title: "Sales proposals without a follow-up inside 5 days",
      description: `${delayed.length} observed proposals, quotes, or demos have no follow-up activity in the next 5 days. The window is fixed in the detector. Deals with a follow-up inside that window are excluded.`,
      frequency: delayed.length,
      firstObserved: first,
      lastObserved: last,
      departments: departmentsFrom(delayed),
      primaryEventIds: delayed.map((event) => event.id),
      supportingEventIds: [],
      confidence: 0.9,
      severity: severityFor(delayed.length, 8, 15),
      trend: trendFor(delayed.map((event) => event.occurredAt), first, last),
      detectionMethod: "deterministic",
      opportunityGroup: "sales_followup",
    },
  ];
}

function detectReporting(events: MemoryEventInput[]): DraftSignal[] {
  const reports = events.filter(
    (event) =>
      event.type === "operational_record" &&
      stringAttr(event.attributes, "process") === "weekly_status_report" &&
      boolAttr(event.attributes, "manual") === true,
  );
  if (reports.length < REPORT_MIN) return [];
  const supporting = events.filter(
    (event) => event.type === "meeting_transcript" && boolAttr(event.attributes, "mentionsManualReporting") === true,
  );
  const { first, last } = span(reports);
  return [
    {
      fingerprint: "repetitive_reporting:weekly_status_report",
      category: "repetitive_reporting",
      title: "Repetitive manual weekly status reports",
      description: `${reports.length} observed operational records are manual weekly status reports. Meeting transcripts that mention the same manual reporting are supporting evidence and are not added to the frequency.`,
      frequency: reports.length,
      firstObserved: first,
      lastObserved: last,
      departments: departmentsFrom(reports),
      primaryEventIds: reports.map((event) => event.id),
      supportingEventIds: supporting.map((event) => event.id),
      confidence: 0.92,
      severity: severityFor(reports.length, 12, 24),
      trend: trendFor(reports.map((event) => event.occurredAt), first, last),
      detectionMethod: "deterministic",
      opportunityGroup: "reporting_automation",
    },
  ];
}

export function evidenceExcerpt(event: MemoryEventInput) {
  return excerpt(`${event.title}. ${event.body}`);
}
