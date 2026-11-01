import Link from "next/link";
import { Empty, PageIntro, StatusBadge } from "@/components/app/ui";
import { formatWhen } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { listRuns } from "@/server/modules/read/service";

export default async function ExecutionsPage() {
  const context = await requireOrg();
  const runs = await listRuns(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Execution history"
        title="What an approved agent did"
        text="A verified run means each simulated reply matched an approved answer already present on an observed conversation."
      />
      {!runs.length ? (
        <Empty
          title="No executions"
          text="Approve an opportunity, create the support agent, then run the simulated workflow."
          action={{ href: "/app/radar", label: "Open Opportunity Radar" }}
        />
      ) : (
        <ul className="grid gap-3">
          {runs.map((run) => (
            <li key={run.id}>
              <Link href={`/app/executions/${run.id}`} className="panel block rounded-xl p-4 hover:border-cyan/40">
                <span className="flex flex-wrap gap-2">
                  <StatusBadge value={run.status} />
                  <StatusBadge value={run.verificationStatus} />
                </span>
                <span className="mt-2 block font-semibold text-navy">{run.summary || "Open the run log"}</span>
                <span className="mt-1 block text-xs text-muted">{formatWhen(run.startedAt, true)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
