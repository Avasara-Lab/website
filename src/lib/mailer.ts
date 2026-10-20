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

type ResendLike = {
  emails: {
    send: (payload: {
      from: string;
      to: string[];
      replyTo: string;
      subject: string;
      text: string;
    }) => Promise<{
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

export function createResendMailer(config: MailConfig, client?: ResendLike): Mailer {
  const resend = client ?? new Resend(config.apiKey);
  return {
    async send(enquiry, submittedAt) {
      const { data, error } = await resend.emails.send({
        from: config.from,
        to: [config.to],
        replyTo: enquiry.email,
        subject: enquirySubject(enquiry.company),
        text: enquiryText(enquiry, submittedAt),
      });
      if (error || !data?.id) {
        throw new Error(error?.message ?? "Resend did not return a message id");
      }
      return { id: data.id };
    },
  };
}
