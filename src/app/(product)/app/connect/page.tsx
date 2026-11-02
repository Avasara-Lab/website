import { UploadForm } from "@/components/app/client";
import { Empty, Notice, PageIntro, StatusBadge } from "@/components/app/ui";
import { formatWhen, labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { connectSnapshot } from "@/server/modules/read/service";

export default async function ConnectPage() {
  const context = await requireOrg();
  const data = await connectSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Business Connect"
        title="Bring records into this organization"
        text="Uploads are parsed into observed events. Third-party connectors stay unconfigured until a real integration exists."
      />
      {canWrite(context.role) ? (
        <UploadForm />
      ) : (
        <Notice title="Uploads need a higher role">
          Your role can view sources. Uploading a file stays with owners, administrators, and managers.
        </Notice>
      )}
      <section className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy">Available sources</h2>
          <p className="mt-1 text-sm leading-6 text-muted">File upload is ready to use. Named business systems stay unconfigured until a real integration exists.</p>
        </div>
        {!data.sources.length ? <Empty title="No sources yet" text="File upload is added with the organization. Refresh if you just finished creating the workspace." /> : null}
        {data.sources.map((source) => (
          <article key={source.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
            <div>
              <h3 className="font-semibold text-navy">{source.name}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">
                {labelize(source.type)} · {source.recordCount} records written · last sync {source.lastSyncAt ? formatWhen(source.lastSyncAt, true) : "never"}
              </p>
              {source.lastError ? <p className="mt-1 text-sm text-danger">{source.lastError}</p> : null}
            </div>
            <StatusBadge value={source.status} />
          </article>
        ))}
      </section>
      <Notice title="Connectors that are not live">
        HubSpot, Gmail, Slack, Notion, ClickUp, and QuickBooks do not accept credentials on this screen. Their status stays needs configuration.
      </Notice>
    </>
  );
}
