"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Decide",
    links: [
      { href: "/app", label: "Overview" },
      { href: "/app/radar", label: "Opportunity Radar" },
      { href: "/app/signals", label: "Signals" },
    ],
  },
  {
    label: "Data",
    links: [
      { href: "/app/connect", label: "Business Connect" },
      { href: "/app/sources", label: "Data sources" },
      { href: "/app/memory", label: "Business Memory" },
    ],
  },
  {
    label: "Act",
    links: [
      { href: "/app/agents", label: "AI agents" },
      { href: "/app/executions", label: "Executions" },
      { href: "/app/impact", label: "Impact" },
    ],
  },
  {
    label: "Workspace",
    links: [
      { href: "/app/notifications", label: "Notifications" },
      { href: "/app/ai", label: "AI configuration" },
      { href: "/app/team", label: "Team" },
      { href: "/app/settings", label: "Settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  if (href === "/app/radar" && pathname.startsWith("/app/opportunities")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Application" className="flex gap-3 overflow-x-auto px-3 pb-3 lg:block lg:overflow-visible lg:px-2 lg:pb-6">
      {groups.map((group) => (
        <div key={group.label} className="flex shrink-0 gap-1 border-l border-line pl-3 first:border-l-0 first:pl-0 lg:mt-1 lg:block lg:border-l-0 lg:pl-0">
          <p className="hidden px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase lg:block">{group.label}</p>
          <div className="flex gap-1 lg:grid lg:gap-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              const count = link.href === "/app/notifications" ? unread : 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-cyan-soft text-navy" : "text-navy hover:bg-mist"}`}
                >
                  <span>{link.label}</span>
                  {count ? (
                    <span className="rounded-full bg-orange-soft px-1.5 py-0.5 text-[10px] font-semibold text-orange tabular-nums">{count}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
