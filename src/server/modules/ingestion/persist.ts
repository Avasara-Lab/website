import { and, eq, sql } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import {
  businessEntities,
  businessEvents,
  businessRelationships,
  dataSources,
  departments,
  ingestionJobs,
  uploadedFiles,
} from "@/server/db/schema";
import { type NormalizedRecord, stringAttr } from "@/server/domain";
import { createId, sha256 } from "@/server/ids";
import { refreshIntelligence } from "@/server/modules/intelligence/service";

export async function ingestRecords(
  db: AppDatabase,
  input: {
    organizationId: string;
    dataSourceId: string;
    uploadedFileId?: string | null;
    records: NormalizedRecord[];
    asOf?: Date;
    provenance?: "observed" | "interpretation";
  },
) {
  let written = 0;
  for (const record of input.records) {
    const dedupeKey = sha256(
      [input.organizationId, record.type, record.externalId ?? "", record.occurredAt, record.title, record.body].join("|"),
    );
    const entityId = await ensureEntities(db, input.organizationId, record);
    const inserted = await db
      .insert(businessEvents)
      .values({
        id: createId(),
        organizationId: input.organizationId,
        dataSourceId: input.dataSourceId,
        uploadedFileId: input.uploadedFileId ?? null,
        entityId,
        type: record.type,
        occurredAt: new Date(record.occurredAt),
        title: record.title,
        body: record.body,
        attributes: record.attributes,
        provenance: input.provenance ?? "observed",
        dedupeKey,
      })
      .onConflictDoNothing({ target: [businessEvents.organizationId, businessEvents.dedupeKey] })
      .returning({ id: businessEvents.id });
    if (inserted.length) written += 1;
  }
  await db
    .update(dataSources)
    .set({
      recordCount: sql`${dataSources.recordCount} + ${written}`,
      lastSyncAt: new Date(),
      lastError: null,
      status: "ready",
      updatedAt: new Date(),
    })
    .where(and(eq(dataSources.id, input.dataSourceId), eq(dataSources.organizationId, input.organizationId)));
  const intelligence = await refreshIntelligence(db, input.organizationId, input.asOf ?? new Date());
  return { read: input.records.length, written, ...intelligence };
}

async function ensureEntities(db: AppDatabase, organizationId: string, record: NormalizedRecord) {
  const customer = stringAttr(record.attributes, "customer");
  const employee = stringAttr(record.attributes, "employee") ?? stringAttr(record.attributes, "owner");
  const project = stringAttr(record.attributes, "project");
  const department = stringAttr(record.attributes, "department");
  const customerId = customer ? await upsertEntity(db, organizationId, "customer", customer) : null;
  const employeeId = employee ? await upsertEntity(db, organizationId, "employee", employee) : null;
  const projectId = project ? await upsertEntity(db, organizationId, "project", project) : null;
  if (department) {
    await upsertEntity(db, organizationId, "department", department);
    await db
      .insert(departments)
      .values({ id: createId(), organizationId, name: department })
      .onConflictDoNothing({ target: [departments.organizationId, departments.name] });
  }
  if (customerId && projectId) {
    await db
      .insert(businessRelationships)
      .values({ id: createId(), organizationId, fromEntityId: customerId, toEntityId: projectId, kind: "customer_of_project" })
      .onConflictDoNothing();
  }
  if (employeeId && department) {
    const departmentId = await upsertEntity(db, organizationId, "department", department);
    await db
      .insert(businessRelationships)
      .values({ id: createId(), organizationId, fromEntityId: employeeId, toEntityId: departmentId, kind: "works_in" })
      .onConflictDoNothing();
  }
  return customerId ?? projectId ?? employeeId;
}

async function upsertEntity(db: AppDatabase, organizationId: string, kind: string, name: string) {
  const externalKey = name.toLowerCase();
  const [existing] = await db
    .select({ id: businessEntities.id })
    .from(businessEntities)
    .where(
      and(
        eq(businessEntities.organizationId, organizationId),
        eq(businessEntities.kind, kind),
        eq(businessEntities.externalKey, externalKey),
      ),
    )
    .limit(1);
  if (existing) return existing.id;
  const id = createId();
  await db
    .insert(businessEntities)
    .values({
      id,
      organizationId,
      kind,
      name,
      externalKey,
      attributes: {},
      provenance: "observed",
    })
    .onConflictDoNothing();
  const [row] = await db
    .select({ id: businessEntities.id })
    .from(businessEntities)
    .where(
      and(
        eq(businessEntities.organizationId, organizationId),
        eq(businessEntities.kind, kind),
        eq(businessEntities.externalKey, externalKey),
      ),
    )
    .limit(1);
  return row?.id ?? id;
}

export async function markJob(
  db: AppDatabase,
  jobId: string,
  patch: Partial<typeof ingestionJobs.$inferInsert>,
) {
  await db.update(ingestionJobs).set(patch).where(eq(ingestionJobs.id, jobId));
}

export async function markFile(db: AppDatabase, fileId: string, patch: Partial<typeof uploadedFiles.$inferInsert>) {
  await db.update(uploadedFiles).set(patch).where(eq(uploadedFiles.id, fileId));
}
