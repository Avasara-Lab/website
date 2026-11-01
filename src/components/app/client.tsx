"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { META_MODELS } from "@/server/modules/meta-ai/catalog";
import { controlClass, dangerButtonClass, Notice, primaryButtonClass, secondaryButtonClass } from "@/components/app/ui";

export const authClient = createAuthClient();

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; acceptPath?: string; models?: string[]; blocked?: boolean };
  if (!response.ok) throw new Error(data.error || "The request failed.");
  return data;
}

function Message({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm leading-6 text-danger" role="alert">
      {text}
    </p>
  );
}

function Success({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="rounded-lg bg-cyan-soft px-3 py-2 text-sm leading-6 text-navy" role="status">
      {text}
    </p>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");
    const result = mode === "login"
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name });
    setPending(false);
    if (result.error) {
      setError(result.error.message || "Authentication failed.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel grid max-w-md gap-4 rounded-xl p-6">
      {mode === "register" ? <Field label="Name" name="name" autoComplete="name" hint="Shown to people in your organization." required /> : null}
      <Field label="Email" name="email" type="email" autoComplete="email" hint="Use the address you registered for this workspace." required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        hint="At least 8 characters."
        required
        minLength={8}
      />
      <Message text={error} />
      <button className={primaryButtonClass} disabled={pending} type="submit">
        {pending ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await postJson("/api/app/organizations", {
        name: String(form.get("name") || ""),
        industry: String(form.get("industry") || ""),
        employeeCount: Number(form.get("employeeCount") || 0) || undefined,
        objectives: String(form.get("objectives") || ""),
        departments: String(form.get("departments") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      router.push("/app");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the organization.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel grid max-w-xl gap-4 rounded-xl p-6">
      <Field label="Company name" name="name" hint="This becomes the workspace name. Data stays inside it." required />
      <Field label="Industry" name="industry" hint="Optional. Used as context on the company profile." />
      <Field label="Employee count" name="employeeCount" type="number" min={1} hint="Optional." />
      <label className="grid gap-1.5 text-sm font-medium text-navy">
        Objectives
        <textarea name="objectives" className="min-h-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal" />
        <span className="text-xs leading-5 font-normal text-muted">What this workspace should pay attention to. You can edit it later in Settings.</span>
      </label>
      <Field label="Departments" name="departments" placeholder="Sales, Customer Support, Operations" hint="Comma separated. Used when opportunities are grouped." />
      <Message text={error} />
      <button className={primaryButtonClass} disabled={pending} type="submit">
        {pending ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}

export function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNote(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/app/uploads", { method: "POST", body: form });
    const data = (await response.json().catch(() => ({}))) as { error?: string; status?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Upload failed.");
      return;
    }
    if (data.status === "failed") setError(data.error || "Processing failed.");
    else setNote(data.status ? `Processing status: ${data.status}.` : "Upload received.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel grid gap-3 rounded-xl p-5">
      <label className="grid gap-1.5 text-sm font-medium text-navy" htmlFor="business-file">
        Business file
        <input id="business-file" name="file" type="file" required accept=".csv,.xlsx,.json,.txt,.md,.pdf,.wav" className="text-sm font-normal" />
      </label>
      <p className="text-xs leading-5 text-muted">CSV, XLSX, JSON, TXT, Markdown, PDF, or WAV. Maximum 10 MB. A duplicate file for this organization is rejected.</p>
      <Message text={error} />
      <Success text={note} />
      <button className={primaryButtonClass} disabled={pending} type="submit">
        {pending ? "Processing…" : "Upload and process"}
      </button>
    </form>
  );
}

export function OpportunityActions({
  opportunityId,
  status,
  executable,
  canAct,
  layout = "row",
}: {
  opportunityId: string;
  status: string;
  executable: boolean;
  canAct: boolean;
  layout?: "row" | "stack";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const open = ["NEW", "INVESTIGATING", "READY_FOR_APPROVAL"].includes(status);
  const stacked = layout === "stack";

  async function run(action: string, url = `/api/app/opportunities/${opportunityId}`) {
    setPending(action);
    setError(null);
    try {
      await postJson(url, action === "execute" || action === "create-agent" ? { opportunityId } : { action });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The action failed.");
    } finally {
      setPending(null);
    }
  }

  if (!canAct) return <p className="text-sm leading-6 text-muted">Members can review this opportunity. Approval and execution stay with owners, administrators, and managers.</p>;

  return (
    <div className={stacked ? "grid gap-2" : "flex flex-wrap items-center gap-2"}>
      {status === "NEW" ? <Action label="Mark investigating" pending={pending} block={stacked} onClick={() => run("investigate")} /> : null}
      {status === "NEW" || status === "INVESTIGATING" ? <Action label="Mark ready for approval" pending={pending} block={stacked} onClick={() => run("ready")} /> : null}
      {open ? <Action label="Approve" tone="primary" pending={pending} block={stacked} onClick={() => run("approve")} /> : null}
      {open ? <Action label="Reject" tone="danger" pending={pending} block={stacked} onClick={() => run("reject")} /> : null}
      {executable ? <Action label="Create support agent" pending={pending} block={stacked} onClick={() => run("create-agent", "/api/app/agents")} /> : <p className="text-sm leading-6 text-muted">No executor is configured for this recommendation.</p>}
      {executable && (status === "APPROVED" || status === "FAILED") ? <Action label="Execute simulated workflow" tone="primary" pending={pending} block={stacked} onClick={() => run("execute", "/api/app/execute")} /> : null}
      <Message text={error} />
    </div>
  );
}

export function AgentStatusButton({ agentId, status }: { agentId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const next = status === "active" ? "paused" : "active";
  return (
    <form
      className="grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch("/api/app/agents", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agentId, status: next }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) setError(data.error || "Could not update the agent.");
        else router.refresh();
      }}
    >
      <button className={secondaryButtonClass} type="submit">
        {status === "active" ? "Pause agent" : "Activate agent"}
      </button>
      <Message text={error} />
    </form>
  );
}

export function InviteForm() {
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="panel grid gap-3 rounded-xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setPending(true);
        const form = new FormData(event.currentTarget);
        try {
          const data = await postJson("/api/app/invitations", { email: String(form.get("email")), role: String(form.get("role")) });
          setPath(data.acceptPath ?? null);
        } catch (caught) {
          setPath(null);
          setError(caught instanceof Error ? caught.message : "Could not create the invitation.");
        } finally {
          setPending(false);
        }
      }}
    >
      <Field label="Email" name="email" type="email" autoComplete="email" hint="The person must sign in with this address to accept." required />
      <label className="grid gap-1.5 text-sm font-medium text-navy" htmlFor="invite-role">
        Role
        <select id="invite-role" name="role" className={controlClass} defaultValue="member">
          <option value="administrator">Administrator</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
        <span className="text-xs leading-5 font-normal text-muted">Managers can approve and execute. Members can read. Owners are not invited from this form.</span>
      </label>
      <p className="text-xs leading-5 text-muted">Email delivery is not configured. After you create the invitation, the one-time path is shown here so you can share it.</p>
      <Message text={error} />
      {path ? (
        <p className="rounded-lg bg-cyan-soft px-3 py-2 text-sm leading-6 text-navy" role="status">
          Invitation created. Share this path once: <span className="break-all font-medium">{path}</span>
        </p>
      ) : null}
      <button className={primaryButtonClass} disabled={pending} type="submit">{pending ? "Creating…" : "Create invitation"}</button>
    </form>
  );
}

export function ProfileForm({ companyName, industry, employeeCount, objectives }: { companyName: string; industry: string; employeeCount: number | null; objectives: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="panel grid gap-3 rounded-xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaved(false);
        setPending(true);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/app/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            companyName: String(form.get("companyName") || ""),
            industry: String(form.get("industry") || ""),
            employeeCount: form.get("employeeCount") ? Number(form.get("employeeCount")) : null,
            objectives: String(form.get("objectives") || ""),
          }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        if (!response.ok) setError(data.error || "Could not save the profile.");
        else {
          setError(null);
          setSaved(true);
          router.refresh();
        }
      }}
    >
      <Field label="Company name" name="companyName" defaultValue={companyName} hint="Also updates the workspace name in the sidebar." required />
      <Field label="Industry" name="industry" defaultValue={industry} />
      <Field label="Employee count" name="employeeCount" type="number" defaultValue={employeeCount ? String(employeeCount) : ""} />
      <label className="grid gap-1.5 text-sm font-medium text-navy" htmlFor="objectives">
        Objectives
        <textarea id="objectives" name="objectives" defaultValue={objectives} className="min-h-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-normal" />
      </label>
      <Message text={error} />
      {saved ? <Success text="Profile saved for this organization." /> : null}
      <button className={primaryButtonClass} disabled={pending} type="submit">{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function AiConfigForm({
  reasoningModel,
  investigationModel,
  transcribeModel,
  imageModel,
  keyConfigured,
}: {
  reasoningModel: string;
  investigationModel: string;
  transcribeModel: string;
  imageModel: string;
  keyConfigured: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "ok" | "warning" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div className="grid gap-4">
      <Notice tone={keyConfigured ? "info" : "warning"} title={keyConfigured ? "Server key is set" : "Live Meta calls are paused"}>
        {keyConfigured
          ? "MODEL_API_KEY is set on the server. The key is not shown here, and no other model provider is used."
          : "Set MODEL_API_KEY on the server when you want live calls. Until then, catalog and model requests stay blocked. No other model provider is used."}
      </Notice>
      <form
        className="panel grid gap-3 rounded-xl p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          const form = new FormData(event.currentTarget);
          const response = await fetch("/api/app/ai", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              reasoningModel: String(form.get("reasoningModel")),
              investigationModel: String(form.get("investigationModel")),
              transcribeModel: String(form.get("transcribeModel")),
              imageModel: String(form.get("imageModel")),
            }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setPending(false);
          setMessage(response.ok ? { tone: "ok", text: "Model selection saved." } : { tone: "error", text: data.error || "Could not save." });
          if (response.ok) router.refresh();
        }}
      >
        <ModelSelect label="Reasoning" name="reasoningModel" hint="Muse Spark. Used when a live reasoning call is allowed." values={META_MODELS.reasoning} current={reasoningModel} />
        <ModelSelect label="Investigation" name="investigationModel" hint="Muse Wonder or Muse Spark." values={META_MODELS.investigation} current={investigationModel} />
        <ModelSelect label="Transcription" name="transcribeModel" hint="Used for WAV uploads when the server key is set." values={META_MODELS.transcribe} current={transcribeModel} />
        <ModelSelect label="Images" name="imageModel" values={META_MODELS.image} current={imageModel} />
        <button className={primaryButtonClass} disabled={pending} type="submit">{pending ? "Saving…" : "Save model selection"}</button>
      </form>
      <button
        className={secondaryButtonClass}
        type="button"
        onClick={async () => {
          const response = await fetch("/api/app/ai", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
          const data = (await response.json().catch(() => ({}))) as { error?: string; models?: string[]; blocked?: boolean };
          if (data.blocked) setMessage({ tone: "warning", text: data.error || "Live Meta calls are blocked until MODEL_API_KEY is set on the server." });
          else if (data.models) setMessage({ tone: "ok", text: `Catalog returned ${data.models.length} model ids.` });
          else setMessage({ tone: "error", text: data.error || "The catalog call failed." });
          router.refresh();
        }}
      >
        Test Meta catalog
      </button>
      {message?.tone === "ok" ? <Success text={message.text} /> : null}
      {message?.tone === "warning" ? <Notice tone="warning">{message.text}</Notice> : null}
      {message?.tone === "error" ? <Message text={message.text} /> : null}
    </div>
  );
}

export function MarkNotifications({ ids }: { ids: string[] }) {
  const router = useRouter();
  if (!ids.length) return null;
  return (
    <button
      className={secondaryButtonClass}
      type="button"
      onClick={async () => {
        await postJson("/api/app/notifications", { all: true });
        router.refresh();
      }}
    >
      Mark all read
    </button>
  );
}

export function OrgSwitcher({ memberships, current }: { memberships: { organizationId: string; name: string }[]; current: string }) {
  const router = useRouter();
  if (memberships.length < 2) return null;
  return (
    <label className="grid gap-1.5 text-xs font-medium text-muted" htmlFor="active-organization">
      Organization
      <select
        id="active-organization"
        className={controlClass}
        value={current}
        onChange={async (event) => {
          await postJson("/api/app/organizations/active", { organizationId: event.target.value });
          router.refresh();
        }}
      >
        {memberships.map((item) => (
          <option key={item.organizationId} value={item.organizationId}>{item.name}</option>
        ))}
      </select>
    </label>
  );
}

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          await postJson("/api/app/invitations/accept", { token });
          router.push("/app");
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not accept the invitation.");
          setPending(false);
        }
      }}
    >
      <p className="text-xs leading-5 text-muted">Accepting adds you only to the invited organization.</p>
      <button className={primaryButtonClass} disabled={pending} type="submit">{pending ? "Joining…" : "Accept invitation"}</button>
      <Message text={error} />
    </form>
  );
}

export function AnalyzeButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const response = await fetch("/api/app/analyze", { method: "POST" });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        if (!response.ok) setError(data.error || "Analysis failed.");
        else router.refresh();
      }}
    >
      <button className={secondaryButtonClass} disabled={pending} type="submit">{pending ? "Analyzing…" : "Re-analyze observed events"}</button>
      <Message text={error} />
    </form>
  );
}

function Action({
  label,
  onClick,
  pending,
  tone = "secondary",
  block = false,
}: {
  label: string;
  onClick: () => void;
  pending: string | null;
  tone?: "primary" | "secondary" | "danger";
  block?: boolean;
}) {
  const toneClass = tone === "primary" ? primaryButtonClass : tone === "danger" ? dangerButtonClass : secondaryButtonClass;
  return (
    <button className={`${toneClass} ${block ? "w-full" : ""}`} type="button" disabled={Boolean(pending)} onClick={onClick}>
      {pending ? "Working…" : label}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  min,
  minLength,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  min?: number;
  minLength?: number;
  hint?: string;
  autoComplete?: string;
}) {
  const id = name;
  return (
    <label className="grid gap-1.5 text-sm font-medium text-navy" htmlFor={id}>
      {label}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        minLength={minLength}
        autoComplete={autoComplete}
        className={controlClass}
      />
      {hint ? <span className="text-xs leading-5 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

function ModelSelect({
  label,
  name,
  values,
  current,
  hint,
}: {
  label: string;
  name: string;
  values: readonly string[];
  current: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-navy" htmlFor={name}>
      {label}
      <select id={name} name={name} defaultValue={current || values[0]} className={controlClass}>
        {values.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
      {hint ? <span className="text-xs leading-5 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}
