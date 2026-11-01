import Link from "next/link";
import { Search } from "lucide-react";
import { OrgSwitcher } from "@/components/app/client";
import { AppNav } from "@/components/app/nav";
import { Notice, StatusBadge } from "@/components/app/ui";
import type { OrgContext } from "@/server/auth/context";

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
    <div className="min-h-full bg-paper lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-background lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-navy">
            Avasara Lab
          </Link>
          <p className="text-xs text-muted">Opportunity Intelligence</p>
        </div>
        <div className="px-4 pb-3">
          <OrgSwitcher memberships={context.memberships} current={context.organizationId} />
          <p className="mt-3 text-sm font-semibold text-navy">{context.organizationName}</p>
          <div className="mt-1">
            <StatusBadge value={context.role} />
          </div>
        </div>
        <AppNav unread={unread} />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-background/95 px-4 py-3 backdrop-blur-sm">
          <form action="/app/search" className="flex items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <label className="sr-only" htmlFor="q">
                Search the workspace
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="q"
                name="q"
                placeholder="Search signals, opportunities, events"
                className="min-h-10 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-navy"
              />
            </div>
            <button className="sr-only" type="submit">
              Search
            </button>
            <p className="hidden max-w-56 truncate text-sm text-muted md:block" title={context.email}>
              {context.email}
            </p>
          </form>
        </header>
        <main id="content" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6">
          {context.synthetic ? (
            <Notice tone="warning" title="Synthetic demo company">
              Figures on these screens are not customer results.
            </Notice>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
