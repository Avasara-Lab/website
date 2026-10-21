const stages = [
  { label: "Business Signals", detail: "Tickets, reviews, and handoffs", tone: "neutral" },
  { label: "AI Analysis", detail: "Themes, entities, exceptions", tone: "analysis" },
  { label: "Problems Identified", detail: "Where the work breaks", tone: "analysis" },
  { label: "Automation Opportunities", detail: "The step worth changing", tone: "opportunity" },
  { label: "Recommended Solutions", detail: "Agents, software, workflows", tone: "neutral" },
  { label: "Implementation", detail: "Built with the team that uses it", tone: "neutral" },
  { label: "Measured Business Impact", detail: "Time, quality, follow-through", tone: "opportunity" },
] as const;

const toneClass = {
  neutral: "border-line bg-surface",
  analysis: "border-cyan/30 bg-cyan-soft",
  opportunity: "border-orange/40 bg-orange-soft",
} as const;

const markerClass = {
  neutral: "border-line text-muted",
  analysis: "border-cyan text-cyan",
  opportunity: "border-orange text-orange",
} as const;

export function HeroFlow() {
  return (
    <figure
      className="panel relative overflow-hidden rounded-xl p-4 sm:p-6 lg:p-5"
      aria-labelledby="opportunity-flow-title"
    >
      <figcaption className="flex items-start justify-between gap-3">
        <div>
          <p id="opportunity-flow-title" className="text-sm font-semibold text-navy">
            Opportunity Intelligence
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Strategic direction. A framed engagement, with synthetic notes. Not a product you can log into.
          </p>
        </div>
        <p className="shrink-0 rounded-md bg-paper px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Illustrative
        </p>
      </figcaption>

      <ol className="relative mt-5 grid gap-2.5 sm:gap-3 lg:mt-4 lg:gap-2">
        <span className="absolute top-2 bottom-2 left-[11px] w-px bg-line" aria-hidden="true" />
        {stages.map((stage, index) => (
          <li key={stage.label} className="relative z-10 flex gap-3">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full border bg-background font-mono text-[10px] ${markerClass[stage.tone]}`}
            >
              {index + 1}
            </span>
            <div className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 sm:py-3 lg:py-2 ${toneClass[stage.tone]}`}>
              <p className="text-sm leading-5 font-semibold text-navy">{stage.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-3 hidden border-t border-line pt-3 text-xs leading-5 text-muted lg:block">
        <span className="font-semibold text-orange">Example.</span> Invoice-timing tickets point to one change: show the next invoice date, then count repeat contacts.
      </p>
      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3 lg:hidden">
        <Signal label="Signal" tone="analysis" body="Plan-change tickets mention invoice timing." />
        <Signal label="Opportunity" tone="opportunity" body="Show the next invoice date at the moment of change." />
        <Signal label="Impact to test" tone="neutral" body="Repeat contacts about the same invoice within seven days." />
      </div>
    </figure>
  );
}

function Signal({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: keyof typeof markerClass;
}) {
  return (
    <div className="rounded-lg border border-line bg-background px-3 py-3">
      <p className={`text-[11px] font-semibold tracking-[0.14em] uppercase ${tone === "opportunity" ? "text-orange" : "text-cyan"}`}>
        {label}
      </p>
      <p className="mt-1 text-sm leading-5 text-ink">{body}</p>
    </div>
  );
}
