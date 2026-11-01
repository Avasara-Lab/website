import Link from "next/link";
import { AnalyzeButton } from "@/components/app/client";
import { PageIntro, Stat } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { dashboard } from "@/server/modules/read/service";

export default async function OverviewPage() {
  const context = await requireOrg();
  const data = await dashboard(context.db, context.organizationId);
  const estimated = data.metrics.find((metric) => metric.metricKey === "estimated_minutes");
  const measured = data.metrics.find((metric) => metric.metricKey === "measured_minutes");
  const counts = data.opportunities;
  return (
    <>
      <PageIntro
        eyebrow="Overview"
        title={context.organizationName}
        text="Counts on this page come from the organization database. Empty values stay at zero until data is ingested."
      />
      <AnalyzeButton />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active signals" value={data.signals} />
        <Stat label="New opportunities" value={counts.NEW ?? 0} />
        <Stat label="Investigating" value={counts.INVESTIGATING ?? 0} />
        <Stat label="Approved" value={counts.APPROVED ?? 0} />
        <Stat label="Active agents" value={data.activeAgents} />
        <Stat label="Completed automations" value={data.completedAutomations} />
        <Stat label="Estimated minutes" value={estimated ? Number(estimated.value) : 0} detail="Estimate. Not a measured time study." />
        <Stat label="Minutes after verified replies" value={measured ? Number(measured.value) : 0} detail="Still an estimate. The reply count is separate." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel rounded-xl p-5">
          <h2 className="text-lg font-semibold text-navy">Departments on opportunities</h2>
          {data.byDepartment.length ? (
            <ul className="mt-3 grid gap-2 text-sm">
              {data.byDepartment.map((row) => (
                <li key={row.department} className="flex justify-between gap-3"><span>{row.department}</span><span>{row.value}</span></li>
              ))}
            </ul>
          ) : <p className="mt-3 text-sm text-muted">No opportunities yet.</p>}
        </article>
        <article className="panel rounded-xl p-5">
          <h2 className="text-lg font-semibold text-navy">Recent opportunities</h2>
          <ul className="mt-3 grid gap-3">
            {data.recent.map((item) => (
              <li key={item.id}>
                <Link href={`/app/opportunities/${item.id}`} className="font-semibold text-navy">{item.title}</Link>
                <p className="text-xs text-muted">{item.status} · {item.priority} priority · score {item.priorityScore}</p>
              </li>
            ))}
            {!data.recent.length ? <li className="text-sm text-muted">Upload data from Business Connect.</li> : null}
          </ul>
        </article>
      </section>
    </>
  );
}
