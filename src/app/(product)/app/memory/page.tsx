import { PageIntro, Section, Stat, StatusBadge } from "@/components/app/ui";
import { formatWhen, labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { memorySnapshot } from "@/server/modules/read/service";

export default async function MemoryPage() {
  const context = await requireOrg();
  const data = await memorySnapshot(context.db, context.organizationId);
  const shown = data.entities.slice(0, 40);
  return (
    <>
      <PageIntro
        eyebrow="Business Memory"
        title="Observed records and the links between them"
        text="Observed events come from uploads or the synthetic seed. Model transcripts are stored as interpretations and are excluded from signal counts."
      />
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Memory counts">
        <Stat label="Observed" value={Number(data.counts?.observed ?? 0)} provenance="observed" detail="Events eligible for signal detection." />
        <Stat label="Interpretations" value={Number(data.counts?.interpretation ?? 0)} provenance="interpretation" detail="Excluded from signal counts." />
        <Stat label="Entities" value={data.entities.length} provenance="observed" detail="People, customers, departments, and projects." />
      </section>
      <Section title="Counts by observed type" text="Only observed events are included.">
        {data.byType.length ? (
          <ul className="flex flex-wrap gap-2">
            {data.byType.map((row) => (
              <li key={row.type}>
                <StatusBadge value={row.type} />
                <span className="ml-2 text-sm font-semibold text-navy tabular-nums">{Number(row.value)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No observed events yet.</p>
        )}
      </Section>
      <Section title="Entities" text={shown.length < data.entities.length ? `Showing ${shown.length} of ${data.entities.length}.` : undefined}>
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((entity) => (
            <article key={entity.id} className="panel rounded-xl p-4">
              <StatusBadge value={entity.provenance} />
              <h3 className="mt-2 font-semibold text-navy">{entity.name}</h3>
              <p className="text-xs text-muted">{labelize(entity.kind)}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Recent events" text="Newest first. The body is shortened on this list.">
        <div className="grid gap-3">
          {data.events.map((event) => (
            <article key={event.id} className="rounded-xl border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={event.provenance} />
                <StatusBadge value={event.type} />
              </div>
              <h3 className="mt-2 font-semibold text-navy">{event.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{event.body.slice(0, 280)}</p>
              <p className="mt-2 text-xs text-muted">{formatWhen(event.occurredAt, true)}</p>
            </article>
          ))}
          {!data.events.length ? <p className="text-sm text-muted">No events stored yet.</p> : null}
        </div>
      </Section>
      <p className="text-sm leading-6 text-muted">
        {data.relationships.length} relationships stored, such as a person working in a department or a customer linked to a project.
      </p>
    </>
  );
}
