import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_AS_OF, GROUND_TRUTH, buildSyntheticRecords } from "@/server/demo/synthetic-company";
import type { MemoryEventInput } from "@/server/domain";
import { detectSignals } from "@/server/modules/signals/detect";

function asEvents(records = buildSyntheticRecords()): MemoryEventInput[] {
  return records.map((record, index) => ({
    id: record.externalId || `event-${index}`,
    type: record.type,
    occurredAt: new Date(record.occurredAt),
    title: record.title,
    body: record.body,
    attributes: record.attributes,
  }));
}

test("deterministic detectors find the synthetic ground truth and ignore the injected instruction", () => {
  const signals = detectSignals(asEvents(), DEMO_AS_OF);
  const byFingerprint = new Map(signals.map((signal) => [signal.fingerprint, signal]));
  assert.equal(byFingerprint.get("repeated_support_question:password_reset")?.frequency, GROUND_TRUTH.repeatedQuestions.password_reset);
  assert.equal(byFingerprint.get("repeated_support_question:invoice_copy")?.frequency, GROUND_TRUTH.repeatedQuestions.invoice_copy);
  assert.equal(byFingerprint.get("repeated_support_question:api_rate_limit")?.frequency, GROUND_TRUTH.repeatedQuestions.api_rate_limit);
  assert.equal(byFingerprint.get("repeated_support_question:workspace_sso")?.frequency, GROUND_TRUTH.repeatedQuestions.workspace_sso);
  assert.equal(byFingerprint.get("delayed_sales_followup:proposal")?.frequency, GROUND_TRUTH.delayedDeals);
  assert.equal(byFingerprint.get("repetitive_reporting:weekly_status_report")?.frequency, GROUND_TRUTH.manualReports);
  assert.equal(signals.every((signal) => signal.detectionMethod === "deterministic"), true);
  assert.equal(signals.some((signal) => signal.fingerprint.includes("one_off")), false);
  assert.equal(signals.some((signal) => signal.description.includes("9999")), false);
  const reporting = byFingerprint.get("repetitive_reporting:weekly_status_report");
  assert.equal(reporting?.supportingEventIds.length, GROUND_TRUTH.meetingsMentioningReports);
});
