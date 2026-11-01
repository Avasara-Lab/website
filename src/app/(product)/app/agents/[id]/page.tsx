import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentStatusButton } from "@/components/app/client";
import { Badge, PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { listAgents, listRuns } from "@/server/modules/read/service";

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const data = await listAgents(context.db, context.organizationId);
  const agent = data.agents.find((item) => item.id === id);
  if (!agent) notFound();
  const runs = (await listRuns(context.db, context.organizationId)).filter((run) => run.agentId === agent.id);
  const tools = data.tools.filter((tool) => tool.agentId === agent.id);
  return (
    <>
      <PageIntro eyebrow="Agent" title={agent.name} text={agent.description} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone={agent.channel.includes("simulated") ? "orange" : "blue"}>{labelize(agent.channel)}</Badge>
            <StatusBadge value={agent.status} />
            <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-navy">{agent.modelId}</span>
          </div>
          <dl className="panel grid gap-3 rounded-xl p-5 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Department</dt>
              <dd className="mt-1 text-sm font-medium text-navy">{agent.department || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">Permissions</dt>
              <dd className="mt-1 text-sm font-medium text-navy">{agent.permissions.join(", ") || "None"}</dd>
            </div>
          </dl>
          <Section title="Tools" text="This agent can only call the tools listed here.">
            {tools.length ? (
              <ul className="grid gap-2">
                {tools.map((tool) => (
                  <li key={tool.id} className="panel rounded-xl px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-navy">{tool.name}</span>
                      <Badge tone={tool.enabled ? "blue" : "neutral"}>{tool.enabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    <p className="mt-1 text-muted">{tool.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No tools are attached.</p>
            )}
          </Section>
        </div>
        <aside className="panel grid h-fit gap-3 rounded-xl p-5 lg:sticky lg:top-20">
          <h2 className="text-base font-semibold text-navy">Agent controls</h2>
          <p className="text-sm leading-6 text-muted">
            Channel: {labelize(agent.channel)}. {agent.channel.includes("simulated") ? "Replies stay on the simulated inbox." : "Review the channel before you activate it."}
          </p>
          {canWrite(context.role) ? <AgentStatusButton agentId={agent.id} status={agent.status} /> : <p className="text-sm text-muted">Your role can review this agent. Status changes stay with owners, administrators, and managers.</p>}
        </aside>
      </div>
      <Section title="Runs" text="Open a run to read the step log and its verification status.">
        {runs.length ? (
          <ul className="grid gap-2">
            {runs.map((run) => (
              <li key={run.id}>
                <Link href={`/app/executions/${run.id}`} className="panel flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm hover:border-cyan/40">
                  <StatusBadge value={run.status} />
                  <StatusBadge value={run.verificationStatus} />
                  <span className="font-medium text-navy">{run.summary || "Open the run log"}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No runs yet. Approve the linked opportunity, then execute the simulated workflow.</p>
        )}
      </Section>
    </>
  );
}
