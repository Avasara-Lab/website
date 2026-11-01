import Link from "next/link";
import { Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { searchWorkspace } from "@/server/modules/read/service";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const context = await requireOrg();
  const { q = "" } = await searchParams;
  const results = await searchWorkspace(context.db, context.organizationId, q);
  return (
    <>
      <PageIntro eyebrow="Search" title={q ? `Results for “${q}”` : "Search the workspace"} text="Search looks at this organization’s signals, opportunities, and events." />
      {q.trim().length < 2 ? <Empty title="Enter at least two characters" text="Results stay empty until the query is long enough to search this organization." /> : null}
      {q.trim().length >= 2 && !results.signals.length && !results.opportunities.length && !results.events.length ? <Empty title="No matches" text="Nothing in this organization matches that query." /> : null}
      <section>
        <h2 className="font-semibold text-navy">Signals</h2>
        <ul className="mt-2 text-sm">{results.signals.map((item) => <li key={item.id}>{item.title}</li>)}{!results.signals.length ? <li className="text-muted">None.</li> : null}</ul>
      </section>
      <section>
        <h2 className="font-semibold text-navy">Opportunities</h2>
        <ul className="mt-2 text-sm">{results.opportunities.map((item) => <li key={item.id}><Link className="text-cyan" href={`/app/opportunities/${item.id}`}>{item.title}</Link></li>)}{!results.opportunities.length ? <li className="text-muted">None.</li> : null}</ul>
      </section>
      <section>
        <h2 className="font-semibold text-navy">Events</h2>
        <ul className="mt-2 text-sm">{results.events.map((item) => <li key={item.id}>{item.title}</li>)}{!results.events.length ? <li className="text-muted">None.</li> : null}</ul>
      </section>
    </>
  );
}
