import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { agents } from "@/server/db/schema";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { createSupportAgent, WorkflowError } from "@/server/modules/agents/execute";
import { DEFAULT_MODELS, META_MODELS } from "@/server/modules/meta-ai/catalog";

const bodySchema = z.object({
  opportunityId: z.string().min(1),
  modelId: z.string().min(1).default(DEFAULT_MODELS.reasoningModel),
});

export async function POST(request: Request) {
  try {
    const context = await guard(request, "write");
    const body = bodySchema.parse(await request.json());
    if (!(META_MODELS.reasoning as readonly string[]).includes(body.modelId)) {
      return Response.json({ error: "Choose a documented Muse Spark model id." }, { status: 400 });
    }
    const agentId = await createSupportAgent(context.db, {
      organizationId: context.organizationId,
      opportunityId: body.opportunityId,
      modelId: body.modelId,
    });
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "agent.created",
      targetType: "agent",
      targetId: agentId,
    });
    return Response.json({ agentId }, { status: 201 });
  } catch (error) {
    if (error instanceof WorkflowError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof z.ZodError) return Response.json({ error: "Choose an opportunity." }, { status: 400 });
    return jsonError(error);
  }
}

const patchSchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(["active", "paused"]),
});

export async function PATCH(request: Request) {
  try {
    const context = await guard(request, "write");
    const body = patchSchema.parse(await request.json());
    const updated = await context.db
      .update(agents)
      .set({ status: body.status, updatedAt: new Date() })
      .where(and(eq(agents.id, body.agentId), eq(agents.organizationId, context.organizationId)))
      .returning({ id: agents.id });
    if (!updated.length) return Response.json({ error: "That agent is not in this organization." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Choose an agent status." }, { status: 400 });
    return jsonError(error);
  }
}
