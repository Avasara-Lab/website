import Link from "next/link";
import { ArrowRight } from "lucide-react";

const variants = {
  primary: "bg-btn text-on-btn hover:bg-btn-hover border border-btn",
  secondary: "bg-surface text-navy border border-line hover:border-cyan/50",
  inverse: "bg-on-inverse text-ink-fixed border border-on-inverse hover:opacity-90",
  ghost: "bg-transparent text-on-inverse border border-on-inverse/30 hover:border-on-inverse",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors ${variants[variant]}`}
    >
      {children}
      {arrow ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </Link>
  );
}
