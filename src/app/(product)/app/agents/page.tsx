import Link from "next/link";
import { AgentStatusButton } from "@/components/app/client";
import { Badge, Empty, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { listAgents } from "@/server/modules/read/service";

export default async function AgentsPage() {
  const context = await requireOrg();
  const data = await listAgents(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="AI agents" title="Agents that can act only inside their tools" text="The Customer Support Automation Agent records replies on a simulated inbox. It cannot delete data or move money." />
      {!data.agents.length ? <Empty title="No agents yet" text="Open an executable opportunity and create the support agent from its evidence page." /> : null}
      <div className="grid gap-3">
        {data.agents.map((agent) => (
          <article key={agent.id} className="panel rounded-xl p-5">
            <div className="flex flex-wrap gap-2"><Badge tone={agent.channel.includes("simulated") ? "orange" : "blue"}>{agent.channel}</Badge><Badge>{agent.status}</Badge></div>
            <h2 className="mt-3 text-xl font-semibold text-navy"><Link href={`/app/agents/${agent.id}`}>{agent.name}</Link></h2>
            <p className="mt-2 text-sm leading-6 text-muted">{agent.description}</p>
            <p className="text-sm text-muted">Model {agent.modelId} · department {agent.department || "not set"}</p>
            <ul className="mt-2 text-sm text-navy">
              {data.tools.filter((tool) => tool.agentId === agent.id).map((tool) => <li key={tool.id}>{tool.name}: {tool.description}</li>)}
            </ul>
            {canWrite(context.role) ? <div className="mt-3"><AgentStatusButton agentId={agent.id} status={agent.status} /></div> : null}
          </article>
        ))}
      </div>
    </>
  );
}
