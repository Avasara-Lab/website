import { z } from "zod";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { executeSupportWorkflow, WorkflowError } from "@/server/modules/agents/execute";

const bodySchema = z.object({ opportunityId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const context = await guard(request, "write");
    const body = bodySchema.parse(await request.json());
    const result = await executeSupportWorkflow(context.db, {
      organizationId: context.organizationId,
      opportunityId: body.opportunityId,
      userId: context.userId,
      role: context.role,
    });
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "agent.executed",
      targetType: "agent_run",
      targetId: result.runId,
      metadata: { verified: result.verified, sends: result.sends },
    });
    return Response.json(result);
  } catch (error) {
    if (error instanceof WorkflowError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof z.ZodError) return Response.json({ error: "Choose an opportunity to execute." }, { status: 400 });
    return jsonError(error);
  }
}
