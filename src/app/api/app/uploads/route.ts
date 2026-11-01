import { eq } from "drizzle-orm";
import { ingestionJobs } from "@/server/db/schema";
import { guard, jsonError } from "@/server/http";
import { acceptUpload } from "@/server/modules/business-connect/service";
import { enqueueIngestion, queueModeEnabled } from "@/server/queue";

export async function POST(request: Request) {
  try {
    const context = await guard(request, "write");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a file." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await acceptUpload(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      filename: file.name,
      bytes,
      deferProcessing: queueModeEnabled(),
    });
    if (result.queued) await enqueueIngestion(result.jobId);
    const [stored] = await context.db.select().from(ingestionJobs).where(eq(ingestionJobs.id, result.jobId)).limit(1);
    return Response.json({ ...result, status: stored?.status ?? "pending", error: stored?.error ?? null });
  } catch (error) {
    return jsonError(error);
  }
}
