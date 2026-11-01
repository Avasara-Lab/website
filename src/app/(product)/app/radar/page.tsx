import Link from "next/link";
import { Badge, Empty, PageIntro, Stat, StatusBadge, controlClass, secondaryButtonClass } from "@/components/app/ui";
import { formatConfidence, labelize } from "@/lib/app-labels";
import { PRIORITY_METHOD } from "@/server/domain";
import { requireOrg } from "@/server/auth/context";
import { dashboard, listOpportunities } from "@/server/modules/read/service";

const STATUSES = ["NEW", "INVESTIGATING", "READY_FOR_APPROVAL", "APPROVED", "REJECTED", "EXECUTING", "COMPLETED", "FAILED"] as const;

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
  const filtered = Boolean(filters.status || filters.priority || filters.department);
  return (
    <>
      <PageIntro
        eyebrow="Opportunity Radar"
        title="What to do next"
        text="Each card is ranked from stored signals. Open one to read the evidence, then approve or execute when the recommendation is ready."
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Radar summary">
        <Stat label="Signals" value={summary.signals} provenance="observed" />
        <Stat label="Opportunities" value={rows.length} provenance="observed" />
        <Stat label="Active agents" value={summary.activeAgents} provenance="observed" />
        <Stat label="Completed" value={summary.completedAutomations} provenance="observed" />
      </section>
      <form className="panel grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" action="/app/radar">
        <FilterSelect label="Status" name="status" value={filters.status ?? ""}>
          <option value="">Any status</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {labelize(status)}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Priority" name="priority" value={filters.priority ?? ""}>
          <option value="">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
        <FilterSelect label="Department" name="department" value={filters.department ?? ""}>
          <option value="">Any department</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </FilterSelect>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButtonClass} type="submit">
            Apply filters
          </button>
          {filtered ? (
            <Link href="/app/radar" className={secondaryButtonClass}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>
      <details className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-navy">How priority is scored</summary>
        <p className="mt-2 text-xs leading-5 text-muted">{PRIORITY_METHOD}</p>
      </details>
      {!visible.length ? (
        <Empty
          title={rows.length ? "Nothing matches these filters" : "No opportunities yet"}
          text={
            rows.length
              ? "Clear the filters, or ingest more observed events from Business Connect."
              : "Upload support, sales, or operations records, then re-analyze. A pattern has to clear the detector before an opportunity appears."
          }
          action={rows.length ? { href: "/app/radar", label: "Clear filters" } : { href: "/app/connect", label: "Upload records" }}
        />
      ) : null}
      <div className="grid gap-4">
        {visible.map((item) => (
          <article key={item.id} className="panel rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={item.priority} />
              <StatusBadge value={item.status} />
              <span className="text-xs font-medium text-muted">Score {item.priorityScore}</span>
              <Badge tone={item.executable ? "blue" : "neutral"}>{item.executable ? "Executor available" : "No executor"}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-navy">
              <Link href={`/app/opportunities/${item.id}`} className="hover:text-cyan">
                {item.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{item.problem}</p>
            <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Frequency</dt>
                <dd className="mt-1 text-sm font-semibold text-navy tabular-nums">{item.frequency}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Confidence</dt>
                <dd className="mt-1 text-sm font-semibold text-navy tabular-nums" title={`Stored confidence ${item.confidence}`}>
                  {formatConfidence(item.confidence)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Estimated minutes</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-navy tabular-nums">
                  {item.estimatedMinutesSaved}
                  <StatusBadge value="estimate" />
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-muted">
              Suggested agent: {item.suggestedAgent}. Departments: {item.departments.join(", ") || "not recorded"}.
            </p>
            <Link href={`/app/opportunities/${item.id}`} className={`${secondaryButtonClass} mt-4`}>
              Review evidence
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}

function FilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase" htmlFor={`filter-${name}`}>
      {label}
      <select id={`filter-${name}`} name={name} defaultValue={value} className={`${controlClass} normal-case`}>
        {children}
      </select>
    </label>
  );
}
