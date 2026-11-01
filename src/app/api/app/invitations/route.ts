import { z } from "zod";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { createInvitation } from "@/server/modules/organizations/service";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  role: z.enum(["administrator", "manager", "member"]),
});

export async function POST(request: Request) {
  try {
    const context = await guard(request, "admin");
    const body = bodySchema.parse(await request.json());
    const invite = await createInvitation(context.db, {
      organizationId: context.organizationId,
      email: body.email,
      role: body.role,
      createdBy: context.userId,
    });
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "invitation.created",
      targetType: "invitation",
      targetId: invite.id,
      metadata: { email: body.email.toLowerCase(), role: body.role },
    });
    return Response.json({
      invitationId: invite.id,
      acceptPath: `/invite/${invite.token}`,
      emailDelivery: "not_configured",
      note: "Email delivery is not configured. Share this one-time path with the invited person. It is shown only in this response.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Enter a valid email and role." }, { status: 400 });
    return jsonError(error);
  }
}
