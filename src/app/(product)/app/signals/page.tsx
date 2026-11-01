import Link from "next/link";
import { AnalyzeButton } from "@/components/app/client";
import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { listSignals } from "@/server/modules/read/service";

export default async function SignalsPage() {
  const context = await requireOrg();
  const rows = await listSignals(context.db, context.organizationId);
  const active = rows.filter((row) => row.status === "active");
  return (
    <>
      <PageIntro eyebrow="Signal intelligence" title="Repeated patterns in observed events" text="Frequencies, delays, and report counts are computed in code. The detection method on each card says deterministic." />
      <AnalyzeButton />
      {!active.length ? <Empty title="No active signals" text="Upload support, sales, or operations records. A pattern has to clear the detector’s minimum count before it appears." /> : null}
      <div className="grid gap-3">
        {active.map((signal) => (
          <article key={signal.id} className="panel rounded-xl p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="orange">{signal.severity}</Badge>
              <Badge>{signal.trend}</Badge>
              <Badge tone="blue">{signal.detectionMethod}</Badge>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-navy">{signal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{signal.description}</p>
            <p className="mt-3 text-sm text-navy">Frequency {signal.frequency} · confidence {signal.confidence} · {signal.firstObserved.toISOString().slice(0, 10)} to {signal.lastObserved.toISOString().slice(0, 10)}</p>
            <p className="text-sm text-muted">Departments: {signal.departments.join(", ") || "not recorded"}</p>
            <Link href="/app/radar" className="mt-3 inline-flex text-sm font-semibold text-cyan">See the opportunity</Link>
          </article>
        ))}
      </div>
    </>
  );
}
