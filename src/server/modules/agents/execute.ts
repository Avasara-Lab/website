import { and, desc, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import {
  agentRuns,
  agentTools,
  agents,
  approvals,
  businessEvents,
  executionLogs,
  opportunities,
  opportunityEvidence,
  signalEvidence,
  workflowExecutions,
  workflows,
} from "@/server/db/schema";
import {
  MINUTES_PER_REPEATED_REPLY,
  SUPPORT_AGENT_NAME,
  SUPPORT_TOOLS,
  WORKFLOW_STEPS,
  type MemoryEventInput,
  canWrite,
  type Role,
} from "@/server/domain";
import { createId } from "@/server/ids";
import { assertAgentTools, planSupportExecution, verifySupportSends } from "@/server/modules/agents/plan";
import { recordImpact } from "@/server/modules/impact/service";

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

export async function createSupportAgent(
  db: AppDatabase,
  input: { organizationId: string; opportunityId: string; modelId: string },
) {
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.organizationId, input.organizationId)))
    .limit(1);
  if (!opportunity) throw new WorkflowError("That opportunity is not in this organization.");
  if (!opportunity.executable || opportunity.suggestedAgent !== SUPPORT_AGENT_NAME) {
    throw new WorkflowError("This opportunity does not have an executor. The recommendation is recorded, and no external tool is called.");
  }
  const id = createId();
  await db.insert(agents).values({
    id,
    organizationId: input.organizationId,
    opportunityId: opportunity.id,
    name: SUPPORT_AGENT_NAME,
    description: "Proposes approved answers for repeated support questions and records them on a simulated inbox.",
    department: "Customer Support",
    modelId: input.modelId,
    status: "active",
    channel: "simulated_support_inbox",
    permissions: ["read_support_evidence", "propose_reply", "simulated_send"],
  });
  await db.insert(agentTools).values(
    SUPPORT_TOOLS.map((tool) => ({
      id: createId(),
      organizationId: input.organizationId,
      agentId: id,
      name: tool.name,
      description: tool.description,
      enabled: true,
    })),
  );
  await db.insert(workflows).values({
    id: createId(),
    organizationId: input.organizationId,
    name: `${SUPPORT_AGENT_NAME} workflow`,
    steps: [...WORKFLOW_STEPS],
  });
  return id;
}

export async function decideOpportunity(
  db: AppDatabase,
  input: { organizationId: string; opportunityId: string; userId: string; role: Role; decision: "approved" | "rejected"; note?: string },
) {
  if (!canWrite(input.role)) throw new WorkflowError("Your role can review opportunities but cannot approve them.");
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.organizationId, input.organizationId)))
    .limit(1);
  if (!opportunity) throw new WorkflowError("That opportunity is not in this organization.");
  if (!["NEW", "INVESTIGATING", "READY_FOR_APPROVAL"].includes(opportunity.status)) {
    throw new WorkflowError("This opportunity is already past the approval step.");
  }
  const approvalId = createId();
  await db.insert(approvals).values({
    id: approvalId,
    organizationId: input.organizationId,
    opportunityId: opportunity.id,
    requestedBy: input.userId,
    decidedBy: input.userId,
    status: input.decision,
    note: input.note ?? null,
    decidedAt: new Date(),
  });
  await db
    .update(opportunities)
    .set({ status: input.decision === "approved" ? "APPROVED" : "REJECTED", updatedAt: new Date() })
    .where(eq(opportunities.id, opportunity.id));
  return approvalId;
}

export async function setOpportunityStatus(
  db: AppDatabase,
  input: { organizationId: string; opportunityId: string; status: "INVESTIGATING" | "READY_FOR_APPROVAL" },
) {
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.organizationId, input.organizationId)))
    .limit(1);
  if (!opportunity) throw new WorkflowError("That opportunity is not in this organization.");
  if (!["NEW", "INVESTIGATING"].includes(opportunity.status)) {
    throw new WorkflowError("Only a new or investigating opportunity can move to that status.");
  }
  await db.update(opportunities).set({ status: input.status, updatedAt: new Date() }).where(eq(opportunities.id, opportunity.id));
}

export async function executeSupportWorkflow(
  db: AppDatabase,
  input: { organizationId: string; opportunityId: string; userId: string; role: Role },
) {
  if (!canWrite(input.role)) throw new WorkflowError("Your role cannot execute an agent.");
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.organizationId, input.organizationId)))
    .limit(1);
  if (!opportunity) throw new WorkflowError("That opportunity is not in this organization.");
  if (!opportunity.executable) {
    throw new WorkflowError("No execution tool is configured for this recommendation.");
  }
  if (opportunity.status !== "APPROVED" && opportunity.status !== "FAILED") {
    throw new WorkflowError("Approve the opportunity before an agent can run.");
  }
  const [approval] = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.opportunityId, opportunity.id), eq(approvals.organizationId, input.organizationId), eq(approvals.status, "approved")))
    .orderBy(desc(approvals.decidedAt))
    .limit(1);
  if (!approval) throw new WorkflowError("An approval record is required before execution.");

  const [agent] = await db
    .select()
    .from(agents)
    .where(and(eq(agents.organizationId, input.organizationId), eq(agents.opportunityId, opportunity.id), eq(agents.status, "active")))
    .limit(1);
  if (!agent) throw new WorkflowError("Create and activate the Customer Support Automation Agent before execution.");
  if (agent.channel !== "simulated_support_inbox") {
    throw new WorkflowError("This agent does not have a configured live channel. Only the simulated inbox is available.");
  }
  const tools = await db.select().from(agentTools).where(and(eq(agentTools.agentId, agent.id), eq(agentTools.enabled, true)));
  assertAgentTools(tools.map((tool) => tool.name));

  const links = await db
    .select({ signalId: opportunityEvidence.signalId })
    .from(opportunityEvidence)
    .where(eq(opportunityEvidence.opportunityId, opportunity.id));
  const signalIds = links.map((link) => link.signalId);
  const evidence = signalIds.length
    ? await db
        .select({ eventId: signalEvidence.eventId })
        .from(signalEvidence)
        .where(and(eq(signalEvidence.organizationId, input.organizationId), inArray(signalEvidence.signalId, signalIds)))
    : [];
  const eventIds = [...new Set(evidence.map((row) => row.eventId))];
  const events = eventIds.length
    ? await db
        .select()
        .from(businessEvents)
        .where(and(eq(businessEvents.organizationId, input.organizationId), inArray(businessEvents.id, eventIds)))
    : [];
  const memory: MemoryEventInput[] = events
    .filter((event) => event.provenance === "observed")
    .map((event) => ({
      id: event.id,
      type: event.type as MemoryEventInput["type"],
      occurredAt: event.occurredAt,
      title: event.title,
      body: event.body,
      attributes: event.attributes ?? {},
    }));

  const plan = planSupportExecution(memory);
  const verification = verifySupportSends(plan, plan.sends);
  const runId = createId();
  const failed = !verification.verified;
  await db
    .update(opportunities)
    .set({ status: "EXECUTING", updatedAt: new Date() })
    .where(eq(opportunities.id, opportunity.id));
  await db.insert(agentRuns).values({
    id: runId,
    organizationId: input.organizationId,
    agentId: agent.id,
    opportunityId: opportunity.id,
    approvalId: approval.id,
    status: failed ? "failed" : "completed",
    verificationStatus: failed ? "failed" : "verified",
    summary: failed ? verification.failures.join(" ") : `${plan.sends.length} simulated replies matched observed approved answers.`,
    finishedAt: new Date(),
  });
  const [workflow] = await db.select().from(workflows).where(eq(workflows.organizationId, input.organizationId)).limit(1);
  if (workflow) {
    await db.insert(workflowExecutions).values({
      id: createId(),
      organizationId: input.organizationId,
      workflowId: workflow.id,
      agentRunId: runId,
      status: failed ? "failed" : "completed",
    });
  }

  const logs: (typeof executionLogs.$inferInsert)[] = [
    log(input.organizationId, runId, "DETECT", "Loaded the approved opportunity and its linked signals.", { opportunityId: opportunity.id }, "observed"),
    log(input.organizationId, runId, "INVESTIGATE", `Read ${memory.length} observed support events from the evidence trail.`, { eventIds }, "observed"),
    log(
      input.organizationId,
      runId,
      "RECOMMEND",
      "Selected replies only where one approved answer was already stored on the observed conversations.",
      { clusters: plan.clusters.map((cluster) => ({ intent: cluster.intent, count: cluster.count, skipped: cluster.skipReason })) },
      "recommendation",
    ),
    log(input.organizationId, runId, "REQUEST_APPROVAL", "Used the human approval recorded before this run.", { approvalId: approval.id }, "observed"),
  ];
  for (const send of plan.sends) {
    logs.push(
      log(
        input.organizationId,
        runId,
        "EXECUTE",
        `Simulated inbox only: recorded a reply for ${send.intent}. No customer channel was contacted.`,
        { intent: send.intent, body: send.body, channel: send.channel, eventIds: send.eventIds },
        "simulated",
      ),
    );
  }
  logs.push(
    log(
      input.organizationId,
      runId,
      "VERIFY",
      failed ? verification.failures.join(" ") : "Each simulated reply matches an approved answer observed on the source conversations.",
      { failures: verification.failures },
      failed ? "hypothesis" : "verified",
    ),
  );
  const measuredMinutes = plan.sends.length * MINUTES_PER_REPEATED_REPLY;
  logs.push(
    log(
      input.organizationId,
      runId,
      "MEASURE",
      failed
        ? "No measured impact was recorded because verification failed."
        : `Recorded ${plan.sends.length} simulated replies. Time saved remains an estimate of ${measuredMinutes} minutes.`,
      { simulatedReplies: plan.sends.length, estimatedMinutes: failed ? 0 : measuredMinutes },
      "estimate",
    ),
  );
  await db.insert(executionLogs).values(logs);

  await db
    .update(opportunities)
    .set({
      status: failed ? "FAILED" : "COMPLETED",
      measuredMinutesSaved: failed ? null : measuredMinutes,
      updatedAt: new Date(),
    })
    .where(eq(opportunities.id, opportunity.id));

  if (!failed) await recordImpact(db, input.organizationId);
  return { runId, verified: !failed, sends: plan.sends.length, failures: verification.failures };
}

function log(
  organizationId: string,
  agentRunId: string,
  step: string,
  message: string,
  payload: Record<string, unknown>,
  provenance: string,
): typeof executionLogs.$inferInsert {
  return {
    id: createId(),
    organizationId,
    agentRunId,
    step,
    level: step === "VERIFY" && provenance !== "verified" ? "error" : "info",
    message,
    payload,
    provenance,
  };
}
