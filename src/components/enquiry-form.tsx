"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { budgetOptions, helpOptions } from "@/lib/content";
import {
  deliveryMessages,
  deliveryOutcome,
  fieldLimits,
  parseEnquiry,
  type FieldErrors,
} from "@/lib/enquiry";

type Fields = {
  name: string;
  email: string;
  company: string;
  challenge: string;
  help: string;
  budget: string;
};

type Status = "idle" | "submitting" | "sent" | "failed";

const empty: Fields = {
  name: "",
  email: "",
  company: "",
  challenge: "",
  help: "",
  budget: "",
};

const allowedHelp = new Set<string>(helpOptions.map((option) => option.value));

export function EnquiryForm({ initialHelp = "" }: { initialHelp?: string }) {
  const help = allowedHelp.has(initialHelp) ? initialHelp : "";
  const [fields, setFields] = useState<Fields>({ ...empty, help });
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failureMessage, setFailureMessage] = useState<string>(deliveryMessages.failed);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (status === "failed") setStatus("idle");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const parsed = parseEnquiry({ ...fields, company_website: companyWebsite });
    if (!parsed.ok && parsed.honeypot) {
      setStatus("failed");
      setFailureMessage(deliveryMessages.failed);
      return;
    }
    if (!parsed.ok) {
      setErrors(parsed.fields);
      setStatus("idle");
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...fields, company_website: companyWebsite }),
      });
      const body: unknown = await response.json().catch(() => null);
      const outcome = deliveryOutcome(response.status, body);
      if (outcome.type === "sent") {
        setStatus("sent");
        return;
      }
      if (outcome.type === "invalid") {
        setErrors(outcome.fields);
        setStatus("idle");
        return;
      }
      setFailureMessage(outcome.message);
      setStatus("failed");
    } catch {
      setFailureMessage(deliveryMessages.network);
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-line bg-white p-6 sm:p-8" role="status">
        <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">
          Delivered
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-navy">
          Your enquiry has been sent.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          The email service accepted the message for the Avasara Lab inbox.
          Replies will use {fields.email.trim()}.
        </p>
        <button
          type="button"
          onClick={() => {
            setFields({ ...empty, help });
            setCompanyWebsite("");
            setStatus("idle");
          }}
          className="mt-6 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy/30"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === "submitting"}
      className="relative rounded-xl border border-line bg-white p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          value={fields.name}
          error={errors.name}
          autoComplete="name"
          maxLength={fieldLimits.name}
          onChange={(value) => update("name", value)}
        />
        <Field
          id="email"
          label="Work email"
          type="email"
          value={fields.email}
          error={errors.email}
          autoComplete="email"
          maxLength={fieldLimits.email}
          onChange={(value) => update("email", value)}
        />
        <Field
          id="company"
          label="Company"
          value={fields.company}
          error={errors.company}
          autoComplete="organization"
          maxLength={fieldLimits.company}
          onChange={(value) => update("company", value)}
        />
        <SelectField
          id="help"
          label="Type of help needed"
          value={fields.help}
          error={errors.help}
          placeholder="Select one"
          options={helpOptions}
          onChange={(value) => update("help", value)}
        />
      </div>
      <div className="mt-5">
        <label htmlFor="challenge" className="text-sm font-medium text-navy">
          Business challenge
        </label>
        <textarea
          id="challenge"
          name="challenge"
          required
          rows={6}
          maxLength={fieldLimits.challenge}
          value={fields.challenge}
          aria-invalid={errors.challenge ? true : undefined}
          aria-describedby={errors.challenge ? "challenge-error" : undefined}
          onChange={(event) => update("challenge", event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-3 text-sm leading-6 text-ink outline-none focus:border-navy"
        />
        {errors.challenge ? (
          <p id="challenge-error" className="mt-2 text-sm text-[#8f1d34]">
            {errors.challenge}
          </p>
        ) : null}
      </div>
      <div className="mt-5 sm:max-w-xs">
        <SelectField
          id="budget"
          label="Approximate budget (optional)"
          value={fields.budget}
          placeholder="Leave blank if unknown"
          options={budgetOptions}
          onChange={(value) => update("budget", value)}
        />
      </div>
      {errorCount > 0 ? (
        <p className="mt-5 text-sm text-[#8f1d34]" role="alert">
          Check the highlighted fields before continuing.
        </p>
      ) : null}
      {status === "failed" ? (
        <p className="mt-5 text-sm text-[#8f1d34]" role="alert">
          {failureMessage}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Sending enquiry" : "Send enquiry"}
        </button>
        <p className="text-xs leading-5 text-muted" aria-live="polite">
          {status === "submitting"
            ? "Sending. Please wait before trying again."
            : "You will see a confirmation only after the email is accepted."}
        </p>
      </div>
    </form>
  );
}

export function EnquiryFormGate() {
  const requested = useSearchParams().get("help") ?? "";
  return <EnquiryForm key={requested} initialHelp={requested} />;
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  autoComplete,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-navy">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-navy"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#8f1d34]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  error,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-navy">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-navy"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-[#8f1d34]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
