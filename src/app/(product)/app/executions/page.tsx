import Link from "next/link";
import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { listRuns } from "@/server/modules/read/service";

export default async function ExecutionsPage() {
  const context = await requireOrg();
  const runs = await listRuns(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Execution history" title="What an approved agent did" text="A verified run means each simulated reply matched an approved answer already present on an observed conversation." />
      {!runs.length ? <Empty title="No executions" text="Approve an opportunity, create the support agent, then run the simulated workflow." /> : null}
      <ul className="grid gap-3">
        {runs.map((run) => (
          <li key={run.id} className="panel rounded-xl p-4">
            <div className="flex flex-wrap gap-2"><Badge>{run.status}</Badge><Badge tone={run.verificationStatus === "verified" ? "blue" : "danger"}>{run.verificationStatus}</Badge></div>
            <Link href={`/app/executions/${run.id}`} className="mt-2 block font-semibold text-navy">{run.summary || run.id}</Link>
            <p className="text-xs text-muted">{run.startedAt.toISOString()}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
