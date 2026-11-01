import assert from "node:assert/strict";
import { test } from "node:test";
import { APPROVED_ANSWERS } from "@/server/demo/synthetic-company";
import type { MemoryEventInput } from "@/server/domain";
import { assertAgentTools, planSupportExecution, verifySupportSends } from "@/server/modules/agents/plan";

function event(intent: string, answer: string | null, id: string): MemoryEventInput {
  return {
    id,
    type: "support_conversation",
    occurredAt: new Date("2026-05-01T00:00:00.000Z"),
    title: intent,
    body: intent,
    attributes: { intent, ...(answer ? { approvedAnswer: answer } : {}) },
  };
}

test("support execution uses the observed approved answer and refuses other tools", () => {
  const events = [event("password_reset", APPROVED_ANSWERS.password_reset, "a"), event("password_reset", APPROVED_ANSWERS.password_reset, "b")];
  const plan = planSupportExecution(events);
  assert.equal(plan.sends[0]?.body, APPROVED_ANSWERS.password_reset);
  assert.equal(verifySupportSends(plan, plan.sends).verified, true);
  assert.throws(() => assertAgentTools(["simulated_send", "delete_data"]), /allowlist/);
});

test("conflicting observed answers are not sent", () => {
  const plan = planSupportExecution([
    event("invoice_copy", "Answer A", "a"),
    event("invoice_copy", "Answer B", "b"),
  ]);
  assert.equal(plan.sends.length, 0);
  assert.match(plan.clusters[0]?.skipReason || "", /disagree/);
  assert.equal(verifySupportSends(plan, plan.sends).verified, false);
});
