import { Queue, Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { uploadedFiles } from "@/server/db/schema";
import { processStoredFile } from "@/server/modules/business-connect/service";
import { createObjectStore } from "@/server/storage";

const QUEUE_NAME = "avasara-ingestion";

function connection() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set.");
  return { url, maxRetriesPerRequest: null };
}

export function queueModeEnabled() {
  return process.env.INGESTION_MODE === "queue";
}

export async function enqueueIngestion(jobId: string) {
  if (!queueModeEnabled()) return;
  const queue = new Queue(QUEUE_NAME, { connection: connection() });
  await queue.add("process", { jobId }, { jobId, attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 100 });
  await queue.close();
}

export function startIngestionWorker() {
  return new Worker(
    QUEUE_NAME,
    async (job) => {
      const db = getDb();
      const { ingestionJobs } = await import("@/server/db/schema");
      const [row] = await db.select().from(ingestionJobs).where(eq(ingestionJobs.id, job.data.jobId)).limit(1);
      if (!row?.uploadedFileId) return;
      const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, row.uploadedFileId)).limit(1);
      if (!file) return;
      const bytes = await createObjectStore().get(file.storageKey);
      const extension = file.originalName.slice(file.originalName.lastIndexOf(".")).toLowerCase();
      await processStoredFile(db, {
        organizationId: row.organizationId,
        fileId: file.id,
        jobId: row.id,
        bytes,
        extension,
      });
    },
    { connection: connection() },
  );
}
