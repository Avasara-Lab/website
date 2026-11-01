import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { notifications } from "@/server/db/schema";
import { guard, jsonError } from "@/server/http";

const bodySchema = z.object({ id: z.string().min(1).optional(), all: z.boolean().optional() });

export async function POST(request: Request) {
  try {
    const context = await guard(request, "read");
    const body = bodySchema.parse(await request.json());
    const now = new Date();
    if (body.all) {
      await context.db
        .update(notifications)
        .set({ readAt: now })
        .where(and(eq(notifications.organizationId, context.organizationId), isNull(notifications.readAt)));
    } else if (body.id) {
      await context.db
        .update(notifications)
        .set({ readAt: now })
        .where(and(eq(notifications.id, body.id), eq(notifications.organizationId, context.organizationId)));
    }
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Choose a notification." }, { status: 400 });
    return jsonError(error);
  }
}
