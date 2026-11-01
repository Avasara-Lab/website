import { z } from "zod";
import { getAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db/client";
import { orgCookie, jsonError } from "@/server/http";
import { acceptInvitation } from "@/server/modules/organizations/service";

const bodySchema = z.object({ token: z.string().min(10) });

export async function POST(request: Request) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return Response.json({ error: "Sign in required." }, { status: 401 });
    const body = bodySchema.parse(await request.json());
    const organizationId = await acceptInvitation(getDb(), {
      token: body.token,
      userId: session.user.id,
      email: session.user.email,
    });
    return Response.json({ organizationId }, { headers: { "set-cookie": orgCookie(organizationId) } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "The invitation token is missing." }, { status: 400 });
    if (error instanceof Error) return Response.json({ error: error.message }, { status: 400 });
    return jsonError(error);
  }
}
