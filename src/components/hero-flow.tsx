const stages = [
  { label: "Business signals", detail: "Tickets, reviews, CRM notes" },
  { label: "AI intelligence", detail: "Themes, entities, exceptions" },
  { label: "Opportunities", detail: "Where the work can change" },
  { label: "Solutions", detail: "Agents, software, workflows" },
  { label: "Business impact", detail: "Time, quality, follow-through" },
];

export function HeroFlow() {
  return (
    <figure className="panel relative overflow-hidden rounded-3xl p-5 sm:p-7" aria-label="Illustrative path from business signals to impact">
      <figcaption className="flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
        <span>Illustrative system</span>
        <span className="text-cyan">Synthetic</span>
      </figcaption>
      <svg viewBox="0 0 640 86" className="mt-4 hidden h-16 w-full md:block" aria-hidden="true">
        <path d="M36 43 H604" stroke="#e4dcd0" strokeWidth="2" />
        <path className="flow-dash" d="M36 43 H604" stroke="#b24a28" strokeWidth="2" fill="none" />
        {stages.map((_, index) => (
          <circle key={index} cx={36 + index * 142} cy="43" r="7" fill="#fffdf9" stroke="#17332e" strokeWidth="2" />
        ))}
      </svg>
      <ol className="mt-2 grid gap-3 md:grid-cols-5">
        {stages.map((stage, index) => (
          <li key={stage.label} className="rounded-2xl border border-line bg-paper/70 px-3 py-3">
            <p className="font-mono text-[11px] text-cyan">0{index + 1}</p>
            <p className="mt-1 font-display text-lg leading-tight text-navy">{stage.label}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{stage.detail}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Insight title="Signal" body="Plan-change tickets mention invoice timing." />
        <Insight title="Opportunity" body="Show the next invoice date at the moment of change." />
        <Insight title="Next step" body="Standard reply now. Product change if repeats continue." />
      </div>
    </figure>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line px-3 py-3">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">{title}</p>
      <p className="mt-1 text-sm leading-5 text-ink">{body}</p>
    </div>
  );
}
