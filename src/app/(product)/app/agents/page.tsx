import Link from "next/link";
import { AgentStatusButton } from "@/components/app/client";
import { Badge, Empty, PageIntro, StatusBadge } from "@/components/app/ui";
import { labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { listAgents } from "@/server/modules/read/service";

export default async function AgentsPage() {
  const context = await requireOrg();
  const data = await listAgents(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="AI agents"
        title="Agents that can act only inside their tools"
        text="The Customer Support Automation Agent records replies on a simulated inbox. It cannot delete data or move money. Create one from an executable opportunity."
      />
      {!data.agents.length ? (
        <Empty
          title="No agents yet"
          text="Open an executable opportunity and create the support agent from its evidence page."
          action={{ href: "/app/radar", label: "Open Opportunity Radar" }}
        />
      ) : null}
      <div className="grid gap-3">
        {data.agents.map((agent) => {
          const tools = data.tools.filter((tool) => tool.agentId === agent.id);
          return (
            <article key={agent.id} className="panel rounded-xl p-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone={agent.channel.includes("simulated") ? "orange" : "blue"}>{labelize(agent.channel)}</Badge>
                <StatusBadge value={agent.status} />
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-navy">
                <Link href={`/app/agents/${agent.id}`} className="hover:text-cyan">
                  {agent.name}
                </Link>
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{agent.description}</p>
              <p className="mt-3 text-sm text-muted">
                Model {agent.modelId} · department {agent.department || "not set"}
              </p>
              {tools.length ? (
                <ul className="mt-3 grid gap-2">
                  {tools.map((tool) => (
                    <li key={tool.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                      <span className="font-semibold text-navy">{tool.name}</span>
                      <span className="text-muted"> · {tool.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">No tools are attached.</p>
              )}
              {canWrite(context.role) ? (
                <div className="mt-4">
                  <AgentStatusButton agentId={agent.id} status={agent.status} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">Your role can review this agent. Pausing it stays with owners, administrators, and managers.</p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
