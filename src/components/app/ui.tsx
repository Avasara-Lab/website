export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "blue" | "orange" | "danger" }) {
  const tones = {
    neutral: "bg-paper text-muted",
    blue: "bg-cyan-soft text-cyan",
    orange: "bg-orange-soft text-orange",
    danger: "bg-danger-soft text-danger",
  };
  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide uppercase ${tones[tone]}`}>{children}</span>;
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-5 py-10">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <article className="panel rounded-xl p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-navy">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted">{detail}</p> : null}
    </article>
  );
}

export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </header>
  );
}
