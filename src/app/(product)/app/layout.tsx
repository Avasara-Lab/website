import { Suspense } from "react";
import { OnboardingForm, SignOutButton } from "@/components/app/client";
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-navy">
            Avasara Lab <span className="font-medium text-cyan">· Opportunity Intelligence</span>
          </p>
          <SignOutButton />
        </div>
        <PageIntro
          eyebrow="Organization"
          title="Create your company workspace"
          text="The name you choose is the active organization in the workspace. Its records stay private to members. You will be the owner and can invite other people after the workspace exists."
        />
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Name the company", "This is the organization shown in the header."],
            ["2", "Upload records", "Business Connect accepts the files you already keep."],
            ["3", "Review the radar", "Signals and opportunities appear after analysis finds a pattern."],
          ].map(([step, title, text]) => (
            <li key={step} className="panel rounded-xl p-4">
              <p className="text-xs font-semibold text-cyan tabular-nums">{step}</p>
              <p className="mt-2 text-sm font-semibold text-navy">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
            </li>
          ))}
        </ol>
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
