import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { buildImpact } from "@/server/modules/impact/service";

export default async function ImpactPage() {
  const context = await requireOrg();
  const snapshot = await buildImpact(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Impact intelligence"
        title="What changed, and how sure we are"
        text="Each figure has a classification. Simulated means the support inbox was not a live customer channel. Estimate means the minutes use an assumption. Verified means the reply text matched an observed approved answer."
      />
      {snapshot.synthetic ? <p className="rounded-lg bg-orange-soft px-3 py-2 text-sm text-navy">These numbers belong to a synthetic company. They are not customer achievements.</p> : null}
      {!snapshot.metrics.length ? <Empty title="No impact yet" text="Ingest events to see observed counts. Verified and simulated rows appear after an agent run." /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {snapshot.metrics.map((metric) => (
          <article key={metric.metricKey} className="panel rounded-xl p-5">
            <Badge tone={metric.classification === "verified" ? "blue" : metric.classification === "estimate" || metric.classification === "simulated" ? "orange" : "neutral"}>{metric.classification}</Badge>
            <h2 className="mt-3 text-lg font-semibold text-navy">{metric.label}</h2>
            <p className="mt-2 text-3xl font-semibold text-navy">{metric.unit === "ratio" ? `${Math.round(metric.value * 100)}%` : metric.value}</p>
            <p className="text-xs text-muted">{metric.unit}</p>
            {"note" in metric.details && metric.details.note ? <p className="mt-2 text-sm leading-6 text-muted">{String(metric.details.note)}</p> : null}
          </article>
        ))}
      </div>
    </>
  );
}
