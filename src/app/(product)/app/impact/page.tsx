import { Empty, PageIntro, StatusBadge } from "@/components/app/ui";
import { labelize } from "@/lib/app-labels";
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
        text="Every figure keeps its classification. Observed is a stored count. Estimate uses a stated assumption. Simulated means the support inbox was not a live customer channel. Verified means the reply matched an observed approved answer."
      />
      {!snapshot.metrics.length ? (
        <Empty
          title="No impact yet"
          text="Ingest events to see observed counts. Verified and simulated rows appear after an agent run."
          action={{ href: "/app/connect", label: "Upload records" }}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {snapshot.metrics.map((metric) => {
            const note = detailNote(metric.details);
            return (
              <article key={metric.metricKey} className="panel flex flex-col rounded-xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-navy">{metric.label}</h2>
                  <StatusBadge value={metric.classification} />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-navy tabular-nums">
                  {metric.unit === "ratio" ? `${Math.round(metric.value * 100)}%` : metric.value}
                  <span className="ml-2 text-sm font-medium text-muted">{unitCaption(metric.unit)}</span>
                </p>
                {note ? <p className="mt-2 text-sm leading-6 text-muted">{note}</p> : null}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function unitCaption(unit: string) {
  if (unit === "ratio") return "of recorded runs";
  return unit;
}

function detailNote(details: Record<string, unknown>) {
  const parts: string[] = [];
  if (typeof details.note === "string" && details.note) parts.push(details.note);
  if (typeof details.rule === "string" && details.rule) parts.push(`Rule: ${details.rule}`);
  if (typeof details.runs === "number" && typeof details.verified === "number") {
    parts.push(`${details.verified} verified of ${details.runs} recorded runs.`);
  }
  if (typeof details.detection === "string") parts.push(`Detection: ${details.detection}.`);
  if (typeof details.channel === "string") parts.push(`Channel: ${labelize(details.channel)}.`);
  return parts.join(" ");
}
