import { Suspense } from "react";
import { AcceptInvite } from "@/components/app/client";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Accept invitation",
  description: "Join an Avasara Lab organization with an invitation.",
  path: "/invite",
});

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <section className="mx-auto grid w-full max-w-xl gap-4 px-5 py-16">
      <h1 className="text-4xl font-semibold text-navy">Accept invitation</h1>
      <p className="text-sm leading-6 text-muted">Sign in with the invited email, then accept. The invitation does not grant access to any other organization.</p>
      <Suspense fallback={<p className="text-sm text-muted">Loading the invitation…</p>}>
        <InviteToken params={params} />
      </Suspense>
    </section>
  );
}

async function InviteToken({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <AcceptInvite token={token} />;
}
