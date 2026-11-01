import { InviteForm } from "@/components/app/client";
import { Empty, PageIntro } from "@/components/app/ui";
import { readSenderConfig } from "@/lib/mailer";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { teamSnapshot } from "@/server/modules/read/service";

export default async function TeamPage() {
  const context = await requireOrg();
  const data = await teamSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Team" title="People in this organization" text="Roles are owner, administrator, manager, and member. Managers can approve and execute. Members can read." />
      {!data.members.length ? <Empty title="No members" text="An organization always starts with its owner. If this list is empty, the membership row is missing." /> : null}
      <ul className="grid gap-2 text-sm">
        {data.members.map((member) => <li key={member.id} className="panel rounded-xl p-4"><span className="font-semibold text-navy">{member.name}</span> · {member.email} · {member.role}</li>)}
      </ul>
      <section>
        <h2 className="text-lg font-semibold text-navy">Pending invitations</h2>
        {!data.pending.length ? <div className="mt-3"><Empty title="No pending invitations" text="An owner or administrator can invite an administrator, manager, or member. The token is stored as a hash." /></div> : null}
        <ul className="mt-2 text-sm text-muted">
          {data.pending.map((invite) => (
            <li key={invite.id}>{invite.email} · {invite.role} · {invite.expired ? "expired" : `expires ${invite.expiresAt.toISOString().slice(0, 10)}`}</li>
          ))}
        </ul>
      </section>
      {canAdminister(context.role) ? <InviteForm emailConfigured={Boolean(readSenderConfig())} /> : <p className="text-sm text-muted">Only an owner or administrator can invite someone.</p>}
    </>
  );
}
