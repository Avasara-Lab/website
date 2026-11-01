import { and, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import {
  businessEvents,
  notifications,
  opportunities,
  opportunityEvidence,
  signalEvidence,
  signals,
} from "@/server/db/schema";
import { type MemoryEventInput, excerpt } from "@/server/domain";
import { createId } from "@/server/ids";
import { recordImpact } from "@/server/modules/impact/service";
import { buildOpportunities } from "@/server/modules/opportunities/generate";
import { detectSignals, evidenceExcerpt } from "@/server/modules/signals/detect";

const OPEN_STATUSES = ["NEW", "INVESTIGATING", "READY_FOR_APPROVAL"];

export async function loadObservedEvents(db: AppDatabase, organizationId: string): Promise<MemoryEventInput[]> {
  const rows = await db
    .select()
    .from(businessEvents)
    .where(and(eq(businessEvents.organizationId, organizationId), eq(businessEvents.provenance, "observed")));
  return rows.map((row) => ({
    id: row.id,
    type: row.type as MemoryEventInput["type"],
    occurredAt: row.occurredAt,
    title: row.title,
    body: row.body,
    attributes: row.attributes ?? {},
  }));
}

export async function refreshIntelligence(db: AppDatabase, organizationId: string, asOf = new Date()) {
  const events = await loadObservedEvents(db, organizationId);
  const eventById = new Map(events.map((event) => [event.id, event]));
  const drafts = detectSignals(events, asOf);
  const fingerprints = drafts.map((draft) => draft.fingerprint);
  const existing = await db.select().from(signals).where(eq(signals.organizationId, organizationId));
  const existingByFingerprint = new Map(existing.map((row) => [row.fingerprint, row]));

  for (const draft of drafts) {
    const current = existingByFingerprint.get(draft.fingerprint);
    const signalId = current?.id ?? createId();
    if (!current) {
      await db.insert(signals).values({
        id: signalId,
        organizationId,
        fingerprint: draft.fingerprint,
        category: draft.category,
        title: draft.title,
        description: draft.description,
        frequency: draft.frequency,
        firstObserved: draft.firstObserved,
        lastObserved: draft.lastObserved,
        departments: draft.departments,
        confidence: draft.confidence,
        severity: draft.severity,
        trend: draft.trend,
        detectionMethod: draft.detectionMethod,
        opportunityGroup: draft.opportunityGroup,
        status: "active",
      });
      if (draft.severity === "high") {
        await db.insert(notifications).values({
          id: createId(),
          organizationId,
          title: draft.title,
          body: draft.description,
          kind: "signal",
          href: "/app/signals",
        });
      }
    } else {
      await db
        .update(signals)
        .set({
          title: draft.title,
          description: draft.description,
          frequency: draft.frequency,
          firstObserved: draft.firstObserved,
          lastObserved: draft.lastObserved,
          departments: draft.departments,
          confidence: draft.confidence,
          severity: draft.severity,
          trend: draft.trend,
          status: "active",
          updatedAt: new Date(),
        })
        .where(and(eq(signals.id, signalId), eq(signals.organizationId, organizationId)));
    }
    await db.delete(signalEvidence).where(and(eq(signalEvidence.signalId, signalId), eq(signalEvidence.organizationId, organizationId)));
    const evidenceRows = [
      ...draft.primaryEventIds.map((eventId) => ({ eventId, role: "primary" })),
      ...draft.supportingEventIds.map((eventId) => ({ eventId, role: "supporting" })),
    ].filter((item) => eventById.has(item.eventId));
    if (evidenceRows.length) {
      await db.insert(signalEvidence).values(
        evidenceRows.map((item) => ({
          id: createId(),
          organizationId,
          signalId,
          eventId: item.eventId,
          role: item.role,
          excerpt: evidenceExcerpt(eventById.get(item.eventId)!),
          provenance: "observed" as const,
        })),
      );
    }
  }

  const stale = existing.filter((row) => !fingerprints.includes(row.fingerprint));
  if (stale.length) {
    await db
      .update(signals)
      .set({ status: "dismissed", updatedAt: new Date() })
      .where(
        and(
          eq(signals.organizationId, organizationId),
          inArray(
            signals.id,
            stale.map((row) => row.id),
          ),
        ),
      );
  }

  const active = await db
    .select()
    .from(signals)
    .where(and(eq(signals.organizationId, organizationId), eq(signals.status, "active")));
  const activeDrafts = drafts.filter((draft) => active.some((row) => row.fingerprint === draft.fingerprint));
  const opportunityDrafts = buildOpportunities(activeDrafts);
  const currentOpportunities = await db.select().from(opportunities).where(eq(opportunities.organizationId, organizationId));

  for (const draft of opportunityDrafts) {
    const current = currentOpportunities.find((row) => row.sourceKey === draft.sourceKey);
    const locked = current && !OPEN_STATUSES.includes(current.status);
    const opportunityId = current?.id ?? createId();
    if (!current) {
      await db.insert(opportunities).values({
        id: opportunityId,
        organizationId,
        sourceKey: draft.sourceKey,
        title: draft.title,
        description: draft.description,
        problem: draft.problem,
        departments: draft.departments,
        frequency: draft.frequency,
        impactSummary: draft.impactSummary,
        confidence: draft.confidence,
        estimatedMinutesSaved: draft.estimatedMinutesSaved,
        recommendedSolution: draft.recommendedSolution,
        suggestedAgent: draft.suggestedAgent,
        executable: draft.executable,
        complexity: draft.complexity,
        priorityScore: draft.priorityScore,
        priority: draft.priority,
        priorityMethod: draft.priorityMethod,
        status: "NEW",
      });
      await db.insert(notifications).values({
        id: createId(),
        organizationId,
        title: `New opportunity: ${draft.title}`,
        body: excerpt(draft.problem),
        kind: "opportunity",
        href: `/app/opportunities/${opportunityId}`,
      });
    } else {
      await db
        .update(opportunities)
        .set({
          title: draft.title,
          description: draft.description,
          problem: draft.problem,
          departments: draft.departments,
          frequency: draft.frequency,
          impactSummary: draft.impactSummary,
          confidence: draft.confidence,
          estimatedMinutesSaved: draft.estimatedMinutesSaved,
          recommendedSolution: draft.recommendedSolution,
          suggestedAgent: draft.suggestedAgent,
          executable: draft.executable,
          complexity: draft.complexity,
          priorityScore: draft.priorityScore,
          priority: draft.priority,
          priorityMethod: draft.priorityMethod,
          updatedAt: new Date(),
          ...(locked ? {} : {}),
        })
        .where(and(eq(opportunities.id, opportunityId), eq(opportunities.organizationId, organizationId)));
    }
    const linked = active.filter((row) => draft.signalFingerprints.includes(row.fingerprint));
    await db
      .delete(opportunityEvidence)
      .where(and(eq(opportunityEvidence.opportunityId, opportunityId), eq(opportunityEvidence.organizationId, organizationId)));
    if (linked.length) {
      await db.insert(opportunityEvidence).values(
        linked.map((signal) => ({
          id: createId(),
          organizationId,
          opportunityId,
          signalId: signal.id,
          note: signal.title,
          provenance: "observed" as const,
        })),
      );
    }
  }

  const liveKeys = new Set(opportunityDrafts.map((draft) => draft.sourceKey));
  for (const opportunity of currentOpportunities) {
    if (!liveKeys.has(opportunity.sourceKey) && OPEN_STATUSES.includes(opportunity.status)) {
      await db
        .update(opportunities)
        .set({ status: "REJECTED", updatedAt: new Date() })
        .where(and(eq(opportunities.id, opportunity.id), eq(opportunities.organizationId, organizationId)));
    }
  }

  await recordImpact(db, organizationId);
  return { signals: drafts.length, opportunities: opportunityDrafts.length };
}
