"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { ServiceIcon } from "@/components/service-icon";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-navy">
          <Mark />
          <span className="text-lg font-semibold tracking-tight">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setServicesPath(pathname)}
            onMouseLeave={() => setServicesPath(null)}
          >
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-navy"
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
                className="panel absolute top-full left-0 grid w-[36rem] grid-cols-2 gap-1 rounded-xl p-3"
              >
                {serviceCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/services#${category.id}`}
                    className="rounded-lg px-3 py-2 hover:bg-paper"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                      <ServiceIcon id={category.id} />
                      {category.title}
                    </span>
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
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy lg:inline-flex">
            Sign in
          </Link>
          <Link
            href="/contact"
            className="hidden min-h-10 items-center rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn hover:bg-btn-hover lg:inline-flex"
          >
            Discuss Your Project
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-line text-navy lg:hidden"
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
        <div id={panelId} className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-background px-5 py-4 lg:hidden">
          <Link href="/services" className="block py-2 text-base font-semibold text-navy">
            All services
          </Link>
          {serviceCategories.map((category) => (
            <Link key={category.id} href={`/services#${category.id}`} className="flex items-center gap-2 py-2 text-sm text-muted">
              <ServiceIcon id={category.id} />
              {category.title}
            </Link>
          ))}
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="block py-2 text-base font-semibold text-navy">
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="mt-3 block py-2 text-base font-semibold text-navy">
            Sign in
          </Link>
          <Link href="/contact" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn">
            Discuss Your Project
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function Mark() {
  return (
    <span className="grid size-8 place-items-center rounded-md bg-btn" aria-hidden="true">
      <span className="block size-2.5 rounded-[2px] bg-cyan" />
    </span>
  );
}
