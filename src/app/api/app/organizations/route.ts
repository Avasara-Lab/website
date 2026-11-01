import { z } from "zod";
import { orgCookie, guard, jsonError } from "@/server/http";
import { writeAudit } from "@/server/modules/audit/service";
import { createOrganization } from "@/server/modules/organizations/service";
import { getAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db/client";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  industry: z.string().trim().max(120).optional(),
  employeeCount: z.number().int().positive().max(100000).optional(),
  objectives: z.string().trim().max(2000).optional(),
  departments: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
    const body = bodySchema.parse(await request.json());
    const db = getDb();
    const organizationId = await createOrganization(db, {
      userId: session.user.id,
      name: body.name,
      industry: body.industry,
      employeeCount: body.employeeCount,
      objectives: body.objectives,
      departmentNames: body.departments,
    });
    await writeAudit(db, {
      organizationId,
      userId: session.user.id,
      action: "organization.created",
      targetType: "organization",
      targetId: organizationId,
    });
    return Response.json(
      { organizationId },
      { status: 201, headers: { "set-cookie": orgCookie(organizationId) } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Check the organization fields." }, { status: 400 });
    return jsonError(error);
  }
}

export async function GET(request: Request) {
  try {
    const context = await guard(request, "read");
    return Response.json({ organizationId: context.organizationId, role: context.role });
  } catch (error) {
    return jsonError(error);
  }
}
