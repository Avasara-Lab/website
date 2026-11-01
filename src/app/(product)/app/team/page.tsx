import { InviteForm } from "@/components/app/client";
import { Empty, PageIntro, Section, StatusBadge } from "@/components/app/ui";
import { formatWhen } from "@/lib/app-labels";
import { readSenderConfig } from "@/lib/mailer";
import { requireOrg } from "@/server/auth/context";
import { canAdminister } from "@/server/domain";
import { teamSnapshot } from "@/server/modules/read/service";

export default async function TeamPage() {
  const context = await requireOrg();
  const data = await teamSnapshot(context.db, context.organizationId);
  const emailConfigured = Boolean(readSenderConfig());
  return (
    <>
      <PageIntro
        eyebrow="Team"
        title="People in this organization"
        text="Roles are owner, administrator, manager, and member. Managers can approve and execute. Members can read."
      />
      {!data.members.length ? <Empty title="No members" text="An organization always starts with its owner. If this list is empty, the membership row is missing." /> : null}
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
      <Section title="Pending invitations" text="An invitation expires on the date shown. The token is stored as a hash, and it grants access only to this organization.">
        {data.pending.length ? (
          <ul className="grid gap-2">
            {data.pending.map((invite) => (
              <li key={invite.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm">
                <span className="font-medium text-navy">{invite.email}</span>
                <span className="flex flex-wrap items-center gap-2 text-muted">
                  <StatusBadge value={invite.role} />
                  <span>{invite.expired ? "Expired" : `Expires ${formatWhen(invite.expiresAt)}`}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="No pending invitations" text="An owner or administrator can invite an administrator, manager, or member." />
        )}
      </Section>
      {canAdminister(context.role) ? (
        <Section
          title="Invite someone"
          text={
            emailConfigured
              ? "Resend sends the invitation when CONTACT_FROM_EMAIL and RESEND_API_KEY are set. The one-time path is still shown here."
              : "RESEND_API_KEY or CONTACT_FROM_EMAIL is not set, so email is not sent. The one-time path is shown after you create the invitation."
          }
        >
          <InviteForm emailConfigured={emailConfigured} />
        </Section>
      ) : (
        <p className="text-sm leading-6 text-muted">Only an owner or administrator can invite someone.</p>
      )}
    </>
  );
}
