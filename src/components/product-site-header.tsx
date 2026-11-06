"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { opportunity } from "@/lib/opportunity";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#product", label: "Product" },
  { href: "/#meta", label: "Meta models" },
  { href: "/#demo", label: "Demo" },
] as const;

export function ProductSiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 md:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-navy">
          <Mark />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">Avasara Lab</span>
            <span className="block truncate text-[11px] font-medium text-muted">Opportunity Intelligence</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href={opportunity.bookCall}
            className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy lg:inline-flex"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a call
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link
            href={opportunity.demoLogin}
            className="inline-flex min-h-11 items-center rounded-lg bg-btn px-3 text-sm font-semibold text-on-btn hover:bg-btn-hover sm:px-4"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">Try the live demo</span>
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-navy lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id={panelId} className="border-t border-line bg-background px-5 py-3 lg:hidden" aria-label="Mobile">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center text-base font-semibold text-navy"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="flex min-h-11 items-center text-base font-semibold text-navy" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <a
            href={opportunity.bookCall}
            className="flex min-h-11 items-center text-base font-semibold text-navy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Book a call
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      ) : null}
    </header>
  );
}

function Mark() {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-btn" aria-hidden="true">
      <span className="block size-2.5 rounded-[2px] bg-cyan" />
    </span>
  );
}
