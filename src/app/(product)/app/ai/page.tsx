import { AiConfigForm } from "@/components/app/client";
import { Badge, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { OPEN_WEIGHT_NOTES, SAM_NOTE } from "@/server/modules/meta-ai/catalog";
import { aiSnapshot } from "@/server/modules/read/service";

export default async function AiPage() {
  const context = await requireOrg();
  const data = await aiSnapshot(context.db, context.organizationId);
  const config = data.config;
  return (
    <>
      <PageIntro eyebrow="Meta Model API" title="Model configuration" text="Calls go to https://api.meta.ai/v1 with the server-side MODEL_API_KEY. The browser never receives the key." />
      {canAdminister(context.role) && config ? (
        <AiConfigForm
          reasoningModel={config.reasoningModel}
          investigationModel={config.investigationModel}
          transcribeModel={config.transcribeModel}
          imageModel={config.imageModel}
          keyConfigured={data.keyConfigured}
        />
      ) : <p className="text-sm text-muted">Only an owner or administrator can change model selection. Key configured: {data.keyConfigured ? "yes" : "no"}.</p>}
      <section className="grid gap-2 text-sm text-muted">
        {OPEN_WEIGHT_NOTES.map((item) => <p key={item.name}><span className="font-semibold text-navy">{item.name}.</span> {item.note}</p>)}
        <p>{SAM_NOTE}</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-navy">Usage log</h2>
        <ul className="mt-3 grid gap-2">
          {data.usage.map((row) => (
            <li key={row.id} className="text-sm text-muted"><Badge>{row.status}</Badge> {row.endpoint} · {row.model} · {row.latencyMs ?? 0} ms {row.error ? `· ${row.error}` : ""}</li>
          ))}
          {!data.usage.length ? <li className="text-sm text-muted">No Meta calls have been logged for this organization.</li> : null}
        </ul>
      </section>
    </>
  );
}
