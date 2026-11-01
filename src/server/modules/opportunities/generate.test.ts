import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_AS_OF, buildSyntheticRecords } from "@/server/demo/synthetic-company";
import type { MemoryEventInput } from "@/server/domain";
import { buildOpportunities, scoreOpportunity } from "@/server/modules/opportunities/generate";
import { detectSignals } from "@/server/modules/signals/detect";

test("opportunities cite only detected signals and publish the priority method", () => {
  const events: MemoryEventInput[] = buildSyntheticRecords().map((record, index) => ({
    id: record.externalId || String(index),
    type: record.type,
    occurredAt: new Date(record.occurredAt),
    title: record.title,
    body: record.body,
    attributes: record.attributes,
  }));
  const signals = detectSignals(events, DEMO_AS_OF);
  const opportunities = buildOpportunities(signals);
  const support = opportunities.find((item) => item.sourceKey === "support_automation");
  assert.ok(support);
  assert.equal(support.executable, true);
  assert.equal(support.signalFingerprints.length, 4);
  assert.match(support.impactSummary, /assumption/i);
  assert.match(support.priorityMethod, /severity weight/);
  const sales = opportunities.find((item) => item.sourceKey === "sales_followup");
  assert.equal(sales?.executable, false);
  const scored = scoreOpportunity({ frequency: 10, severity: "low", confidence: 0.5, complexity: "high" });
  assert.equal(scored.priority, "low");
});
