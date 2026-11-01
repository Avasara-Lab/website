import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/server/db/client";
import { aiConfigurations, aiUsageLogs } from "@/server/db/schema";
import { createId } from "@/server/ids";
import { assertAllowedModel, DEFAULT_MODELS } from "@/server/modules/meta-ai/catalog";
import { createMetaProvider, wrapUntrustedDocument } from "@/server/modules/meta-ai/provider";

export async function updateAiConfig(
  db: AppDatabase,
  organizationId: string,
  input: { reasoningModel: string; investigationModel: string; transcribeModel: string; imageModel: string },
) {
  assertAllowedModel("reasoning", input.reasoningModel);
  assertAllowedModel("investigation", input.investigationModel);
  assertAllowedModel("transcribe", input.transcribeModel);
  assertAllowedModel("image", input.imageModel);
  await db
    .update(aiConfigurations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(aiConfigurations.organizationId, organizationId));
}

export async function testMetaConnection(db: AppDatabase, organizationId: string) {
  const provider = createMetaProvider();
  const result = await provider.listModels();
  await db.insert(aiUsageLogs).values({
    id: createId(),
    organizationId,
    model: "catalog",
    endpoint: "/models",
    status: result.ok ? "ok" : result.blocked ? "blocked" : "error",
    latencyMs: result.latencyMs,
    error: result.ok ? null : result.error,
    inputTokens: result.ok ? result.inputTokens : null,
    outputTokens: result.ok ? result.outputTokens : null,
  });
  return result;
}

export async function interpretOpportunity(db: AppDatabase, organizationId: string, opportunityId: string, evidenceText: string) {
  const [config] = await db.select().from(aiConfigurations).where(eq(aiConfigurations.organizationId, organizationId)).limit(1);
  const model = config?.reasoningModel ?? DEFAULT_MODELS.reasoningModel;
  const provider = createMetaProvider();
  const result = await provider.completeChat({
    model,
    messages: [
      {
        role: "user",
        content: `Write one short paragraph about the operational pattern in the document. Do not invent numbers, customers, or evidence ids.\n${wrapUntrustedDocument(evidenceText)}`,
      },
    ],
  });
  await db.insert(aiUsageLogs).values({
    id: createId(),
    organizationId,
    model,
    endpoint: "/chat/completions",
    status: result.ok ? "ok" : result.blocked ? "blocked" : "error",
    latencyMs: result.latencyMs,
    error: result.ok ? null : result.error,
    inputTokens: result.ok ? result.inputTokens : null,
    outputTokens: result.ok ? result.outputTokens : null,
  });
  if (!result.ok) return result;
  const { interpretations } = await import("@/server/db/schema");
  await db.insert(interpretations).values({
    id: createId(),
    organizationId,
    targetType: "opportunity",
    targetId: opportunityId,
    body: result.data.content.slice(0, 2000),
    model,
    provenance: "interpretation",
  });
  return result;
}
