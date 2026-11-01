import path from "node:path";
import { and, eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import { aiConfigurations, aiUsageLogs, dataSources, ingestionJobs, uploadedFiles } from "@/server/db/schema";
import { type EventType } from "@/server/domain";
import { createId, sha256 } from "@/server/ids";
import { writeAudit } from "@/server/modules/audit/service";
import { ingestRecords, markFile, markJob } from "@/server/modules/ingestion/persist";
import { ParseError, extractPdfText, parseCsv, parseJsonRecords, parseTextRecords, parseXlsx } from "@/server/modules/ingestion/parse";
import { DEFAULT_MODELS } from "@/server/modules/meta-ai/catalog";
import { createMetaProvider, wrapUntrustedDocument } from "@/server/modules/meta-ai/provider";
import { createObjectStore, inspectUpload } from "@/server/storage";

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function acceptUpload(
  db: AppDatabase,
  input: { organizationId: string; userId: string; filename: string; bytes: Buffer; asOf?: Date; deferProcessing?: boolean },
) {
  const inspected = inspectUpload(input.filename, input.bytes.length);
  const digest = sha256(input.bytes);
  const [duplicate] = await db
    .select({ id: uploadedFiles.id })
    .from(uploadedFiles)
    .where(and(eq(uploadedFiles.organizationId, input.organizationId), eq(uploadedFiles.sha256, digest)))
    .limit(1);
  if (duplicate) {
    throw new UploadError("This file was already ingested for the organization. The duplicate was not processed again.", 409);
  }
  const [source] = await db
    .select()
    .from(dataSources)
    .where(and(eq(dataSources.organizationId, input.organizationId), eq(dataSources.type, "upload")))
    .limit(1);
  if (!source) throw new UploadError("This organization has no upload source.", 500);

  const fileId = createId();
  const storageKey = path.posix.join(input.organizationId, fileId);
  await createObjectStore().put(storageKey, input.bytes, inspected.mediaType);
  await db.insert(uploadedFiles).values({
    id: fileId,
    organizationId: input.organizationId,
    dataSourceId: source.id,
    originalName: inspected.safeName,
    mediaType: inspected.mediaType,
    byteSize: input.bytes.length,
    sha256: digest,
    storageKey,
    status: "stored",
  });
  const jobId = createId();
  await db.insert(ingestionJobs).values({
    id: jobId,
    organizationId: input.organizationId,
    uploadedFileId: fileId,
    status: "pending",
    idempotencyKey: digest,
  });
  await writeAudit(db, {
    organizationId: input.organizationId,
    userId: input.userId,
    action: "file.uploaded",
    targetType: "uploaded_file",
    targetId: fileId,
    metadata: { name: inspected.safeName, bytes: input.bytes.length },
  });
  if (input.deferProcessing) return { fileId, jobId, queued: true };
  await processStoredFile(db, { organizationId: input.organizationId, fileId, jobId, bytes: input.bytes, extension: inspected.extension, asOf: input.asOf });
  return { fileId, jobId, queued: false };
}

export async function processStoredFile(
  db: AppDatabase,
  input: { organizationId: string; fileId: string; jobId: string; bytes: Buffer; extension: string; asOf?: Date },
) {
  await markJob(db, input.jobId, { status: "running", attempts: 1, startedAt: new Date() });
  try {
    const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, input.fileId)).limit(1);
    if (!file || file.organizationId !== input.organizationId) throw new UploadError("The uploaded file is not in this organization.");
    const text = input.bytes.toString("utf8");
    if (input.extension === ".wav") {
      await transcribeUpload(db, input.organizationId, file.dataSourceId, input.fileId, input.bytes, file.originalName);
      await markFile(db, input.fileId, { status: "processed", recordCount: 1 });
      await markJob(db, input.jobId, { status: "completed", recordsRead: 1, recordsWritten: 1, finishedAt: new Date() });
      return;
    }
    const records =
      input.extension === ".csv"
        ? parseCsv(text)
        : input.extension === ".json"
          ? parseJsonRecords(text)
          : input.extension === ".xlsx"
            ? await parseXlsx(input.bytes)
            : input.extension === ".pdf"
              ? await pdfRecords(input.bytes, file.originalName)
              : parseTextRecords(text, "document");
    const result = await ingestRecords(db, {
      organizationId: input.organizationId,
      dataSourceId: file.dataSourceId,
      uploadedFileId: input.fileId,
      records,
      asOf: input.asOf,
    });
    await markFile(db, input.fileId, { status: "processed", recordCount: result.written, error: null });
    await markJob(db, input.jobId, {
      status: "completed",
      recordsRead: result.read,
      recordsWritten: result.written,
      finishedAt: new Date(),
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed.";
    await markFile(db, input.fileId, { status: "failed", error: message });
    await markJob(db, input.jobId, { status: "failed", error: message, finishedAt: new Date() });
    if (error instanceof ParseError || error instanceof UploadError) return;
    throw error;
  }
}

async function pdfRecords(bytes: Buffer, name: string) {
  try {
    const text = await extractPdfText(bytes);
    if (!text) throw new ParseError("No text could be extracted from the PDF.");
    return parseTextRecords(text, "document").map((record) => ({ ...record, title: record.title || name }));
  } catch (error) {
    if (error instanceof ParseError) throw error;
    throw new ParseError(error instanceof Error ? error.message : "The PDF could not be read.");
  }
}

async function transcribeUpload(db: AppDatabase, organizationId: string, dataSourceId: string, fileId: string, bytes: Buffer, filename: string) {
  const [config] = await db.select().from(aiConfigurations).where(eq(aiConfigurations.organizationId, organizationId)).limit(1);
  const model = config?.transcribeModel ?? DEFAULT_MODELS.transcribeModel;
  const provider = createMetaProvider();
  const result = await provider.transcribeWav({
    model,
    wav: new Blob([new Uint8Array(bytes)], { type: "audio/wav" }),
    filename,
  });
  await db.insert(aiUsageLogs).values({
    id: createId(),
    organizationId,
    model,
    endpoint: "/asr/transcribe",
    status: result.ok ? "ok" : result.blocked ? "blocked" : "error",
    latencyMs: result.latencyMs,
    error: result.ok ? null : result.error,
    inputTokens: result.ok ? result.inputTokens : null,
    outputTokens: result.ok ? result.outputTokens : null,
  });
  if (!result.ok) {
    throw new UploadError(
      result.blocked
        ? "The WAV file is stored. Transcription needs MODEL_API_KEY on the server. No other speech provider was called."
        : result.error,
    );
  }
  await ingestRecords(db, {
    organizationId,
    dataSourceId,
    uploadedFileId: fileId,
    provenance: "interpretation",
    records: [
      {
        type: "meeting_transcript" satisfies EventType,
        occurredAt: new Date().toISOString(),
        title: filename,
        body: wrapUntrustedDocument(result.data.transcript),
        externalId: fileId,
        attributes: { transcriptModel: model },
      },
    ],
  });
}

export async function describeConnector(type: string) {
  if (type === "upload") return { status: "ready", detail: "CSV, Excel, JSON, text, PDF, and WAV uploads are accepted." };
  return {
    status: "needs_configuration",
    detail: `${type} is not connected. This release does not store third-party credentials or pretend a sync ran.`,
  };
}
