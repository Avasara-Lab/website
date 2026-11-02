import { AiConfigForm } from "@/components/app/client";
import { Empty, Notice, PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { META_CAPABILITIES, OPEN_WEIGHT_NOTES, SAM_NOTE } from "@/server/modules/meta-ai/catalog";
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
        text="Most teams leave these defaults. Calls go to https://api.meta.ai/v1 with the server-side MODEL_API_KEY. An empty key blocks the call. The browser never receives the key, and no other provider is called."
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
            : "Live Meta calls are blocked. MODEL_API_KEY is empty. No other model provider is used. Only an owner or administrator can change model selection."}
        </Notice>
      )}
      <Section title="What each call can do" text="These are the Meta endpoints this workspace is allowed to use. They are not usage statistics.">
        <ul className="grid gap-3">
          {META_CAPABILITIES.map((item) => (
            <li key={item.key} className="panel rounded-xl p-4 text-sm">
              <p className="font-semibold text-navy">{item.label}</p>
              <p className="text-muted">{item.endpoint}</p>
              <p className="mt-1 text-navy">{item.purpose}</p>
              <p className="mt-1 leading-6 text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Model notes" text="Open-weight models are described here. This app does not call another provider for them.">
        <div className="grid gap-2">
          {OPEN_WEIGHT_NOTES.map((item) => (
            <p key={item.name} className="text-sm leading-6 text-muted">
              <span className="font-semibold text-navy">{item.name}.</span> {item.note}
            </p>
          ))}
          <p className="text-sm leading-6 text-muted">{SAM_NOTE}</p>
        </div>
      </Section>
      <Section title="Usage log" text="Calls recorded for this organization. A missing MODEL_API_KEY is logged as blocked.">
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
          <Empty title="No Meta calls yet" text="A catalog check or an interpretation writes a row here. A missing MODEL_API_KEY is logged as blocked." />
        )}
      </Section>
    </>
  );
}
