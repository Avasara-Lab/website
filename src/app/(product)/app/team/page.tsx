import { InviteForm } from "@/components/app/client";
import { PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { formatWhen } from "@/lib/app-labels";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { teamSnapshot } from "@/server/modules/read/service";

export default async function TeamPage() {
  const context = await requireOrg();
  const data = await teamSnapshot(context.db, context.organizationId);
  return (
    <>
      <PageIntro
        eyebrow="Team"
        title="People in this organization"
        text="Roles are owner, administrator, manager, and member. Managers can approve and execute. Members can read."
      />
      <ul className="grid gap-2">
        {data.members.map((member) => (
          <li key={member.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
            <div>
              <p className="font-semibold text-navy">{member.name}</p>
              <p className="text-sm text-muted">{member.email}</p>
            </div>
            <StatusBadge value={member.role} />
          </li>
        ))}
      </ul>
      <Section title="Pending invitations" text="An invitation expires on the date shown. It grants access only to this organization.">
        {data.pending.length ? (
          <ul className="grid gap-2">
            {data.pending.map((invite) => (
              <li key={invite.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm">
                <span className="font-medium text-navy">{invite.email}</span>
                <span className="flex flex-wrap items-center gap-2 text-muted">
                  <StatusBadge value={invite.role} />
                  <span>Expires {formatWhen(invite.expiresAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No pending invitations.</p>
        )}
      </Section>
      {canAdminister(context.role) ? (
        <Section title="Invite someone" text="Create a one-time invitation. Email delivery is not configured, so the path is shown after you submit.">
          <InviteForm />
        </Section>
      ) : (
        <p className="text-sm leading-6 text-muted">Only an owner or administrator can invite someone.</p>
      )}
    </>
  );
}
