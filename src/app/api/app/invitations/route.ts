import { eq } from "drizzle-orm";
import { z } from "zod";
import { createResendSender, readSenderConfig } from "@/lib/mailer";
import { guard, jsonError } from "@/server/http";
import { organizations } from "@/server/db/schema";
import { writeAudit } from "@/server/modules/audit/service";
import { INVITE_EMAIL_NOTES, invitationMessage, inviteOrigin, type InviteEmailDelivery } from "@/server/modules/organizations/invite-mail";
import { createInvitation } from "@/server/modules/organizations/service";

const bodySchema = z.object({
  email: z.string().trim().email().max(200),
  role: z.enum(["administrator", "manager", "member"]),
});

export async function POST(request: Request) {
  try {
    const context = await guard(request, "admin");
    const body = bodySchema.parse(await request.json());
    const invite = await createInvitation(context.db, {
      organizationId: context.organizationId,
      email: body.email,
      role: body.role,
      createdBy: context.userId,
    });
    const acceptPath = `/invite/${invite.token}`;
    const emailDelivery = await deliverInvitation({
      db: context.db,
      organizationId: context.organizationId,
      email: body.email,
      role: body.role,
      acceptUrl: `${inviteOrigin()}${acceptPath}`,
    });
    await writeAudit(context.db, {
      organizationId: context.organizationId,
      userId: context.userId,
      action: "invitation.created",
      targetType: "invitation",
      targetId: invite.id,
      metadata: { email: body.email.toLowerCase(), role: body.role, emailDelivery },
    });
    return Response.json({
      invitationId: invite.id,
      acceptPath,
      emailDelivery,
      note: INVITE_EMAIL_NOTES[emailDelivery],
    });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: "Enter a valid email and role." }, { status: 400 });
    return jsonError(error);
  }
}

async function deliverInvitation(input: {
  db: Awaited<ReturnType<typeof guard>>["db"];
  organizationId: string;
  email: string;
  role: string;
  acceptUrl: string;
}): Promise<InviteEmailDelivery> {
  const config = readSenderConfig();
  if (!config) return "not_configured";
  const [organization] = await input.db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, input.organizationId))
    .limit(1);
  const message = invitationMessage({
    organizationName: organization?.name ?? "your organization",
    role: input.role,
    acceptUrl: input.acceptUrl,
  });
  try {
    const result = await createResendSender(config).send({ to: input.email, subject: message.subject, text: message.text });
    if (!result.id) return "failed";
    return "sent";
  } catch (error) {
    console.error("Invitation email was not accepted.", error instanceof Error ? error.message : "Resend request failed.");
    return "failed";
  }
}
