export type BadgeTone = "neutral" | "blue" | "orange" | "danger";

const TONES: Record<string, BadgeTone> = {
  new: "blue",
  investigating: "orange",
  ready_for_approval: "orange",
  approved: "blue",
  rejected: "danger",
  executing: "orange",
  completed: "blue",
  failed: "danger",
  high: "orange",
  medium: "neutral",
  low: "neutral",
  active: "blue",
  paused: "neutral",
  observed: "blue",
  estimate: "orange",
  simulated: "orange",
  verified: "blue",
  interpretation: "neutral",
  hypothesis: "neutral",
  recommendation: "blue",
  unread: "orange",
  read: "neutral",
  ready: "blue",
  pending: "orange",
  processing: "orange",
  needs_configuration: "orange",
  deterministic: "blue",
  owner: "blue",
  administrator: "blue",
  manager: "neutral",
  member: "neutral",
};

const PROVENANCE_HINTS: Record<string, string> = {
  observed: "Counted from stored records in this organization.",
  estimate: "Uses a stated assumption. Not a measured time study.",
  simulated: "Recorded on the simulated inbox. Not a live customer channel.",
  verified: "Checked against an observed approved answer.",
  interpretation: "Derived text. Excluded from signal counts.",
  hypothesis: "A possible reading, not an observed count.",
  recommendation: "A suggested next step, not a completed result.",
};

export function labelize(value: string) {
  const cleaned = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!cleaned) return value;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function toneFor(value: string): BadgeTone {
  return TONES[value.trim().toLowerCase()] ?? "neutral";
}

export function provenanceHint(value: string) {
  return PROVENANCE_HINTS[value.trim().toLowerCase()];
}

export function formatConfidence(value: number) {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatWhen(date: Date, withTime = false) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } : {}),
  }).format(date);
  return withTime ? `${formatted} UTC` : formatted;
}
