import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityActions } from "@/components/app/client";
import { Badge, PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { opportunityDetail } from "@/server/modules/read/service";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const detail = await opportunityDetail(context.db, context.organizationId, id);
  if (!detail) notFound();
  const { opportunity, signals, evidence, approvals, agents } = detail;
  return (
    <>
      <PageIntro eyebrow={opportunity.status} title={opportunity.title} text={opportunity.problem} />
      <div className="flex flex-wrap gap-2">
        <Badge tone="orange">{opportunity.priority}</Badge>
        <Badge tone="blue">confidence {opportunity.confidence}</Badge>
        <Badge>estimate {opportunity.estimatedMinutesSaved} min</Badge>
        {opportunity.measuredMinutesSaved != null ? <Badge>post-run estimate {opportunity.measuredMinutesSaved} min</Badge> : null}
      </div>
      <p className="text-sm leading-6 text-muted">{opportunity.description}</p>
      <p className="text-sm text-navy">{opportunity.recommendedSolution}</p>
      <p className="text-xs leading-5 text-muted">{opportunity.priorityMethod}</p>
      <p className="text-sm text-muted">{opportunity.impactSummary}</p>
      <OpportunityActions opportunityId={opportunity.id} status={opportunity.status} executable={opportunity.executable} canAct={canWrite(context.role)} />
      <section>
        <h2 className="text-lg font-semibold text-navy">Supporting signals</h2>
        <ul className="mt-3 grid gap-2">
          {signals.map((signal) => (
            <li key={signal.id} className="text-sm"><span className="font-semibold text-navy">{signal.title}</span> · frequency {signal.frequency} · {signal.detectionMethod}</li>
          ))}
        </ul>
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold text-navy">Evidence trail</h2>
        {evidence.map((item) => (
          <article key={`${item.signalId}-${item.eventId}-${item.role}`} className="border-b border-line py-3">
            <div className="flex flex-wrap gap-2"><Badge tone="blue">{item.provenance}</Badge><Badge>{item.role}</Badge><Badge>{item.type}</Badge></div>
            <h3 className="mt-2 font-semibold text-navy">{item.title}</h3>
            <p className="text-sm text-muted">{item.excerpt}</p>
            <p className="text-xs text-muted">{item.occurredAt.toISOString()} · event {item.eventId}</p>
          </article>
        ))}
      </section>
      <section>
        <h2 className="text-lg font-semibold text-navy">Approvals</h2>
        {approvals.length ? approvals.map((approval) => (
          <p key={approval.id} className="text-sm text-muted">{approval.status} · {approval.decidedAt?.toISOString()}</p>
        )) : <p className="text-sm text-muted">No decision yet.</p>}
      </section>
      <section>
        <h2 className="text-lg font-semibold text-navy">Agents</h2>
        {agents.length ? agents.map((agent) => (
          <p key={agent.id} className="text-sm"><Link className="font-semibold text-cyan" href={`/app/agents/${agent.id}`}>{agent.name}</Link> · {agent.status} · {agent.channel}</p>
        )) : <p className="text-sm text-muted">No agent is linked yet.</p>}
      </section>
    </>
  );
}
