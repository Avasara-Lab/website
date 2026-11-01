import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { readModelApiKey } from "@/server/modules/meta-ai/catalog";
import type { AppDatabase } from "@/server/db/client";
import {
  agentRuns,
  agentTools,
  agents,
  aiConfigurations,
  aiUsageLogs,
  approvals,
  auditLogs,
  businessEntities,
  businessEvents,
  businessProfiles,
  businessRelationships,
  dataSources,
  departments,
  executionLogs,
  impactMetrics,
  ingestionJobs,
  interpretations,
  invitations,
  notifications,
  opportunities,
  opportunityEvidence,
  organizationMembers,
  signalEvidence,
  signals,
  uploadedFiles,
  user,
} from "@/server/db/schema";

export async function dashboard(db: AppDatabase, organizationId: string) {
  const [signalCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(signals)
    .where(and(eq(signals.organizationId, organizationId), eq(signals.status, "active")));
  const opportunityRows = await db
    .select({ status: opportunities.status, value: sql<number>`count(*)::int` })
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId))
    .groupBy(opportunities.status);
  const [agentCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(agents)
    .where(and(eq(agents.organizationId, organizationId), eq(agents.status, "active")));
  const [completed] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(opportunities)
    .where(and(eq(opportunities.organizationId, organizationId), eq(opportunities.status, "COMPLETED")));
  const metrics = await db.select().from(impactMetrics).where(eq(impactMetrics.organizationId, organizationId));
  const recent = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId))
    .orderBy(desc(opportunities.updatedAt))
    .limit(5);
  const byDepartment = await db
    .select({ department: sql<string>`jsonb_array_elements_text(${opportunities.departments})`, value: sql<number>`count(*)::int` })
    .from(opportunities)
    .where(eq(opportunities.organizationId, organizationId))
    .groupBy(sql`1`);
  return {
    signals: Number(signalCount?.value ?? 0),
    opportunities: Object.fromEntries(opportunityRows.map((row) => [row.status, Number(row.value)])),
    activeAgents: Number(agentCount?.value ?? 0),
    completedAutomations: Number(completed?.value ?? 0),
    metrics,
    recent,
    byDepartment: byDepartment.map((row) => ({ department: row.department, value: Number(row.value) })),
  };
}

export async function listSignals(db: AppDatabase, organizationId: string) {
  return db.select().from(signals).where(eq(signals.organizationId, organizationId)).orderBy(desc(signals.frequency));
}

export async function listOpportunities(db: AppDatabase, organizationId: string) {
  return db.select().from(opportunities).where(eq(opportunities.organizationId, organizationId)).orderBy(desc(opportunities.priorityScore));
}

export async function opportunityDetail(db: AppDatabase, organizationId: string, opportunityId: string) {
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, opportunityId), eq(opportunities.organizationId, organizationId)))
    .limit(1);
  if (!opportunity) return null;
  const links = await db.select().from(opportunityEvidence).where(eq(opportunityEvidence.opportunityId, opportunity.id));
  const signalRows = links.length
    ? await db
        .select()
        .from(signals)
        .where(and(eq(signals.organizationId, organizationId), inArray(signals.id, links.map((link) => link.signalId))))
    : [];
  const evidence = signalRows.length
    ? await db
        .select({
          signalId: signalEvidence.signalId,
          eventId: signalEvidence.eventId,
          role: signalEvidence.role,
          excerpt: signalEvidence.excerpt,
          provenance: signalEvidence.provenance,
          title: businessEvents.title,
          occurredAt: businessEvents.occurredAt,
          type: businessEvents.type,
        })
        .from(signalEvidence)
        .innerJoin(businessEvents, eq(businessEvents.id, signalEvidence.eventId))
        .where(and(eq(signalEvidence.organizationId, organizationId), inArray(signalEvidence.signalId, signalRows.map((row) => row.id))))
    : [];
  const approvalRows = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.opportunityId, opportunity.id), eq(approvals.organizationId, organizationId)))
    .orderBy(desc(approvals.createdAt));
  const agentRows = await db
    .select()
    .from(agents)
    .where(and(eq(agents.organizationId, organizationId), eq(agents.opportunityId, opportunity.id)));
  const notes = await db
    .select()
    .from(interpretations)
    .where(and(eq(interpretations.organizationId, organizationId), eq(interpretations.targetType, "opportunity"), eq(interpretations.targetId, opportunity.id)))
    .orderBy(desc(interpretations.createdAt));
  return { opportunity, signals: signalRows, evidence, approvals: approvalRows, agents: agentRows, interpretations: notes };
}

export async function memorySnapshot(db: AppDatabase, organizationId: string) {
  const entities = await db.select().from(businessEntities).where(eq(businessEntities.organizationId, organizationId)).orderBy(businessEntities.kind, businessEntities.name);
  const relationships = await db.select().from(businessRelationships).where(eq(businessRelationships.organizationId, organizationId)).limit(200);
  const events = await db
    .select()
    .from(businessEvents)
    .where(eq(businessEvents.organizationId, organizationId))
    .orderBy(desc(businessEvents.occurredAt))
    .limit(100);
  const [counts] = await db
    .select({
      observed: sql<number>`count(*) filter (where ${businessEvents.provenance} = 'observed')::int`,
      interpretation: sql<number>`count(*) filter (where ${businessEvents.provenance} = 'interpretation')::int`,
    })
    .from(businessEvents)
    .where(eq(businessEvents.organizationId, organizationId));
  const byType = await db
    .select({ type: businessEvents.type, value: sql<number>`count(*)::int` })
    .from(businessEvents)
    .where(and(eq(businessEvents.organizationId, organizationId), eq(businessEvents.provenance, "observed")))
    .groupBy(businessEvents.type);
  return { entities, relationships, events, counts, byType };
}

export async function connectSnapshot(db: AppDatabase, organizationId: string) {
  const sources = await db.select().from(dataSources).where(eq(dataSources.organizationId, organizationId)).orderBy(dataSources.type);
  const files = await db.select().from(uploadedFiles).where(eq(uploadedFiles.organizationId, organizationId)).orderBy(desc(uploadedFiles.createdAt));
  const jobs = await db.select().from(ingestionJobs).where(eq(ingestionJobs.organizationId, organizationId)).orderBy(desc(ingestionJobs.createdAt));
  return { sources, files, jobs };
}

export async function listAgents(db: AppDatabase, organizationId: string) {
  const rows = await db.select().from(agents).where(eq(agents.organizationId, organizationId)).orderBy(desc(agents.createdAt));
  const tools = rows.length ? await db.select().from(agentTools).where(inArray(agentTools.agentId, rows.map((row) => row.id))) : [];
  return { agents: rows, tools };
}

export async function listRuns(db: AppDatabase, organizationId: string) {
  return db.select().from(agentRuns).where(eq(agentRuns.organizationId, organizationId)).orderBy(desc(agentRuns.startedAt));
}

export async function runDetail(db: AppDatabase, organizationId: string, runId: string) {
  const [run] = await db
    .select()
    .from(agentRuns)
    .where(and(eq(agentRuns.id, runId), eq(agentRuns.organizationId, organizationId)))
    .limit(1);
  if (!run) return null;
  const logs = await db.select().from(executionLogs).where(and(eq(executionLogs.agentRunId, run.id), eq(executionLogs.organizationId, organizationId))).orderBy(executionLogs.createdAt);
  return { run, logs };
}

export async function listNotifications(db: AppDatabase, organizationId: string) {
  return db.select().from(notifications).where(eq(notifications.organizationId, organizationId)).orderBy(desc(notifications.createdAt)).limit(100);
}

export async function unreadCount(db: AppDatabase, organizationId: string) {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.organizationId, organizationId), sql`${notifications.readAt} is null`));
  return Number(row?.value ?? 0);
}

export async function teamSnapshot(db: AppDatabase, organizationId: string) {
  const members = await db
    .select({ id: organizationMembers.id, role: organizationMembers.role, email: user.email, name: user.name, createdAt: organizationMembers.createdAt })
    .from(organizationMembers)
    .innerJoin(user, eq(user.id, organizationMembers.userId))
    .where(eq(organizationMembers.organizationId, organizationId));
  const pendingRows = await db.select().from(invitations).where(and(eq(invitations.organizationId, organizationId), sql`${invitations.acceptedAt} is null`));
  const now = Date.now();
  const pending = pendingRows.map((invite) => ({ ...invite, expired: invite.expiresAt.getTime() < now }));
  return { members, pending };
}

export async function settingsSnapshot(db: AppDatabase, organizationId: string) {
  const [profile] = await db.select().from(businessProfiles).where(eq(businessProfiles.organizationId, organizationId)).limit(1);
  const departmentRows = await db.select().from(departments).where(eq(departments.organizationId, organizationId));
  const audits = await db.select().from(auditLogs).where(eq(auditLogs.organizationId, organizationId)).orderBy(desc(auditLogs.createdAt)).limit(30);
  return { profile, departments: departmentRows, audits };
}

export async function aiSnapshot(db: AppDatabase, organizationId: string) {
  const [config] = await db.select().from(aiConfigurations).where(eq(aiConfigurations.organizationId, organizationId)).limit(1);
  const usage = await db.select().from(aiUsageLogs).where(eq(aiUsageLogs.organizationId, organizationId)).orderBy(desc(aiUsageLogs.createdAt)).limit(20);
  return { config, usage, keyConfigured: Boolean(readModelApiKey()) };
}

export async function searchWorkspace(db: AppDatabase, organizationId: string, query: string) {
  const term = `%${query.replace(/[%_]/g, "")}%`;
  if (query.trim().length < 2) return { signals: [], opportunities: [], events: [] };
  const signalRows = await db
    .select()
    .from(signals)
    .where(and(eq(signals.organizationId, organizationId), or(ilike(signals.title, term), ilike(signals.description, term))))
    .limit(10);
  const opportunityRows = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.organizationId, organizationId), or(ilike(opportunities.title, term), ilike(opportunities.problem, term))))
    .limit(10);
  const eventRows = await db
    .select()
    .from(businessEvents)
    .where(and(eq(businessEvents.organizationId, organizationId), or(ilike(businessEvents.title, term), ilike(businessEvents.body, term))))
    .limit(10);
  return { signals: signalRows, opportunities: opportunityRows, events: eventRows };
}
