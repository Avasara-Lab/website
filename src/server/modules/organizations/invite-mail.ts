export const INVITE_EMAIL_NOTES = {
  sent: "The invitation email was accepted for delivery. The one-time link is also shown here if you need to share it directly.",
  not_configured:
    "Email was not sent. Invitation mail is not configured on this server. Share the one-time link below. It is shown only in this response.",
  failed: "The mail provider did not accept the invitation email. Share the one-time link below. It is shown only in this response.",
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
