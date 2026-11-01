import { Badge, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { memorySnapshot } from "@/server/modules/read/service";

export default async function MemoryPage() {
  const context = await requireOrg();
  const data = await memorySnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Business Memory" title="Observed records and the links between them" text="Observed events come from uploads or the synthetic seed. Model transcripts are stored as interpretations and are excluded from signal counts." />
      <section className="grid gap-3 sm:grid-cols-3">
        <article className="panel rounded-xl p-4"><p className="text-xs font-semibold tracking-wide text-muted uppercase">Observed</p><p className="mt-2 text-3xl font-semibold">{Number(data.counts?.observed ?? 0)}</p></article>
        <article className="panel rounded-xl p-4"><p className="text-xs font-semibold tracking-wide text-muted uppercase">Interpretations</p><p className="mt-2 text-3xl font-semibold">{Number(data.counts?.interpretation ?? 0)}</p></article>
        <article className="panel rounded-xl p-4"><p className="text-xs font-semibold tracking-wide text-muted uppercase">Entities</p><p className="mt-2 text-3xl font-semibold">{data.entities.length}</p></article>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-navy">Counts by observed type</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {data.byType.map((row) => <li key={row.type}><Badge tone="blue">{row.type}: {Number(row.value)}</Badge></li>)}
        </ul>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {data.entities.slice(0, 40).map((entity) => (
          <article key={entity.id} className="panel rounded-xl p-4">
            <Badge>{entity.provenance}</Badge>
            <h3 className="mt-2 font-semibold text-navy">{entity.name}</h3>
            <p className="text-xs text-muted">{entity.kind}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-navy">Recent events</h2>
        {data.events.map((event) => (
          <article key={event.id} className="border-b border-line py-3">
            <div className="flex flex-wrap gap-2"><Badge tone={event.provenance === "observed" ? "blue" : "orange"}>{event.provenance}</Badge><Badge>{event.type}</Badge></div>
            <h3 className="mt-2 font-semibold text-navy">{event.title}</h3>
            <p className="text-sm leading-6 text-muted">{event.body.slice(0, 280)}</p>
            <p className="text-xs text-muted">{event.occurredAt.toISOString()}</p>
          </article>
        ))}
      </section>
      <p className="text-sm text-muted">{data.relationships.length} relationships stored, such as a person working in a department or a customer linked to a project.</p>
    </>
  );
}
