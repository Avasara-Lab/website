import { notFound } from "next/navigation";
import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { runDetail } from "@/server/modules/read/service";

export default async function ExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const detail = await runDetail(context.db, context.organizationId, id);
  if (!detail) notFound();
  return (
    <>
      <PageIntro eyebrow="Execution log" title={detail.run.verificationStatus === "verified" ? "Verified run" : "Run needs review"} text={detail.run.summary || "The steps below are the record of this run."} />
      {!detail.logs.length ? <Empty title="No log entries" text="This run has no recorded steps." /> : null}
      <ol className="grid gap-3">
        {detail.logs.map((entry) => (
          <li key={entry.id} className="panel rounded-xl p-4">
            <div className="flex flex-wrap gap-2"><Badge tone="blue">{entry.step}</Badge><Badge tone={entry.provenance === "simulated" ? "orange" : "neutral"}>{entry.provenance}</Badge></div>
            <p className="mt-2 text-sm leading-6 text-navy">{entry.message}</p>
            {entry.step === "EXECUTE" && entry.payload && typeof entry.payload === "object" && "body" in entry.payload ? (
              <p className="mt-2 text-sm text-muted">Simulated reply: {String(entry.payload.body)}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
