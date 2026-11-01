import Link from "next/link";
import { OrgSwitcher } from "@/components/app/client";
import type { OrgContext } from "@/server/auth/context";

const links = [
  { href: "/app", label: "Overview" },
  { href: "/app/radar", label: "Opportunity Radar" },
  { href: "/app/signals", label: "Signals" },
  { href: "/app/connect", label: "Business Connect" },
  { href: "/app/sources", label: "Data sources" },
  { href: "/app/memory", label: "Business Memory" },
  { href: "/app/agents", label: "AI agents" },
  { href: "/app/executions", label: "Executions" },
  { href: "/app/impact", label: "Impact" },
  { href: "/app/notifications", label: "Notifications" },
  { href: "/app/ai", label: "AI configuration" },
  { href: "/app/team", label: "Team" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({
  context,
  unread,
  children,
}: {
  context: OrgContext;
  unread: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-paper lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-background lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-navy">Avasara Lab</Link>
          <Link href="/app/notifications" className="text-xs font-semibold text-cyan">{unread ? `${unread} new` : "Alerts"}</Link>
        </div>
        <div className="px-4 pb-4">
          <OrgSwitcher memberships={context.memberships} current={context.organizationId} />
          <p className="mt-3 text-sm font-semibold text-navy">{context.organizationName}</p>
          <p className="text-xs text-muted">{context.role}</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:grid lg:px-3" aria-label="Application">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-mist">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-line bg-background px-4 py-3">
          <form action="/app/search" className="flex flex-1 gap-2">
            <label className="sr-only" htmlFor="q">Search the workspace</label>
            <input id="q" name="q" placeholder="Search signals, opportunities, events" className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm" />
            <button className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold" type="submit">Search</button>
          </form>
          <p className="hidden text-sm text-muted sm:block">{context.email}</p>
        </div>
        <main id="content" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6">
          {context.synthetic ? (
            <p className="rounded-lg bg-orange-soft px-3 py-2 text-sm text-navy">Synthetic demo company. Figures on these screens are not customer results.</p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
