import Link from "next/link";
import { labelize, provenanceHint, toneFor, type BadgeTone } from "@/lib/app-labels";

export const controlClass =
  "min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm font-normal text-navy";

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-navy hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-danger/40 bg-danger-soft px-3 text-sm font-semibold text-danger disabled:cursor-not-allowed disabled:opacity-60";

export const thClass = "bg-paper px-4 py-3 text-left text-[11px] font-semibold tracking-[0.14em] text-muted uppercase";
export const tdClass = "border-t border-line px-4 py-3 align-top text-navy";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-mist text-navy",
  blue: "bg-cyan-soft text-cyan",
  orange: "bg-orange-soft text-orange",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  title?: string;
}) {
  return (
    <span title={title} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge tone={toneFor(value)} title={provenanceHint(value)}>
      {labelize(value)}
    </Badge>
  );
}

export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-10">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{text}</p>
      {action ? (
        <Link href={action.href} className={`${primaryButtonClass} mt-5`}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  detail,
  provenance,
}: {
  label: string;
  value: string | number;
  detail?: string;
  provenance?: string;
}) {
  return (
    <article className="panel flex h-full flex-col rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</p>
        {provenance ? <StatusBadge value={provenance} /> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-navy tabular-nums">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-muted">{detail}</p> : null}
    </article>
  );
}

export function PageIntro({
  eyebrow,
  title,
  text,
  actions,
}: {
  eyebrow: string;
  title: string;
  text: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{text}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  title,
  text,
  children,
  action,
}: {
  title: string;
  text?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {text ? <p className="mt-1 text-sm leading-6 text-muted">{text}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function KeyFacts({ items }: { items: { label: string; value: React.ReactNode; hint?: string }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="panel rounded-xl px-4 py-3">
          <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-navy">{item.value}</dd>
          {item.hint ? <p className="mt-1 text-xs leading-5 text-muted">{item.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: "border-cyan/30 bg-cyan-soft",
    warning: "border-orange/30 bg-orange-soft",
    danger: "border-danger/30 bg-danger-soft",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 text-navy ${tones[tone]}`} role={tone === "danger" ? "alert" : "status"}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}

export function DataTable({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="panel overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </div>
  );
}
