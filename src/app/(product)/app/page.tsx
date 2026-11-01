import Link from "next/link";
import { AnalyzeButton } from "@/components/app/client";
import { Empty, PageIntro, Section, Stat, StatusBadge } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { dashboard } from "@/server/modules/read/service";

export default async function OverviewPage() {
  const context = await requireOrg();
  const data = await dashboard(context.db, context.organizationId);
  const estimated = data.metrics.find((metric) => metric.metricKey === "estimated_minutes");
  const measured = data.metrics.find((metric) => metric.metricKey === "measured_minutes");
  const counts = data.opportunities;
  const departmentTotal = data.byDepartment.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <>
      <PageIntro
        eyebrow="Overview"
        title={context.organizationName}
        text="Counts come from this organization’s database. Estimates stay labeled. Upload records and re-analyze when a figure is still zero."
        actions={<AnalyzeButton />}
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace counts">
        <Stat label="Active signals" value={data.signals} provenance="observed" detail="Patterns currently marked active." />
        <Stat label="New opportunities" value={counts.NEW ?? 0} provenance="observed" detail="Waiting for review." />
        <Stat label="Investigating" value={counts.INVESTIGATING ?? 0} provenance="observed" />
        <Stat label="Approved" value={counts.APPROVED ?? 0} provenance="observed" detail="Ready to execute when an agent exists." />
        <Stat label="Active agents" value={data.activeAgents} provenance="observed" />
        <Stat label="Completed automations" value={data.completedAutomations} provenance="observed" detail="Opportunities marked completed." />
        <Stat label="Estimated minutes" value={estimated ? Number(estimated.value) : 0} provenance="estimate" detail="Estimate. Not a measured time study." />
        <Stat label="Minutes after verified replies" value={measured ? Number(measured.value) : 0} provenance="estimate" detail="Still an estimate. The reply count is separate." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel rounded-xl p-5">
          <h2 className="text-lg font-semibold text-navy">Departments on opportunities</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Count of opportunities that name each department. The bar is that count’s share of the total.</p>
          {data.byDepartment.length ? (
            <ul className="mt-4 grid gap-3">
              {data.byDepartment.map((row) => (
                <li key={row.department}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-navy">{row.department}</span>
                    <span className="tabular-nums text-muted">{row.value}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist" aria-hidden>
                    <div className="h-full rounded-full bg-cyan" style={{ width: `${(row.value / departmentTotal) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">No opportunities yet. Upload records from Business Connect, then re-analyze.</p>
          )}
        </article>
        <Section title="Recent opportunities" text="Open one to review evidence and decide what happens next.">
          {data.recent.length ? (
            <ul className="grid gap-2">
              {data.recent.map((item) => (
                <li key={item.id}>
                  <Link href={`/app/opportunities/${item.id}`} className="panel block rounded-xl px-4 py-3 hover:border-cyan/40">
                    <span className="font-semibold text-navy">{item.title}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge value={item.status} />
                      <StatusBadge value={item.priority} />
                      <span className="text-xs text-muted">Score {item.priorityScore}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No opportunities yet" text="Upload support, sales, or operations records. Opportunities appear after analysis finds a pattern." action={{ href: "/app/connect", label: "Upload records" }} />
          )}
        </Section>
      </section>
    </>
  );
}
