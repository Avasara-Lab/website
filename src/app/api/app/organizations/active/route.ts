import { z } from "zod";
import { getAuth } from "@/server/auth/auth";
import { listMemberships } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { orgCookie, jsonError } from "@/server/http";

const bodySchema = z.object({ organizationId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
    const body = bodySchema.parse(await request.json());
    const memberships = await listMemberships(getDb(), session.user.id);
    if (!memberships.some((item) => item.organizationId === body.organizationId)) {
      return Response.json({ error: "You are not a member of that organization." }, { status: 403 });
    }
    return Response.json({ organizationId: body.organizationId }, { headers: { "set-cookie": orgCookie(body.organizationId) } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Choose an organization." }, { status: 400 });
    return jsonError(error);
  }
}
