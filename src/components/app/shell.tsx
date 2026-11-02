import Link from "next/link";
import { Search } from "lucide-react";
import { OrgSwitcher, SignOutButton } from "@/components/app/client";
import { AppNav, CurrentSection } from "@/components/app/nav";
import { Notice, StatusBadge, secondaryButtonClass } from "@/components/app/ui";
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
      <aside className="border-b border-line bg-background lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-navy">
            Avasara Lab
          </Link>
          <p className="text-xs font-medium text-cyan">Opportunity Intelligence</p>
        </div>
        <div className="px-3 pb-3">
          <ActiveOrganization name={context.organizationName} role={context.role} synthetic={context.synthetic} variant="panel">
            <OrgSwitcher memberships={context.memberships} current={context.organizationId} />
          </ActiveOrganization>
        </div>
        <AppNav unread={unread} />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-background/95 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
            <ActiveOrganization name={context.organizationName} role={context.role} synthetic={context.synthetic} variant="chip" />
            <form action="/app/search" className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-[16rem]">
              <div className="relative min-w-0 flex-1">
                <label className="sr-only" htmlFor="q">
                  Search the workspace
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="q"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="Search signals, opportunities, events"
                  className="min-h-11 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-navy"
                />
              </div>
              <button className={`${secondaryButtonClass} shrink-0`} type="submit">
                Search
              </button>
            </form>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <p className="min-w-0 text-left lg:max-w-52 lg:text-right" title={context.email}>
                <span className="block text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">Signed in</span>
                <span className="block truncate text-sm font-semibold text-navy">{context.name || "Account"}</span>
                <span className="block truncate text-xs text-muted">{context.email}</span>
              </p>
              <SignOutButton className={`${secondaryButtonClass} min-h-11 shrink-0`} />
            </div>
          </div>
          <div className="px-4 pb-3 lg:sr-only">
            <CurrentSection />
          </div>
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

function ActiveOrganization({
  name,
  role,
  synthetic,
  variant,
  children,
}: {
  name: string;
  role: string;
  synthetic: boolean;
  variant: "panel" | "chip";
  children?: React.ReactNode;
}) {
  const demo = synthetic ? (
    <span
      className="inline-flex shrink-0 items-center rounded-full bg-orange-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-orange"
      title="Synthetic demo company. Figures are not customer results."
    >
      Synthetic
    </span>
  ) : null;

  if (variant === "chip") {
    return (
      <div
        className="flex min-w-0 max-w-full items-center gap-2 self-start rounded-lg border border-cyan/40 bg-cyan-soft px-3 py-2"
        title={name}
      >
        <span className="sr-only">Active organization</span>
        <span className="hidden text-[10px] font-semibold tracking-[0.14em] text-cyan uppercase sm:inline">Organization</span>
        <span className="truncate text-sm font-semibold text-navy">{name}</span>
        <StatusBadge value={role} />
        {demo}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan/40 bg-cyan-soft px-3 py-3">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">Active organization</p>
      <p className="mt-1 text-base leading-snug font-semibold tracking-tight break-words text-navy">{name}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-muted">Your role</span>
        <StatusBadge value={role} />
        {demo}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
