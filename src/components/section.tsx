export function Section({
  id,
  tone = "white",
  children,
  className = "",
}: {
  id?: string;
  tone?: "white" | "paper" | "navy";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    white: "bg-white text-ink",
    paper: "bg-paper text-ink",
    navy: "bg-inverse text-on-inverse",
  } as const;

  return (
    <section id={id} className={`scroll-mt-24 ${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-cyan uppercase">
      <span className="h-px w-6 bg-cyan" aria-hidden="true" />
      {children}
    </p>
  );
}

export function StatusNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-cyan bg-cyan-soft px-4 py-3 text-sm leading-6 text-ink">
      {children}
    </p>
  );
}
