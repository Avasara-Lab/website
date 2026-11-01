import { and, eq, sql } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import {
  agentRuns,
  approvals,
  businessEvents,
  executionLogs,
  impactMetrics,
  opportunities,
  organizations,
  signals,
} from "@/server/db/schema";
import { MINUTES_PER_REPEATED_REPLY } from "@/server/domain";
import { createId } from "@/server/ids";

type Metric = {
  metricKey: string;
  label: string;
  value: number;
  unit: string;
  classification: "observed" | "interpretation" | "estimate" | "simulated" | "verified";
  details: Record<string, unknown>;
};

export async function recordImpact(db: AppDatabase, organizationId: string) {
  const snapshot = await buildImpact(db, organizationId);
  await db.delete(impactMetrics).where(eq(impactMetrics.organizationId, organizationId));
  if (snapshot.metrics.length) {
    await db.insert(impactMetrics).values(
      snapshot.metrics.map((metric) => ({
        id: createId(),
        organizationId,
        metricKey: metric.metricKey,
        label: metric.label,
        value: metric.value,
        unit: metric.unit,
        classification: metric.classification,
        synthetic: snapshot.synthetic,
        details: metric.details,
      })),
    );
  }
  return snapshot;
}

export async function buildImpact(db: AppDatabase, organizationId: string) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  const [events] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(businessEvents)
    .where(and(eq(businessEvents.organizationId, organizationId), eq(businessEvents.provenance, "observed")));
  const [activeSignals] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(signals)
    .where(and(eq(signals.organizationId, organizationId), eq(signals.status, "active")));
  const [discovered] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId));
  const [approved] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(approvals)
    .where(and(eq(approvals.organizationId, organizationId), eq(approvals.status, "approved")));
  const [simulatedReplies] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(executionLogs)
    .where(and(eq(executionLogs.organizationId, organizationId), eq(executionLogs.step, "EXECUTE"), eq(executionLogs.provenance, "simulated")));
  const [runs] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(agentRuns)
    .where(eq(agentRuns.organizationId, organizationId));
  const [verifiedRuns] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(agentRuns)
    .where(and(eq(agentRuns.organizationId, organizationId), eq(agentRuns.verificationStatus, "verified")));
  const [estimated] = await db
    .select({ value: sql<number>`coalesce(sum(${opportunities.estimatedMinutesSaved}), 0)::int` })
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId));
  const [measured] = await db
    .select({ value: sql<number>`coalesce(sum(${opportunities.measuredMinutesSaved}), 0)::int` })
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId));

  const runCount = Number(runs?.value ?? 0);
  const verifiedCount = Number(verifiedRuns?.value ?? 0);
  const replyCount = Number(simulatedReplies?.value ?? 0);
  const metrics: Metric[] = [
    { metricKey: "observed_events", label: "Observed business events", value: Number(events?.value ?? 0), unit: "events", classification: "observed", details: {} },
    { metricKey: "active_signals", label: "Active signals", value: Number(activeSignals?.value ?? 0), unit: "signals", classification: "observed", details: { detection: "deterministic" } },
    { metricKey: "opportunities_discovered", label: "Opportunities discovered", value: Number(discovered?.value ?? 0), unit: "opportunities", classification: "observed", details: {} },
    { metricKey: "human_approvals", label: "Human approvals", value: Number(approved?.value ?? 0), unit: "approvals", classification: "observed", details: {} },
    {
      metricKey: "tasks_automated",
      label: "Replies recorded on the simulated inbox",
      value: replyCount,
      unit: "replies",
      classification: "simulated",
      details: { channel: "simulated_support_inbox" },
    },
    {
      metricKey: "verified_runs",
      label: "Verified agent runs",
      value: verifiedCount,
      unit: "runs",
      classification: "verified",
      details: { rule: "Each reply matched an observed approved answer." },
    },
    {
      metricKey: "success_rate",
      label: "Verification success rate",
      value: runCount ? verifiedCount / runCount : 0,
      unit: "ratio",
      classification: runCount ? "verified" : "observed",
      details: { runs: runCount, verified: verifiedCount },
    },
    {
      metricKey: "estimated_minutes",
      label: "Estimated minutes tied to detected patterns",
      value: Number(estimated?.value ?? 0),
      unit: "minutes",
      classification: "estimate",
      details: { note: "Frequency times an assumed minutes-per-task figure. Not a time study." },
    },
    {
      metricKey: "measured_minutes",
      label: "Minutes attached after verified replies",
      value: Number(measured?.value ?? 0),
      unit: "minutes",
      classification: "estimate",
      details: {
        note: `The reply count is verified. The minutes still use the ${MINUTES_PER_REPEATED_REPLY}-minute assumption, so this row stays an estimate.`,
      },
    },
  ];
  return { synthetic: org?.synthetic ?? false, metrics };
}
