import { z } from "zod";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { decideOpportunity, setOpportunityStatus } from "@/server/modules/agents/execute";
import { WorkflowError } from "@/server/modules/agents/execute";

const bodySchema = z.object({
  action: z.enum(["investigate", "ready", "approve", "reject"]),
  note: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = bodySchema.parse(await request.json());
    const authContext = await guard(request, body.action === "approve" || body.action === "reject" ? "write" : "write");
    if (body.action === "investigate" || body.action === "ready") {
      await setOpportunityStatus(authContext.db, {
        organizationId: authContext.organizationId,
        opportunityId: id,
        status: body.action === "investigate" ? "INVESTIGATING" : "READY_FOR_APPROVAL",
      });
    } else {
      await decideOpportunity(authContext.db, {
        organizationId: authContext.organizationId,
        opportunityId: id,
        userId: authContext.userId,
        role: authContext.role,
        decision: body.action === "approve" ? "approved" : "rejected",
        note: body.note,
      });
    }
    await writeAudit(authContext.db, {
      organizationId: authContext.organizationId,
      userId: authContext.userId,
      action: `opportunity.${body.action}`,
      targetType: "opportunity",
      targetId: id,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof WorkflowError) return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof z.ZodError) return Response.json({ error: "Choose an opportunity action." }, { status: 400 });
    return jsonError(error);
  }
}
