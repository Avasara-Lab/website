import Link from "next/link";
import { Badge, Empty, PageIntro, Stat } from "@/components/app/ui";
import { PRIORITY_METHOD } from "@/server/domain";
import { requireOrg } from "@/server/auth/context";
import { dashboard, listOpportunities } from "@/server/modules/read/service";

export default async function RadarPage({ searchParams }: { searchParams: Promise<{ status?: string; priority?: string; department?: string }> }) {
  const context = await requireOrg();
  const filters = await searchParams;
  const [summary, rows] = await Promise.all([
    dashboard(context.db, context.organizationId),
    listOpportunities(context.db, context.organizationId),
  ]);
  const visible = rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    if (filters.department && !row.departments.includes(filters.department)) return false;
    return true;
  });
  const departments = [...new Set(rows.flatMap((row) => row.departments))];
  return (
    <>
      <PageIntro eyebrow="Opportunity Radar" title="What to do next" text="Each card is backed by signals. Estimated savings are labeled as estimates. Evidence opens on the opportunity." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Signals" value={summary.signals} />
        <Stat label="Opportunities" value={rows.length} />
        <Stat label="Active agents" value={summary.activeAgents} />
        <Stat label="Completed" value={summary.completedAutomations} />
      </section>
      <form className="flex flex-wrap gap-2" action="/app/radar">
        <select name="status" defaultValue={filters.status ?? ""} className="min-h-10 rounded-lg border border-line bg-surface px-2 text-sm">
          <option value="">Any status</option>
          {["NEW", "INVESTIGATING", "READY_FOR_APPROVAL", "APPROVED", "REJECTED", "EXECUTING", "COMPLETED", "FAILED"].map((status) => <option key={status}>{status}</option>)}
        </select>
        <select name="priority" defaultValue={filters.priority ?? ""} className="min-h-10 rounded-lg border border-line bg-surface px-2 text-sm">
          <option value="">Any priority</option>
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <select name="department" defaultValue={filters.department ?? ""} className="min-h-10 rounded-lg border border-line bg-surface px-2 text-sm">
          <option value="">Any department</option>
          {departments.map((department) => <option key={department}>{department}</option>)}
        </select>
        <button className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold" type="submit">Filter</button>
      </form>
      <p className="text-xs leading-5 text-muted">{PRIORITY_METHOD}</p>
      {!visible.length ? <Empty title="Nothing matches" text="Clear the filters or ingest more observed events." /> : null}
      <div className="grid gap-4">
        {visible.map((item) => (
          <article key={item.id} className="panel rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="orange">{item.priority}</Badge>
              <Badge>{item.status}</Badge>
              <Badge tone="blue">score {item.priorityScore}</Badge>
              <Badge>{item.executable ? "executor available" : "no executor"}</Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-navy">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.problem}</p>
            <p className="mt-3 text-sm text-navy">Frequency {item.frequency} · confidence {item.confidence} · estimated {item.estimatedMinutesSaved} minutes</p>
            <p className="text-sm text-muted">Suggested agent: {item.suggestedAgent}. Departments: {item.departments.join(", ") || "not recorded"}.</p>
            <Link href={`/app/opportunities/${item.id}`} className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-cyan">Open evidence</Link>
          </article>
        ))}
      </div>
    </>
  );
}
