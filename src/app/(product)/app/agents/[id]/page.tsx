import { notFound } from "next/navigation";
import { AgentStatusButton } from "@/components/app/client";
import { Badge, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { listAgents, listRuns } from "@/server/modules/read/service";
import Link from "next/link";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const data = await listAgents(context.db, context.organizationId);
  const agent = data.agents.find((item) => item.id === id);
  if (!agent) notFound();
  const runs = (await listRuns(context.db, context.organizationId)).filter((run) => run.agentId === agent.id);
  return (
    <>
      <PageIntro eyebrow="Agent" title={agent.name} text={agent.description} />
      <div className="flex flex-wrap gap-2">
        <Badge tone="orange">{agent.channel === "simulated_support_inbox" ? "simulated channel" : agent.channel}</Badge>
        <Badge>{agent.status}</Badge>
        <Badge tone="blue">{agent.modelId}</Badge>
      </div>
      <p className="text-sm text-muted">Permissions: {agent.permissions.join(", ") || "none"}.</p>
      <ul className="grid gap-2 text-sm">
        {data.tools.filter((tool) => tool.agentId === agent.id).map((tool) => (
          <li key={tool.id} className="panel rounded-xl p-4"><span className="font-semibold text-navy">{tool.name}</span> · {tool.enabled ? "enabled" : "disabled"} · {tool.description}</li>
        ))}
      </ul>
      {canWrite(context.role) ? <AgentStatusButton agentId={agent.id} status={agent.status} /> : null}
      <section>
        <h2 className="text-lg font-semibold text-navy">Runs</h2>
        <ul className="mt-2 grid gap-2 text-sm">
          {runs.map((run) => <li key={run.id}><Link className="font-semibold text-cyan" href={`/app/executions/${run.id}`}>{run.status}</Link> · verification {run.verificationStatus}</li>)}
          {!runs.length ? <li className="text-muted">No runs yet.</li> : null}
        </ul>
      </section>
    </>
  );
}
