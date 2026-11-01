import { AiConfigForm } from "@/components/app/client";
import { Notice, PageIntro, Section, StatusBadge } from "@/components/app/ui";
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
      <PageIntro
        eyebrow="Meta Model API"
        title="Model configuration"
        text="Calls go to the Meta Model API with the server-side MODEL_API_KEY. The browser never receives the key. If the key is missing, live calls stay blocked."
      />
      {canAdminister(context.role) && config ? (
        <AiConfigForm
          reasoningModel={config.reasoningModel}
          investigationModel={config.investigationModel}
          transcribeModel={config.transcribeModel}
          imageModel={config.imageModel}
          keyConfigured={data.keyConfigured}
        />
      ) : (
        <Notice tone={data.keyConfigured ? "info" : "warning"} title={data.keyConfigured ? "Server key is set" : "Live Meta calls are paused"}>
          {data.keyConfigured
            ? "MODEL_API_KEY is set on the server. Only an owner or administrator can change model selection. The key is not shown here."
            : "Set MODEL_API_KEY on the server when you want live calls. No other model provider is used. Only an owner or administrator can change model selection."}
        </Notice>
      )}
      <Section title="Model notes" text="These notes describe the models this workspace can select. They are not usage statistics.">
        <div className="grid gap-2">
          {OPEN_WEIGHT_NOTES.map((item) => (
            <p key={item.name} className="text-sm leading-6 text-muted">
              <span className="font-semibold text-navy">{item.name}.</span> {item.note}
            </p>
          ))}
          <p className="text-sm leading-6 text-muted">{SAM_NOTE}</p>
        </div>
      </Section>
      <Section title="Usage log" text="Calls recorded for this organization. An empty log means no Meta request has been stored yet.">
        {data.usage.length ? (
          <ul className="grid gap-2">
            {data.usage.map((row) => (
              <li key={row.id} className="panel flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted">
                <StatusBadge value={row.status} />
                <span className="font-medium text-navy">{row.endpoint}</span>
                <span>{row.model}</span>
                <span className="tabular-nums">{row.latencyMs ?? 0} ms</span>
                {row.error ? <span className="text-danger">{row.error}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No Meta calls have been logged for this organization.</p>
        )}
      </Section>
    </>
  );
}
