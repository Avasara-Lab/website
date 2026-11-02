import Link from "next/link";
import { Suspense } from "react";
import { AcceptInvite } from "@/components/app/client";
import { Eyebrow } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Accept invitation",
  description: "Join one Avasara Lab organization in Opportunity Intelligence.",
  path: "/invite",
});

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <section className="mx-auto grid w-full max-w-xl gap-5 px-5 py-16">
      <div>
        <Eyebrow>Opportunity Intelligence</Eyebrow>
        <h1 className="text-4xl font-semibold text-navy">Join this organization</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          This invitation adds you to one workspace. Opportunity Intelligence turns that organization’s operational records into prioritized opportunities and approved agent actions. It does not grant access to any other organization.
        </p>
      </div>
      <div className="panel grid gap-4 rounded-xl p-6">
        <p className="text-sm leading-6 text-muted">Sign in with the invited email, then accept. If you use a different address, the invitation will not match.</p>
        <Suspense fallback={<p className="text-sm text-muted">Loading the invitation…</p>}>
          <InviteToken params={params} />
        </Suspense>
      </div>
      <p className="text-sm text-muted">
        <Link className="font-semibold text-cyan" href="/login">
          Sign in
        </Link>{" "}
        if you already have an account.{" "}
        <Link className="font-semibold text-cyan" href="/register">
          Register
        </Link>{" "}
        if you need one, using the invited email address.
      </p>
    </section>
  );
}

async function InviteToken({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <AcceptInvite token={token} />;
}
