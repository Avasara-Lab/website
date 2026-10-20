"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { budgetOptions, helpOptions } from "@/lib/content";

type Fields = {
  name: string;
  email: string;
  company: string;
  challenge: string;
  help: string;
  budget: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = {
  name: "",
  email: "",
  company: "",
  challenge: "",
  help: "",
  budget: "",
};

const allowedHelp = new Set<string>(helpOptions.map((option) => option.value));

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (fields.name.trim().length < 2) {
    errors.name = "Enter your name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Enter a valid work email.";
  }
  if (fields.company.trim().length < 2) {
    errors.company = "Enter your company name.";
  }
  if (fields.challenge.trim().length < 24) {
    errors.challenge = "Describe the business challenge in at least a sentence.";
  }
  if (!allowedHelp.has(fields.help)) {
    errors.help = "Select the type of help you need.";
  }
  return errors;
}

function labelFor(value: string, options: readonly { value: string; label: string }[]) {
  return options.find((option) => option.value === value)?.label ?? "Not provided";
}

export function EnquiryForm({ initialHelp = "" }: { initialHelp?: string }) {
  const help = allowedHelp.has(initialHelp) ? initialHelp : "";
  const [fields, setFields] = useState<Fields>({ ...empty, help });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Fields | null>(null);
  const [copied, setCopied] = useState(false);

  const enquiryText = useMemo(() => {
    if (!submitted) return "";
    return [
      "Avasara Lab project enquiry",
      `Name: ${submitted.name.trim()}`,
      `Work email: ${submitted.email.trim()}`,
      `Company: ${submitted.company.trim()}`,
      `Help needed: ${labelFor(submitted.help, helpOptions)}`,
      `Approximate budget: ${
        submitted.budget ? labelFor(submitted.budget, budgetOptions) : "Not provided"
      }`,
      "",
      "Business challenge:",
      submitted.challenge.trim(),
      "",
      "This enquiry was prepared in the browser and was not submitted to Avasara Lab.",
    ].join("\n");
  }, [submitted]);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(null);
      return;
    }
    setCopied(false);
    setSubmitted(fields);
  }

  async function copyEnquiry() {
    try {
      await navigator.clipboard.writeText(enquiryText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-line bg-white p-6 sm:p-8" role="status">
        <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">
          Validated on this device
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-navy">
          Your enquiry is ready to copy.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Nothing was sent. This website has no email delivery or form backend,
          so Avasara Lab does not receive this message.
        </p>
        <pre className="mt-6 overflow-x-auto rounded-lg bg-paper p-4 text-sm leading-6 whitespace-pre-wrap text-ink">
          {enquiryText}
        </pre>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyEnquiry}
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            {copied ? "Copied" : "Copy enquiry"}
          </button>
          <button
            type="button"
            onClick={() => setSubmitted(null)}
            className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-navy/30"
          >
            Edit details
          </button>
        </div>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-xl border border-line bg-white p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          value={fields.name}
          error={errors.name}
          autoComplete="name"
          onChange={(value) => update("name", value)}
        />
        <Field
          id="email"
          label="Work email"
          type="email"
          value={fields.email}
          error={errors.email}
          autoComplete="email"
          onChange={(value) => update("email", value)}
        />
        <Field
          id="company"
          label="Company"
          value={fields.company}
          error={errors.company}
          autoComplete="organization"
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
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          Prepare enquiry
        </button>
        <p className="text-xs leading-5 text-muted">
          Submitting checks the form in your browser. It does not send the enquiry.
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
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
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
