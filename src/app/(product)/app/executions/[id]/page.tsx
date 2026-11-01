import Link from "next/link";
import { notFound } from "next/navigation";
import { Empty, PageIntro, StatusBadge } from "@/components/app/ui";
import { formatWhen, labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { runDetail } from "@/server/modules/read/service";

export default async function ExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const detail = await runDetail(context.db, context.organizationId, id);
  if (!detail) notFound();
  const verified = detail.run.verificationStatus === "verified";
  return (
    <>
      <PageIntro
        eyebrow="Execution log"
        title={verified ? "Verified run" : "Run needs review"}
        text={detail.run.summary || "The steps below are the record of this run."}
      />
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={detail.run.status} />
        <StatusBadge value={detail.run.verificationStatus} />
        <span className="text-sm text-muted">Started {formatWhen(detail.run.startedAt, true)}</span>
      </div>
      <p className="text-sm leading-6 text-muted">
        {verified
          ? "Verification passed because each simulated reply matched an approved answer already on an observed conversation."
          : "This run is not verified. Read the steps before treating any reply as confirmed."}{" "}
        <Link href="/app/impact" className="font-semibold text-cyan">
          See how impact classifies it
        </Link>
        .
      </p>
      {!detail.logs.length ? <Empty title="No log entries" text="This run has no recorded steps." /> : null}
      <ol className="grid gap-3">
        {detail.logs.map((entry, index) => (
          <li key={entry.id} className="panel rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted tabular-nums">Step {index + 1}</span>
              <StatusBadge value={entry.step} />
              <StatusBadge value={entry.provenance} />
            </div>
            <p className="mt-2 text-sm leading-6 text-navy">{entry.message}</p>
            {entry.step === "EXECUTE" && entry.payload && typeof entry.payload === "object" && "body" in entry.payload ? (
              <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm leading-6 text-muted">
                <span className="font-semibold text-navy">{labelize(entry.provenance)} reply. </span>
                {String(entry.payload.body)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
