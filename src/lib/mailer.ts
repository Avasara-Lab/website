import { Resend } from "resend";
import {
  enquirySubject,
  enquiryText,
  extractEmailAddress,
  type Enquiry,
} from "./enquiry";

export type MailConfig = {
  apiKey: string;
  to: string;
  from: string;
};

export type Mailer = {
  send(enquiry: Enquiry, submittedAt: string): Promise<{ id: string }>;
};

export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type ResendSender = {
  send(message: OutboundEmail): Promise<{ id: string }>;
};

type ResendPayload = {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  text: string;
};

type ResendLike = {
  emails: {
    send: (payload: ResendPayload) => Promise<{
      data: { id: string } | null;
      error: { message: string } | null;
    }>;
  };
};

export function readMailConfig(
  env: Record<string, string | undefined> = process.env,
): MailConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const to = env.CONTACT_TO_EMAIL?.trim() ?? "";
  const from = env.CONTACT_FROM_EMAIL?.trim() ?? "";
  if (!apiKey || apiKey.length > 200) return null;
  if (!to || to.includes(",") || !extractEmailAddress(to) || to !== extractEmailAddress(to)) {
    return null;
  }
  if (!from || from.includes(",") || !extractEmailAddress(from)) return null;
  return { apiKey, to, from };
}

/** Sender for mail that is not a contact enquiry. `CONTACT_TO_EMAIL` is not required. */
export function readSenderConfig(
  env: Record<string, string | undefined> = process.env,
): { apiKey: string; from: string } | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.CONTACT_FROM_EMAIL?.trim() ?? "";
  if (!apiKey || apiKey.length > 200) return null;
  if (!from || from.includes(",") || !extractEmailAddress(from)) return null;
  return { apiKey, from };
}

export function createResendSender(
  config: { apiKey: string; from: string },
  client?: ResendLike,
): ResendSender {
  const resend = client ?? new Resend(config.apiKey);
  return {
    async send(message) {
      const to = extractEmailAddress(message.to);
      if (!to || message.to.includes(",") || message.to.trim() !== to) {
        throw new Error("The recipient must be a single email address.");
      }
      const payload: ResendPayload = {
        from: config.from,
        to: [to],
        subject: message.subject,
        text: message.text,
      };
      if (message.replyTo) payload.replyTo = message.replyTo;
      const { data, error } = await resend.emails.send(payload);
      if (error || !data?.id) {
        throw new Error(error?.message ?? "Resend did not return a message id");
      }
      return { id: data.id };
    },
  };
}

export function createResendMailer(config: MailConfig, client?: ResendLike): Mailer {
  const sender = createResendSender(config, client);
  return {
    async send(enquiry, submittedAt) {
      return sender.send({
        to: config.to,
        replyTo: enquiry.email,
        subject: enquirySubject(enquiry.company),
        text: enquiryText(enquiry, submittedAt),
      });
    },
  };
}
