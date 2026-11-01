import Link from "next/link";
import { AnalyzeButton } from "@/components/app/client";
import { Empty, PageIntro, StatusBadge, secondaryButtonClass } from "@/components/app/ui";
import { formatConfidence, formatWhen } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { listSignals } from "@/server/modules/read/service";

export default async function SignalsPage() {
  const context = await requireOrg();
  const rows = await listSignals(context.db, context.organizationId);
  const active = rows.filter((row) => row.status === "active");
  return (
    <>
      <PageIntro
        eyebrow="Signal intelligence"
        title="Repeated patterns in observed events"
        text="Frequencies, delays, and report counts are computed in code. Open Opportunity Radar when you are ready to act on a pattern."
        actions={<AnalyzeButton />}
      />
      {!active.length ? (
        <Empty
          title="No active signals"
          text="Upload support, sales, or operations records. A pattern has to clear the detector’s minimum count before it appears."
          action={{ href: "/app/connect", label: "Upload records" }}
        />
      ) : null}
      <div className="grid gap-3">
        {active.map((signal) => (
          <article key={signal.id} className="panel rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={signal.severity} />
              <StatusBadge value={signal.trend} />
              <StatusBadge value={signal.detectionMethod} />
              <StatusBadge value="observed" />
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-navy">{signal.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{signal.description}</p>
            <dl className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Frequency</dt>
                <dd className="mt-1 text-sm font-semibold text-navy tabular-nums">{signal.frequency}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Confidence</dt>
                <dd className="mt-1 text-sm font-semibold text-navy tabular-nums" title={`Stored confidence ${signal.confidence}`}>
                  {formatConfidence(signal.confidence)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Observed</dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {formatWhen(signal.firstObserved)} – {formatWhen(signal.lastObserved)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-muted">Departments: {signal.departments.join(", ") || "not recorded"}.</p>
            <Link href="/app/radar" className={`${secondaryButtonClass} mt-4`}>
              Review on Opportunity Radar
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
