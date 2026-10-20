import Link from "next/link";
import { ArrowRight } from "lucide-react";

const variants = {
  primary:
    "bg-navy text-white hover:bg-navy-deep border border-navy",
  secondary:
    "bg-white text-navy border border-line hover:border-navy/40",
  inverse:
    "bg-white text-navy border border-white hover:bg-paper",
  ghost: "bg-transparent text-white border border-white/30 hover:border-white",
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${variants[variant]}`}
    >
      {children}
      {arrow ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
    </Link>
  );
}
