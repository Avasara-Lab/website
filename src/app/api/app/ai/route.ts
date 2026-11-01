import { z } from "zod";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { testMetaConnection, updateAiConfig, interpretOpportunity } from "@/server/modules/meta-ai/service";

const configSchema = z.object({
  reasoningModel: z.string(),
  investigationModel: z.string(),
  transcribeModel: z.string(),
  imageModel: z.string(),
});

export async function PATCH(request: Request) {
  try {
    const context = await guard(request, "admin");
    const body = configSchema.parse(await request.json());
    await updateAiConfig(context.db, context.organizationId, body);
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "ai.configured",
      targetType: "ai_configuration",
      targetId: context.organizationId,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("documented")) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof z.ZodError) return Response.json({ error: "Choose model ids from the documented list." }, { status: 400 });
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await guard(request, "admin");
    const body = (await request.json().catch(() => ({}))) as { action?: string; opportunityId?: string; evidence?: string };
    if (body.action === "interpret") {
      if (!body.opportunityId || !body.evidence) return Response.json({ error: "An opportunity and evidence text are required." }, { status: 400 });
      const result = await interpretOpportunity(context.db, context.organizationId, body.opportunityId, body.evidence.slice(0, 8000));
      if (!result.ok) return Response.json({ ok: false, blocked: result.blocked, error: result.error }, { status: result.blocked ? 200 : 502 });
      return Response.json({ ok: true, blocked: false, provenance: "interpretation" });
    }
    const result = await testMetaConnection(context.db, context.organizationId);
    if (!result.ok) return Response.json({ ok: false, blocked: result.blocked, error: result.error }, { status: result.blocked ? 200 : 502 });
    return Response.json({ ok: true, blocked: false, models: result.data.ids });
  } catch (error) {
    return jsonError(error);
  }
}
