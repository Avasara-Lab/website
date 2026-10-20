import { budgetOptions, helpOptions } from "./content";

export const fieldLimits = {
  name: 100,
  email: 254,
  company: 160,
  challenge: 4000,
  honeypot: 200,
} as const;

/** Whole JSON body, kept above the field limits so a normal enquiry fits. */
export const maxBodyBytes = 16_384;

export const deliveryMessages = {
  failed:
    "We could not send your enquiry. Nothing was delivered. You can try again.",
  unavailable:
    "Email delivery is not configured, so this enquiry was not sent.",
  rateLimited:
    "Too many enquiries were sent from this network. Wait a few minutes and try again.",
  tooLarge: "That message is too large to send.",
  network:
    "The enquiry could not reach the server. Check your connection and try again.",
} as const;

const knownMessages = new Set<string>(Object.values(deliveryMessages));

export type EnquiryField = "name" | "email" | "company" | "challenge" | "help" | "budget";

export type FieldErrors = Partial<Record<EnquiryField, string>>;

export type Enquiry = {
  name: string;
  email: string;
  company: string;
  challenge: string;
  help: string;
  helpLabel: string;
  budget: string;
  budgetLabel: string;
};

export type EnquiryParseResult =
  | { ok: true; enquiry: Enquiry }
  | { ok: false; honeypot: true }
  | { ok: false; honeypot?: false; fields: FieldErrors };

const helpLabels = new Map<string, string>(helpOptions.map((option) => [option.value, option.label]));
const budgetLabels = new Map<string, string>(
  budgetOptions.map((option) => [option.value, option.label]),
);

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function isValidEmail(value: string): boolean {
  if (value.length > fieldLimits.email || value.length < 3) return false;
  if (value.includes("..")) return false;
  const [local, domain, extra] = value.split("@");
  if (!local || !domain || extra !== undefined) return false;
  if (local.startsWith(".") || local.endsWith(".") || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }
  return emailPattern.test(value);
}

export function extractEmailAddress(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || /[\u0000-\u001F\u007F]/.test(trimmed)) return null;
  const wrapped = trimmed.match(/^(.*?)<([^<>]+)>$/);
  const address = (wrapped ? wrapped[2] : trimmed).trim();
  if (wrapped && wrapped[1].includes("<")) return null;
  if (!isValidEmail(address)) return null;
  return address;
}

export function parseEnquiry(input: unknown): EnquiryParseResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {
      ok: false,
      fields: {
        name: "Enter your name.",
        email: "Enter a valid work email.",
        company: "Enter your company name.",
        challenge: "Describe the business challenge.",
        help: "Select the type of help you need.",
      },
    };
  }

  const record = input as Record<string, unknown>;
  if (isHoneypotTripped(record.company_website)) {
    return { ok: false, honeypot: true };
  }

  const fields: FieldErrors = {};
  const name = inspectLine(record.name, fieldLimits.name);
  const email = inspectLine(record.email, fieldLimits.email);
  const company = inspectLine(record.company, fieldLimits.company);
  const challenge = inspectChallenge(record.challenge);
  const help = inspectLine(record.help, 40);
  const budgetRaw = record.budget;

  if (!name.ok || name.value.length < 2) {
    fields.name =
      name.ok === false && name.reason === "long"
        ? `Use a name under ${fieldLimits.name} characters.`
        : "Enter your name.";
  }

  const emailValue = email.ok ? email.value.toLowerCase() : "";
  if (!email.ok || !isValidEmail(emailValue)) {
    fields.email = "Enter a valid work email.";
  }

  if (!company.ok || company.value.length < 2) {
    fields.company =
      company.ok === false && company.reason === "long"
        ? `Use a company name under ${fieldLimits.company} characters.`
        : "Enter your company name.";
  }

  if (!challenge.ok || challenge.value.length < 24) {
    fields.challenge =
      challenge.ok === false && challenge.reason === "long"
        ? `Keep the challenge under ${fieldLimits.challenge} characters.`
        : "Describe the business challenge in at least a sentence.";
  }

  if (!help.ok || !helpLabels.has(help.value)) {
    fields.help = "Select the type of help you need.";
  }

  let budget = "";
  if (typeof budgetRaw === "string" && budgetRaw.trim().length > 0) {
    const normalizedBudget = budgetRaw.trim();
    if (!budgetLabels.has(normalizedBudget) || normalizedBudget.length > 40) {
      fields.budget = "Select a budget range, or leave it blank.";
    } else {
      budget = normalizedBudget;
    }
  } else if (budgetRaw !== undefined && budgetRaw !== null && budgetRaw !== "") {
    fields.budget = "Select a budget range, or leave it blank.";
  }

  if (
    Object.keys(fields).length > 0 ||
    !name.ok ||
    !email.ok ||
    !company.ok ||
    !challenge.ok ||
    !help.ok
  ) {
    return { ok: false, fields };
  }

  return {
    ok: true,
    enquiry: {
      name: name.value,
      email: emailValue,
      company: company.value,
      challenge: challenge.value,
      help: help.value,
      helpLabel: helpLabels.get(help.value) as string,
      budget,
      budgetLabel: budget ? (budgetLabels.get(budget) as string) : "Not provided",
    },
  };
}

export function enquirySubject(company: string): string {
  const clean = company.replace(/[\r\n]+/g, " ").slice(0, 80);
  return `Avasara Lab enquiry from ${clean}`;
}

export function enquiryText(enquiry: Enquiry, submittedAt: string): string {
  return [
    "Avasara Lab project enquiry",
    "",
    `Name: ${enquiry.name}`,
    `Work email: ${enquiry.email}`,
    `Company: ${enquiry.company}`,
    `Help requested: ${enquiry.helpLabel}`,
    `Approximate budget: ${enquiry.budgetLabel}`,
    `Submitted: ${submittedAt}`,
    "",
    "Business challenge:",
    enquiry.challenge,
    "",
  ].join("\n");
}

export type DeliveryOutcome =
  | { type: "sent" }
  | { type: "invalid"; fields: FieldErrors }
  | { type: "failed"; message: string };

export function deliveryOutcome(status: number, body: unknown): DeliveryOutcome {
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  if (status >= 200 && status < 300 && record?.delivered === true) {
    return { type: "sent" };
  }
  if (status === 400 && record && isFieldErrors(record.fields)) {
    return { type: "invalid", fields: record.fields };
  }
  const message =
    typeof record?.message === "string" && knownMessages.has(record.message)
      ? record.message
      : deliveryMessages.failed;
  return { type: "failed", message };
}

function isHoneypotTripped(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value !== "string") return true;
  return value.trim().length > 0;
}

function inspectLine(
  value: unknown,
  max: number,
): { ok: true; value: string } | { ok: false; reason: "missing" | "invalid" | "long" } {
  if (typeof value !== "string") return { ok: false, reason: "missing" };
  if (/[\u0000-\u001F\u007F]/.test(value)) return { ok: false, reason: "invalid" };
  const trimmed = value.trim();
  if (trimmed.length > max) return { ok: false, reason: "long" };
  const normalized = trimmed.replace(/\s+/g, " ");
  if (!normalized) return { ok: false, reason: "missing" };
  return { ok: true, value: normalized };
}

function inspectChallenge(
  value: unknown,
): { ok: true; value: string } | { ok: false; reason: "missing" | "invalid" | "long" } {
  if (typeof value !== "string") return { ok: false, reason: "missing" };
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)) {
    return { ok: false, reason: "invalid" };
  }
  if (normalized.length > fieldLimits.challenge) return { ok: false, reason: "long" };
  if (!normalized) return { ok: false, reason: "missing" };
  return { ok: true, value: normalized };
}

function isFieldErrors(value: unknown): value is FieldErrors {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every((item) => typeof item === "string");
}
