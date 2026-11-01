import type { AppDatabase } from "@/server/db/client";
import { auditLogs } from "@/server/db/schema";
import { createId } from "@/server/ids";

export async function writeAudit(
  db: AppDatabase,
  input: {
    organizationId?: string | null;
    userId?: string | null;
    action: string;
    targetType: string;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  await db.insert(auditLogs).values({
    id: createId(),
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });
}
