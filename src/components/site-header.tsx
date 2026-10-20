"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { nav, site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
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
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-navy">
          <span
            className="grid size-7 place-items-center rounded-md bg-navy"
            aria-hidden="true"
          >
            <span className="block h-0.5 w-3.5 bg-cyan-soft" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium ${
                  active ? "text-navy" : "text-muted hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden min-h-10 items-center rounded-md bg-navy px-3.5 text-sm font-semibold text-white hover:bg-navy-deep sm:inline-flex"
          >
            Book a Discovery Call
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md border border-line text-navy lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id={panelId}
          aria-label="Mobile"
          className="max-h-[calc(100vh-4rem)] overflow-auto border-t border-line bg-white px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-3 text-base font-medium text-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-navy px-4 text-sm font-semibold text-white"
          >
            Book a Discovery Call
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
