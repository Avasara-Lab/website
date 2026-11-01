export const INVITE_EMAIL_NOTES = {
  sent: "Resend accepted the invitation email. The one-time accept path is also shown in this response.",
  not_configured:
    "RESEND_API_KEY or CONTACT_FROM_EMAIL is not set. Email was not sent. Share this one-time path with the invited person. It is shown only in this response.",
  failed:
    "Resend did not accept the invitation email. Share this one-time path. It is shown only in this response.",
} as const;

export type InviteEmailDelivery = keyof typeof INVITE_EMAIL_NOTES;

export function invitationMessage(input: { organizationName: string; role: string; acceptUrl: string }) {
  const organizationName = input.organizationName.trim() || "your organization";
  return {
    subject: `Invitation to ${organizationName} on Avasara Lab`,
    text: [
      `You are invited to ${organizationName} as ${input.role}.`,
      "The invitation applies only to that organization.",
      "Sign in with this email address, then open the link:",
      input.acceptUrl,
      "The link expires in 7 days. If you were not expecting it, ignore this message.",
    ].join("\n\n"),
  };
}

export function inviteOrigin(env: Record<string, string | undefined> = process.env) {
  const raw = env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "http://localhost:3000";
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:3000";
  }
}
