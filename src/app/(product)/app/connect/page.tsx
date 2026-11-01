import { UploadForm } from "@/components/app/client";
import { Badge, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { connectSnapshot } from "@/server/modules/read/service";

export default async function ConnectPage() {
  const context = await requireOrg();
  const data = await connectSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Business Connect" title="Bring records into this organization" text="Uploads are parsed into observed events. Third-party connectors stay unconfigured until a real integration exists." />
      {canWrite(context.role) ? <UploadForm /> : <p className="text-sm text-muted">Your role can view sources. Uploads require a manager, administrator, or owner.</p>}
      <section className="grid gap-3">
        {data.sources.map((source) => (
          <article key={source.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
            <div>
              <h2 className="font-semibold text-navy">{source.name}</h2>
              <p className="text-sm text-muted">{source.type} · {source.recordCount} records written · last sync {source.lastSyncAt ? source.lastSyncAt.toISOString() : "never"}</p>
              {source.lastError ? <p className="text-sm text-danger">{source.lastError}</p> : null}
            </div>
            <Badge tone={source.status === "ready" ? "blue" : "orange"}>{source.status.replaceAll("_", " ")}</Badge>
          </article>
        ))}
      </section>
      <p className="text-sm text-muted">HubSpot, Gmail, Slack, Notion, ClickUp, and QuickBooks do not accept credentials on this screen. Their status stays needs configuration.</p>
    </>
  );
}
