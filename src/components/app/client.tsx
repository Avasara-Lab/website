"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { META_CAPABILITIES, META_MODELS } from "@/server/modules/meta-ai/catalog";

export const authClient = createAuthClient();

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    acceptPath?: string;
    note?: string;
    emailDelivery?: "sent" | "not_configured" | "failed";
    models?: string[];
    blocked?: boolean;
  };
  if (!response.ok) throw new Error(data.error || "The request failed.");
  return data;
}

function Message({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="text-sm text-danger" role="alert">{text}</p>;
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
      {mode === "register" ? <Field label="Name" name="name" required /> : null}
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required minLength={8} />
      <Message text={error} />
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={pending} type="submit">
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
      <Field label="Company name" name="name" required />
      <Field label="Industry" name="industry" />
      <Field label="Employee count" name="employeeCount" type="number" min={1} />
      <label className="grid gap-1 text-sm font-semibold text-navy">
        Objectives
        <textarea name="objectives" className="min-h-24 rounded-lg border border-line bg-surface px-3 py-2 font-normal" />
      </label>
      <Field label="Departments, comma separated" name="departments" placeholder="Sales, Customer Support, Operations" />
      <Message text={error} />
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={pending} type="submit">
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
    setNote(data.status === "failed" ? data.error || "Processing failed." : `Processing status: ${data.status}.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="panel grid gap-3 rounded-xl p-5">
      <label className="grid gap-1 text-sm font-semibold text-navy">
        Business file
        <input name="file" type="file" required accept=".csv,.xlsx,.json,.txt,.md,.pdf,.wav" className="font-normal" />
      </label>
      <p className="text-xs leading-5 text-muted">CSV, XLSX, JSON, TXT, Markdown, PDF, or WAV. Maximum 10 MB. A duplicate file for this organization is rejected.</p>
      <Message text={error} />
      {note ? <p className="text-sm text-navy">{note}</p> : null}
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={pending} type="submit">
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
}: {
  opportunityId: string;
  status: string;
  executable: boolean;
  canAct: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const open = ["NEW", "INVESTIGATING", "READY_FOR_APPROVAL"].includes(status);

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

  if (!canAct) return <p className="text-sm text-muted">Members can review this opportunity. Approval and execution stay with owners, administrators, and managers.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "NEW" ? <Action label="Mark investigating" pending={pending} onClick={() => run("investigate")} /> : null}
      {status === "NEW" || status === "INVESTIGATING" ? <Action label="Mark ready for approval" pending={pending} onClick={() => run("ready")} /> : null}
      {open ? <Action label="Approve" pending={pending} onClick={() => run("approve")} /> : null}
      {open ? <Action label="Reject" pending={pending} onClick={() => run("reject")} /> : null}
      {executable ? <Action label="Create support agent" pending={pending} onClick={() => run("create-agent", "/api/app/agents")} /> : <p className="text-sm text-muted">No executor is configured for this recommendation.</p>}
      {executable && (status === "APPROVED" || status === "FAILED") ? <Action label="Execute simulated workflow" pending={pending} onClick={() => run("execute", "/api/app/execute")} /> : null}
      <Message text={error} />
    </div>
  );
}

export function AgentStatusButton({ agentId, status }: { agentId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = status === "active" ? "paused" : "active";
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const response = await fetch("/api/app/agents", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agentId, status: next }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setPending(false);
        if (!response.ok) setError(data.error || "Could not update the agent.");
        else router.refresh();
      }}
    >
      <button className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold" disabled={pending} type="submit">
        {pending ? "Updating…" : status === "active" ? "Pause agent" : "Activate agent"}
      </button>
      <Message text={error} />
    </form>
  );
}

export function InviteForm({ emailConfigured }: { emailConfigured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="panel grid gap-3 rounded-xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setNote(null);
        setPath(null);
        setPending(true);
        const form = new FormData(event.currentTarget);
        try {
          const data = await postJson("/api/app/invitations", { email: String(form.get("email")), role: String(form.get("role")) });
          setPath(data.acceptPath ?? null);
          setNote(data.note ?? null);
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Could not create the invitation.");
        } finally {
          setPending(false);
        }
      }}
    >
      <Field label="Email" name="email" type="email" required />
      <label className="grid gap-1 text-sm font-semibold text-navy">
        Role
        <select name="role" className="min-h-11 rounded-lg border border-line bg-surface px-3 font-normal" defaultValue="member">
          <option value="administrator">Administrator</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
      </label>
      <p className="text-xs leading-5 text-muted">
        {emailConfigured
          ? "Resend sends the invitation from CONTACT_FROM_EMAIL when that sender and RESEND_API_KEY are set. The one-time path is still shown here."
          : "RESEND_API_KEY or CONTACT_FROM_EMAIL is not set, so email is not sent. The one-time path is shown after you create the invitation."}
      </p>
      <Message text={error} />
      {note ? <p className="text-sm text-navy">{note}</p> : null}
      {path ? <p className="break-all text-sm text-navy">One-time path: {path}</p> : null}
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create invitation"}
      </button>
    </form>
  );
}

export function ProfileForm({ companyName, industry, employeeCount, objectives }: { companyName: string; industry: string; employeeCount: number | null; objectives: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="panel grid gap-3 rounded-xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setSaved(false);
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
        if (!response.ok) setError(data.error || "Could not save the profile.");
        else {
          setError(null);
          setSaved(true);
          router.refresh();
        }
      }}
    >
      <Field label="Company name" name="companyName" defaultValue={companyName} required />
      <Field label="Industry" name="industry" defaultValue={industry} />
      <Field label="Employee count" name="employeeCount" type="number" defaultValue={employeeCount ? String(employeeCount) : ""} />
      <label className="grid gap-1 text-sm font-semibold text-navy">
        Objectives
        <textarea name="objectives" defaultValue={objectives} className="min-h-24 rounded-lg border border-line bg-surface px-3 py-2 font-normal" />
      </label>
      <Message text={error} />
      {saved ? <p className="text-sm text-navy">Profile saved.</p> : null}
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" type="submit">Save profile</button>
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
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  return (
    <div className="grid gap-4">
      <p className={`rounded-lg px-3 py-2 text-sm ${keyConfigured ? "bg-cyan-soft text-navy" : "bg-orange-soft text-navy"}`}>
        {keyConfigured
          ? "MODEL_API_KEY is set on the server. The key is not shown here. Calls use https://api.meta.ai/v1 only."
          : "Live Meta calls are blocked. MODEL_API_KEY is empty. No other model provider is used."}
      </p>
      <ul className="grid gap-3">
        {META_CAPABILITIES.map((item) => (
          <li key={item.key} className="panel rounded-xl p-4 text-sm">
            <p className="font-semibold text-navy">{item.label}</p>
            <p className="text-muted">{item.endpoint}</p>
            <p className="mt-1 text-navy">{item.purpose}</p>
            <p className="mt-1 text-muted">{item.note}</p>
          </li>
        ))}
      </ul>
      <form
        className="panel grid gap-3 rounded-xl p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending("save");
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
          setMessage(response.ok ? "Model selection saved." : data.error || "Could not save.");
          setPending(null);
          if (response.ok) router.refresh();
        }}
      >
        <ModelSelect label="Reasoning (Muse Spark, chat completions)" name="reasoningModel" values={META_MODELS.reasoning} current={reasoningModel} />
        <ModelSelect label="Investigation (Muse Wonder or Muse Spark, responses)" name="investigationModel" values={META_MODELS.investigation} current={investigationModel} />
        <ModelSelect label="Transcription (Muse Voice, file endpoint)" name="transcribeModel" values={META_MODELS.transcribe} current={transcribeModel} />
        <ModelSelect label="Images (Muse Image, generations)" name="imageModel" values={META_MODELS.image} current={imageModel} />
        <p className="text-xs leading-5 text-muted">Choosing a model id that ends in -contributor opts that organization into Contributor mode for those calls.</p>
        <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={Boolean(pending)} type="submit">
          {pending === "save" ? "Saving…" : "Save model selection"}
        </button>
      </form>
      <button
        className="min-h-11 rounded-lg border border-line px-4 text-sm font-semibold"
        type="button"
        disabled={Boolean(pending)}
        onClick={async () => {
          setPending("catalog");
          const response = await fetch("/api/app/ai", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
          const data = (await response.json().catch(() => ({}))) as { error?: string; models?: string[]; blocked?: boolean };
          if (data.blocked) setMessage(data.error || "Live Meta calls are blocked.");
          else if (data.models) setMessage(`Catalog returned ${data.models.length} model ids.`);
          else setMessage(data.error || "The catalog call failed.");
          setPending(null);
          router.refresh();
        }}
      >
        {pending === "catalog" ? "Checking…" : "Test Meta catalog"}
      </button>
      {message ? <p className="text-sm text-navy">{message}</p> : null}
    </div>
  );
}

export function MarkNotifications({ ids }: { ids: string[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!ids.length) return null;
  return (
    <div className="grid gap-2">
      <button
        className="min-h-10 w-fit rounded-lg border border-line px-3 text-sm font-semibold"
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            await postJson("/api/app/notifications", { all: true });
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not mark notifications read.");
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Updating…" : "Mark all read"}
      </button>
      <Message text={error} />
    </div>
  );
}

export function OrgSwitcher({ memberships, current }: { memberships: { organizationId: string; name: string }[]; current: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  if (memberships.length < 2) return null;
  return (
    <label className="grid gap-1 text-xs font-semibold tracking-wide text-muted uppercase">
      Organization
      <select
        className="min-h-10 rounded-lg border border-line bg-surface px-2 text-sm font-normal text-navy normal-case"
        value={current}
        onChange={async (event) => {
          setError(null);
          try {
            await postJson("/api/app/organizations/active", { organizationId: event.target.value });
            router.refresh();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not switch organization.");
          }
        }}
      >
        {memberships.map((item) => (
          <option key={item.organizationId} value={item.organizationId}>{item.name}</option>
        ))}
      </select>
      <Message text={error} />
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
        setError(null);
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
      <button className="min-h-11 rounded-lg bg-btn px-4 text-sm font-semibold text-on-btn" disabled={pending} type="submit">
        {pending ? "Accepting…" : "Accept invitation"}
      </button>
      <Message text={error} />
    </form>
  );
}

export function InterpretButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div className="grid gap-2">
      <button
        className="min-h-10 w-fit rounded-lg border border-line px-3 text-sm font-semibold"
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage(null);
          const response = await fetch("/api/app/ai", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "interpret", opportunityId }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string; blocked?: boolean; ok?: boolean };
          if (data.blocked) setMessage(data.error || "Live Meta calls are blocked.");
          else if (!response.ok || data.ok === false) setMessage(data.error || "The interpretation was not stored.");
          else {
            setMessage("Interpretation stored. It is labeled as an interpretation and is not evidence.");
            router.refresh();
          }
          setPending(false);
        }}
      >
        {pending ? "Asking Muse Spark…" : "Ask Muse Spark to interpret this evidence"}
      </button>
      {message ? <p className="text-sm text-navy">{message}</p> : null}
    </div>
  );
}

export function AnalyzeButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
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
      <button className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold" disabled={pending} type="submit">
        {pending ? "Analyzing…" : "Re-analyze observed events"}
      </button>
      <Message text={error} />
    </form>
  );
}

function Action({ label, onClick, pending }: { label: string; onClick: () => void; pending: string | null }) {
  return (
    <button className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold" type="button" disabled={Boolean(pending)} onClick={onClick}>
      {pending ? "Working…" : label}
    </button>
  );
}

function Field({ label, name, type = "text", required, defaultValue, placeholder, min, minLength }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string; min?: number; minLength?: number }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-navy">
      {label}
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} min={min} minLength={minLength} className="min-h-11 rounded-lg border border-line bg-surface px-3 font-normal" />
    </label>
  );
}

function ModelSelect({ label, name, values, current }: { label: string; name: string; values: readonly string[]; current: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-navy">
      {label}
      <select name={name} defaultValue={current || values[0]} className="min-h-11 rounded-lg border border-line bg-surface px-3 font-normal">
        {values.map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
    </label>
  );
}
