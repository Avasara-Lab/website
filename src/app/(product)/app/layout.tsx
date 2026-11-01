import { Suspense } from "react";
import { OnboardingForm } from "@/components/app/client";
import { AppShell } from "@/components/app/shell";
import { PageIntro } from "@/components/app/ui";
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
        <PageIntro
          eyebrow="Organization"
          title="Create your company workspace"
          text="Data stays inside the organization you create. You will be the owner. You can invite other people after the workspace exists."
        />
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
