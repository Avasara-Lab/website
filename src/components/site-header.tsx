"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { serviceCategories } from "@/lib/services-catalog";
import { site } from "@/lib/site";

const links = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/#how-we-work", label: "Approach" },
];

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [servicesPath, setServicesPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const servicesOpen = servicesPath === pathname;
  const panelId = useId();
  const menuId = useId();

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
    <header className="sticky top-0 z-40 border-b border-line/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-navy">
          <Mark />
          <span className="font-display text-lg font-medium tracking-tight">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setServicesPath(pathname)}
            onMouseLeave={() => setServicesPath(null)}
          >
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-navy"
              aria-expanded={servicesOpen}
              aria-controls={menuId}
              onClick={() => setServicesPath(servicesOpen ? null : pathname)}
            >
              Services
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
            {servicesOpen ? (
              <div
                id={menuId}
                className="panel absolute top-full left-0 grid w-[34rem] grid-cols-2 gap-1 rounded-2xl p-3"
              >
                {serviceCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/services#${category.id}`}
                    className="rounded-xl px-3 py-2 hover:bg-paper"
                  >
                    <span className="block text-sm font-semibold text-navy">{category.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{category.outcome}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-navy hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden min-h-10 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep sm:inline-flex"
          >
            Let&apos;s Talk
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-navy lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpenPath(open ? null : pathname)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <div id={panelId} className="border-t border-line bg-background px-5 py-4 lg:hidden">
          <Link href="/services" className="block py-2 text-base font-semibold text-navy">
            All services
          </Link>
          {serviceCategories.map((category) => (
            <Link key={category.id} href={`/services#${category.id}`} className="block py-2 text-sm text-muted">
              {category.title}
            </Link>
          ))}
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-base font-semibold text-navy">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-navy px-4 text-sm font-semibold text-white">
            Let&apos;s Talk
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function Mark() {
  return (
    <span className="grid size-8 place-items-center rounded-full bg-navy" aria-hidden="true">
      <span className="block h-3 w-3 rounded-sm border-2 border-cyan-soft" />
    </span>
  );
}
