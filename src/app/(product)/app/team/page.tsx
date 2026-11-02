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
        text="Everyone listed here belongs to the active organization. A role decides who can invite, upload, approve, and execute."
      />
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["owner", "Full control, including invites, settings, and approvals."],
          ["administrator", "Invites people, edits the profile, and can approve work."],
          ["manager", "Uploads records and can approve or execute. Cannot invite."],
          ["member", "Reviews signals, opportunities, and impact. Cannot approve or upload."],
        ].map(([role, text]) => (
          <div key={role} className="panel rounded-xl px-4 py-3">
            <dt>
              <StatusBadge value={role} />
            </dt>
            <dd className="mt-2 text-xs leading-5 text-muted">{text}</dd>
          </div>
        ))}
      </dl>
      {!data.members.length ? <Empty title="No members yet" text="The owner should appear here. If this list stays empty, ask the person who created the workspace to confirm the membership." /> : null}
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
      <Section title="Pending invitations" text="An invitation expires on the date shown and grants access only to this organization.">
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
              ? "An invitation email is sent when mail is configured. The one-time link is still shown here so you can share it directly."
              : "Invitation email is not configured on this server, so nothing is emailed. Copy the one-time link after you create the invitation."
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
