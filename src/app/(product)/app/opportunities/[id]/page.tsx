import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityActions } from "@/components/app/client";
import { Badge, KeyFacts, PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { formatConfidence, formatWhen, labelize } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canWrite } from "@/server/domain";
import { opportunityDetail } from "@/server/modules/read/service";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOrg();
  const detail = await opportunityDetail(context.db, context.organizationId, id);
  if (!detail) notFound();
  const { opportunity, signals, evidence, approvals, agents } = detail;
  const evidenceBySignal = signals.map((signal) => ({
    signal,
    items: evidence.filter((item) => item.signalId === signal.id),
  }));
  const ungrouped = evidence.filter((item) => !signals.some((signal) => signal.id === item.signalId));
  return (
    <>
      <PageIntro eyebrow="Opportunity" title={opportunity.title} text={opportunity.problem} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={opportunity.status} />
            <StatusBadge value={opportunity.priority} />
            <span className="text-xs font-medium text-muted">Score {opportunity.priorityScore}</span>
            <Badge tone={opportunity.executable ? "blue" : "neutral"}>{opportunity.executable ? "Executor available" : "No executor"}</Badge>
          </div>
          <KeyFacts
            items={[
              { label: "Frequency", value: opportunity.frequency, hint: "Occurrences across the supporting signals." },
              { label: "Confidence", value: formatConfidence(opportunity.confidence), hint: `Stored score ${opportunity.confidence}.` },
              { label: "Estimated minutes", value: <span className="inline-flex items-center gap-2">{opportunity.estimatedMinutesSaved} <StatusBadge value="estimate" /></span>, hint: "Not a measured time study." },
              {
                label: "After verified replies",
                value: opportunity.measuredMinutesSaved != null ? <span className="inline-flex items-center gap-2">{opportunity.measuredMinutesSaved} <StatusBadge value="estimate" /></span> : "—",
                hint: "Filled after a verified run. The minutes stay an estimate.",
              },
            ]}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <article className="panel rounded-xl p-5">
              <h2 className="text-sm font-semibold text-navy">What we saw</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{opportunity.description}</p>
            </article>
            <article className="panel rounded-xl p-5">
              <h2 className="text-sm font-semibold text-navy">Recommended next step</h2>
              <p className="mt-2 text-sm leading-6 text-navy">{opportunity.recommendedSolution}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{opportunity.impactSummary}</p>
            </article>
          </div>
          <p className="text-sm leading-6 text-muted">
            Suggested agent: {opportunity.suggestedAgent}. Departments: {opportunity.departments.join(", ") || "not recorded"}.
          </p>
          <details className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-navy">How this priority was scored</summary>
            <p className="mt-2 text-xs leading-5 text-muted">{opportunity.priorityMethod}</p>
          </details>
        </div>
        <aside className="panel grid h-fit gap-3 rounded-xl p-5 lg:sticky lg:top-20">
          <div>
            <h2 className="text-base font-semibold text-navy">Next actions</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Investigate, approve, or execute. The decision is stored on this organization.</p>
          </div>
          <OpportunityActions
            opportunityId={opportunity.id}
            status={opportunity.status}
            executable={opportunity.executable}
            canAct={canWrite(context.role)}
            layout="stack"
          />
        </aside>
      </div>
      <Section title="Supporting signals" text="These are the patterns this opportunity was generated from.">
        {signals.length ? (
          <ul className="grid gap-2">
            {signals.map((signal) => (
              <li key={signal.id} className="panel rounded-xl px-4 py-3 text-sm">
                <p className="font-semibold text-navy">{signal.title}</p>
                <p className="mt-1 text-muted">
                  Frequency {signal.frequency} · confidence {formatConfidence(signal.confidence)} · {labelize(signal.detectionMethod)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No supporting signals are linked.</p>
        )}
      </Section>
      <Section
        title="Evidence trail"
        text={`${evidence.length} linked event${evidence.length === 1 ? "" : "s"}. Each row keeps its provenance so an observed record is distinct from an estimate or a simulation.`}
      >
        <div className="grid gap-4">
          {evidenceBySignal.map(({ signal, items }) => (
            <div key={signal.id} className="grid gap-2">
              <h3 className="text-sm font-semibold text-navy">{signal.title}</h3>
              {items.length ? items.map((item) => <EvidenceCard key={`${item.signalId}-${item.eventId}-${item.role}`} item={item} />) : <p className="text-sm text-muted">No events linked to this signal.</p>}
            </div>
          ))}
          {ungrouped.map((item) => (
            <EvidenceCard key={`${item.signalId}-${item.eventId}-${item.role}`} item={item} />
          ))}
          {!evidence.length ? <p className="text-sm leading-6 text-muted">No evidence events are stored for this opportunity yet.</p> : null}
        </div>
      </Section>
      <Section title="Approvals" text="A decision appears here after someone approves or rejects.">
        {approvals.length ? (
          <ul className="grid gap-2">
            {approvals.map((approval) => (
              <li key={approval.id} className="panel flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm">
                <StatusBadge value={approval.status} />
                <span className="text-muted">{approval.decidedAt ? formatWhen(approval.decidedAt, true) : "Decision time not recorded"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No decision yet. Use Next actions when you are ready.</p>
        )}
      </Section>
      <Section title="Agents" text="Agents created from this opportunity. They can act only inside their tools.">
        {agents.length ? (
          <ul className="grid gap-2">
            {agents.map((agent) => (
              <li key={agent.id} className="panel rounded-xl px-4 py-3 text-sm">
                <Link className="font-semibold text-navy hover:text-cyan" href={`/app/agents/${agent.id}`}>
                  {agent.name}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-muted">
                  <StatusBadge value={agent.status} />
                  <span>{labelize(agent.channel)}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No agent is linked yet. Create the support agent from Next actions when an executor is available.</p>
        )}
      </Section>
    </>
  );
}

function EvidenceCard({
  item,
}: {
  item: {
    provenance: string;
    role: string;
    type: string;
    title: string;
    excerpt: string;
    occurredAt: Date;
    eventId: string;
  };
}) {
  return (
    <article className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex flex-wrap gap-2">
        <StatusBadge value={item.provenance} />
        <StatusBadge value={item.role} />
        <StatusBadge value={item.type} />
      </div>
      <h3 className="mt-2 text-sm font-semibold text-navy">{item.title}</h3>
      <blockquote className="mt-2 border-l-2 border-line pl-3 text-sm leading-6 text-muted">{item.excerpt}</blockquote>
      <p className="mt-2 text-xs text-muted">
        {formatWhen(item.occurredAt, true)} · <span className="font-mono">event {item.eventId}</span>
      </p>
    </article>
  );
}
