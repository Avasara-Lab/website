import Link from "next/link";
import { Empty, PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { searchWorkspace } from "@/server/modules/read/service";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const context = await requireOrg();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = await searchWorkspace(context.db, context.organizationId, query);
  const total = results.signals.length + results.opportunities.length + results.events.length;
  return (
    <>
      <PageIntro
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search the workspace"}
        text="Search looks at this organization’s signals, opportunities, and events. Enter at least two characters."
      />
      {query.length < 2 ? (
        <Empty title="Type a little more" text="Use the search field above. Two or more characters search this organization only." />
      ) : null}
      {query.length >= 2 && !total ? (
        <Empty title="No matches" text="Nothing in this organization matches that text. Try a signal title, an opportunity, or words from an event." />
      ) : null}
      {query.length >= 2 && total ? (
        <>
          <Section title="Signals" text={results.signals.length ? `${results.signals.length} shown. Signals do not have a separate detail page.` : "No signal titles matched."}>
            <ul className="grid gap-2">
              {results.signals.map((item) => (
                <li key={item.id} className="panel rounded-xl px-4 py-3 text-sm">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
                    <StatusBadge value={item.severity} />
                    <span>Frequency {item.frequency}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Opportunities" text={results.opportunities.length ? "Open a result to review evidence." : "No opportunity titles matched."}>
            <ul className="grid gap-2">
              {results.opportunities.map((item) => (
                <li key={item.id}>
                  <Link href={`/app/opportunities/${item.id}`} className="panel block rounded-xl px-4 py-3 text-sm hover:border-cyan/40">
                    <span className="font-semibold text-navy">{item.title}</span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge value={item.status} />
                      <StatusBadge value={item.priority} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Events" text={results.events.length ? "Events are listed here. Open Business Memory for the wider record." : "No event text matched."}>
            <ul className="grid gap-2">
              {results.events.map((item) => (
                <li key={item.id} className="panel rounded-xl px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={item.provenance} />
                    <StatusBadge value={item.type} />
                  </div>
                  <p className="mt-2 font-semibold text-navy">{item.title}</p>
                </li>
              ))}
            </ul>
          </Section>
        </>
      ) : null}
    </>
  );
}
