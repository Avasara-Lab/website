import { z } from "zod";
import { guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { updateProfile } from "@/server/modules/organizations/service";

const bodySchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  industry: z.string().trim().max(120),
  employeeCount: z.number().int().positive().max(100000).nullable(),
  objectives: z.string().trim().max(2000),
});

export async function PATCH(request: Request) {
  try {
    const context = await guard(request, "admin");
    const body = bodySchema.parse(await request.json());
    await updateProfile(context.db, context.organizationId, body);
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "profile.updated",
      targetType: "business_profile",
      targetId: context.organizationId,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Check the company profile fields." }, { status: 400 });
    return jsonError(error);
  }
}
