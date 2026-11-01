import { Suspense } from "react";
import { OnboardingForm } from "@/components/app/client";
import { AppShell } from "@/components/app/shell";
import { listMemberships, readSession } from "@/server/auth/context";
import { requireOrg } from "@/server/auth/context";
import { getDb } from "@/server/db/client";
import { unreadCount } from "@/server/modules/read/service";
import { redirect } from "next/navigation";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Loading the workspace…</p>}>
      <Workspace>{children}</Workspace>
    </Suspense>
  );
}

async function Workspace({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session) redirect("/login");
  const memberships = await listMemberships(getDb(), session.user.id);
  if (!memberships.length) {
    return (
      <main id="content" className="mx-auto grid w-full max-w-3xl gap-6 px-5 py-12">
        <header>
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">Organization</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">Create your company workspace</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Data stays inside the organization you create. You will be the owner.</p>
        </header>
        <OnboardingForm />
      </main>
    );
  }
  const context = await requireOrg();
  const unread = await unreadCount(context.db, context.organizationId);
  return (
    <AppShell context={context} unread={unread}>
      {children}
    </AppShell>
  );
}
