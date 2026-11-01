export const ROLES = ["owner", "administrator", "manager", "member"] as const;
export type Role = (typeof ROLES)[number];

export const EVENT_TYPES = [
  "support_conversation",
  "sales_activity",
  "meeting_transcript",
  "operational_record",
  "document",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const PROVENANCE = [
  "observed",
  "interpretation",
  "hypothesis",
  "recommendation",
  "estimate",
  "simulated",
  "verified",
] as const;
export type Provenance = (typeof PROVENANCE)[number];

export const OPPORTUNITY_STATUSES = [
  "NEW",
  "INVESTIGATING",
  "READY_FOR_APPROVAL",
  "APPROVED",
  "REJECTED",
  "EXECUTING",
  "COMPLETED",
  "FAILED",
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const CONNECTOR_TYPES = [
  "upload",
  "hubspot",
  "gmail",
  "slack",
  "notion",
  "clickup",
  "quickbooks",
] as const;
export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

export const WORKFLOW_STEPS = [
  "DETECT",
  "INVESTIGATE",
  "RECOMMEND",
  "REQUEST_APPROVAL",
  "EXECUTE",
  "VERIFY",
  "MEASURE",
] as const;

export const SUPPORT_AGENT_NAME = "Customer Support Automation Agent";

export const SUPPORT_TOOLS = [
  {
    name: "read_support_evidence",
    description: "Read observed support events linked to the approved opportunity.",
  },
  {
    name: "propose_reply",
    description: "Select a reply only from an approved answer that already appears on an observed event.",
  },
  {
    name: "simulated_send",
    description: "Record an outbound reply on the simulated support inbox. This does not contact a customer.",
  },
] as const;

export const FORBIDDEN_TOOLS = ["delete_data", "transfer_funds", "external_send"] as const;

export const PRIORITY_METHOD =
  "score = severity weight (high 30, medium 20, low 10) + min(frequency, 40) + round(confidence × 20) + complexity weight (low 10, medium 5, high 0). 70 or more is high, 45 to 69 is medium, below 45 is low.";

export const MINUTES_PER_REPEATED_REPLY = 6;

export type JsonObject = Record<string, unknown>;

export type NormalizedRecord = {
  type: EventType;
  occurredAt: string;
  title: string;
  body: string;
  externalId?: string;
  attributes: JsonObject;
};

export type MemoryEventInput = {
  id: string;
  type: EventType;
  occurredAt: Date;
  title: string;
  body: string;
  attributes: JsonObject;
};

export type DraftSignal = {
  fingerprint: string;
  category: "repeated_support_question" | "delayed_sales_followup" | "repetitive_reporting";
  title: string;
  description: string;
  frequency: number;
  firstObserved: Date;
  lastObserved: Date;
  departments: string[];
  primaryEventIds: string[];
  supportingEventIds: string[];
  confidence: number;
  severity: "low" | "medium" | "high";
  trend: "up" | "down" | "flat";
  detectionMethod: "deterministic";
  opportunityGroup: "support_automation" | "sales_followup" | "reporting_automation";
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function canWrite(role: Role) {
  return role === "owner" || role === "administrator" || role === "manager";
}

export function canAdminister(role: Role) {
  return role === "owner" || role === "administrator";
}

export function stringAttr(attributes: JsonObject, key: string) {
  const value = attributes[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function boolAttr(attributes: JsonObject, key: string) {
  const value = attributes[key];
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function excerpt(text: string, max = 240) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1)}…`;
}
