import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { DEMO_AS_OF, DEMO_COMPANY, buildSyntheticRecords } from "@/server/demo/synthetic-company";
import * as schema from "@/server/db/schema";
import { businessEvents, dataSources, signals } from "@/server/db/schema";
import { createId, sha256 } from "@/server/ids";
import { WorkflowError, createSupportAgent, decideOpportunity, executeSupportWorkflow } from "@/server/modules/agents/execute";
import { UploadError, acceptUpload } from "@/server/modules/business-connect/service";
import { buildImpact } from "@/server/modules/impact/service";
import { ingestRecords } from "@/server/modules/ingestion/persist";
import { loadObservedEvents } from "@/server/modules/intelligence/service";
import { createOrganization, acceptInvitation, createInvitation } from "@/server/modules/organizations/service";
import { searchWorkspace, teamSnapshot } from "@/server/modules/read/service";

test("register through impact keeps organizations isolated", async () => {
  process.env.BETTER_AUTH_SECRET = "test-secret-test-secret";
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
  const sql = postgres("postgres://avasara:avasara@127.0.0.1:5432/avasara_test", { max: 1 });
  const db = drizzle(sql, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await sql`TRUNCATE TABLE organizations, "user" RESTART IDENTITY CASCADE`;

  const ownerId = createId();
  const otherId = createId();
  const memberId = createId();
  const now = new Date();
  await db.insert(schema.user).values([
    { id: ownerId, name: "Demo Founder", email: "founder@avasara-demo.test", emailVerified: true, createdAt: now, updatedAt: now },
    { id: otherId, name: "Other Owner", email: "other@example.test", emailVerified: true, createdAt: now, updatedAt: now },
    { id: memberId, name: "Reader", email: "reader@example.test", emailVerified: true, createdAt: now, updatedAt: now },
  ]);

  const organizationId = await createOrganization(db, {
    userId: ownerId,
    name: DEMO_COMPANY,
    industry: "Software",
    employeeCount: 25,
    objectives: "Reduce repeated support work.",
    departmentNames: ["Sales", "Customer Support", "Operations"],
    synthetic: true,
  });
  const otherOrganizationId = await createOrganization(db, {
    userId: otherId,
    name: "Other Company",
    departmentNames: ["General"],
  });
  await db.insert(schema.organizationMembers).values({
    id: createId(),
    organizationId,
    userId: memberId,
    role: "member",
  });

  const [source] = await db.select().from(dataSources).where(eq(dataSources.organizationId, organizationId));
  assert.ok(source);
  const ingested = await ingestRecords(db, {
    organizationId,
    dataSourceId: source.id,
    records: buildSyntheticRecords(),
    asOf: DEMO_AS_OF,
  });
  assert.equal(ingested.written, buildSyntheticRecords().length);
  assert.equal(ingested.signals >= 6, true);

  const ownSignals = await db.select().from(signals).where(eq(signals.organizationId, organizationId));
  const otherSignals = await db.select().from(signals).where(eq(signals.organizationId, otherOrganizationId));
  const otherEvents = await loadObservedEvents(db, otherOrganizationId);
  assert.equal(otherSignals.length, 0);
  assert.equal(otherEvents.length, 0);
  assert.equal(ownSignals.filter((signal) => signal.status === "active").length >= 6, true);

  const opportunities = await db.select().from(schema.opportunities).where(eq(schema.opportunities.organizationId, organizationId));
  const support = opportunities.find((item) => item.sourceKey === "support_automation");
  const sales = opportunities.find((item) => item.sourceKey === "sales_followup");
  assert.ok(support);
  assert.ok(sales);
  await assert.rejects(
    () => decideOpportunity(db, { organizationId, opportunityId: support.id, userId: memberId, role: "member", decision: "approved" }),
    WorkflowError,
  );
  await assert.rejects(
    () => executeSupportWorkflow(db, { organizationId, opportunityId: support.id, userId: ownerId, role: "owner" }),
    /Approve the opportunity/,
  );
  await assert.rejects(
    () => executeSupportWorkflow(db, { organizationId, opportunityId: sales.id, userId: ownerId, role: "owner" }),
    /No execution tool/,
  );

  await decideOpportunity(db, { organizationId, opportunityId: support.id, userId: ownerId, role: "owner", decision: "approved" });
  const agentId = await createSupportAgent(db, { organizationId, opportunityId: support.id, modelId: "muse-spark-1.3" });
  assert.ok(agentId);
  const execution = await executeSupportWorkflow(db, { organizationId, opportunityId: support.id, userId: ownerId, role: "owner" });
  assert.equal(execution.verified, true);
  assert.equal(execution.sends, 4);

  const impact = await buildImpact(db, organizationId);
  const simulated = impact.metrics.find((metric) => metric.metricKey === "tasks_automated");
  const minutes = impact.metrics.find((metric) => metric.metricKey === "measured_minutes");
  const verified = impact.metrics.find((metric) => metric.metricKey === "verified_runs");
  assert.equal(impact.synthetic, true);
  assert.equal(simulated?.classification, "simulated");
  assert.equal(simulated?.value, 4);
  assert.equal(minutes?.classification, "estimate");
  assert.equal(verified?.classification, "verified");
  assert.equal(verified?.value, 1);

  const otherImpact = await buildImpact(db, otherOrganizationId);
  assert.equal(otherImpact.metrics.find((metric) => metric.metricKey === "tasks_automated")?.value, 0);
  assert.equal((await db.select().from(businessEvents).where(eq(businessEvents.organizationId, otherOrganizationId))).length, 0);

  const file = Buffer.from("type,occurred_at,title,body\ndocument,2026-05-01T00:00:00.000Z,Note,Hello record\n");
  const first = await acceptUpload(db, { organizationId, userId: ownerId, filename: "notes.csv", bytes: file });
  assert.equal(first.queued, false);
  await assert.rejects(
    () => acceptUpload(db, { organizationId, userId: ownerId, filename: "notes.csv", bytes: file }),
    (error: unknown) => error instanceof UploadError && error.status === 409,
  );

  const invite = await createInvitation(db, {
    organizationId,
    email: "reader@example.test",
    role: "member",
    createdBy: ownerId,
  });
  const [storedInvite] = await db.select().from(schema.invitations).where(eq(schema.invitations.id, invite.id));
  assert.ok(storedInvite);
  assert.equal(storedInvite.tokenHash, sha256(invite.token));
  assert.notEqual(storedInvite.tokenHash, invite.token);
  await assert.rejects(
    () => acceptInvitation(db, { token: invite.token, userId: otherId, email: "other@example.test" }),
    /invited email/,
  );
  assert.equal(await acceptInvitation(db, { token: invite.token, userId: memberId, email: "Reader@example.test" }), organizationId);
  const otherTeam = await teamSnapshot(db, otherOrganizationId);
  assert.equal(otherTeam.pending.length, 0);
  assert.equal(otherTeam.members.some((member) => member.email === "reader@example.test"), false);
  const leaked = await searchWorkspace(db, otherOrganizationId, "password reset");
  assert.equal(leaked.events.length, 0);
  assert.equal(leaked.opportunities.length, 0);
  assert.equal(leaked.signals.length, 0);
  const ownSearch = await searchWorkspace(db, organizationId, "password reset");
  assert.equal(ownSearch.events.length > 0, true);

  await sql.end();
});
