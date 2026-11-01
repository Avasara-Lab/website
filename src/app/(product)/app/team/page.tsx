import { InviteForm } from "@/components/app/client";
import { PageIntro } from "@/components/app/ui";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { teamSnapshot } from "@/server/modules/read/service";

export default async function TeamPage() {
  const context = await requireOrg();
  const data = await teamSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro eyebrow="Team" title="People in this organization" text="Roles are owner, administrator, manager, and member. Managers can approve and execute. Members can read." />
      <ul className="grid gap-2 text-sm">
        {data.members.map((member) => <li key={member.id} className="panel rounded-xl p-4"><span className="font-semibold text-navy">{member.name}</span> · {member.email} · {member.role}</li>)}
      </ul>
      <section>
        <h2 className="text-lg font-semibold text-navy">Pending invitations</h2>
        <ul className="mt-2 text-sm text-muted">
          {data.pending.map((invite) => <li key={invite.id}>{invite.email} · {invite.role} · expires {invite.expiresAt.toISOString().slice(0, 10)}</li>)}
          {!data.pending.length ? <li>No pending invitations.</li> : null}
        </ul>
      </section>
      {canAdminister(context.role) ? <InviteForm /> : <p className="text-sm text-muted">Only an owner or administrator can invite someone.</p>}
    </>
  );
}
