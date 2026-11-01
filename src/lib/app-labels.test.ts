import assert from "node:assert/strict";
import test from "node:test";
import { formatConfidence, formatWhen, labelize, provenanceHint, toneFor } from "./app-labels";

test("status labels stay readable without changing the stored value", () => {
  assert.equal(labelize("READY_FOR_APPROVAL"), "Ready for approval");
  assert.equal(labelize("needs_configuration"), "Needs configuration");
  assert.equal(labelize("NEW"), "New");
});

test("provenance and status tones stay distinct", () => {
  assert.equal(toneFor("verified"), "blue");
  assert.equal(toneFor("estimate"), "orange");
  assert.equal(toneFor("simulated"), "orange");
  assert.equal(toneFor("FAILED"), "danger");
  assert.equal(toneFor("observed"), "blue");
  assert.equal(toneFor("custom-state"), "neutral");
});

test("confidence is the stored ratio shown as a percent", () => {
  assert.equal(formatConfidence(0.72), "72%");
  assert.equal(formatConfidence(0), "0%");
  assert.equal(formatConfidence(Number.NaN), "—");
});

test("timestamps render in UTC so the evidence trail stays unambiguous", () => {
  assert.equal(formatWhen(new Date("2026-06-15T00:00:00.000Z")), "15 Jun 2026");
  assert.equal(formatWhen(new Date("2026-06-15T15:04:00.000Z"), true), "15 Jun 2026, 15:04 UTC");
});

test("provenance hints describe the existing classifications", () => {
  assert.match(provenanceHint("estimate") ?? "", /assumption/i);
  assert.match(provenanceHint("simulated") ?? "", /simulated inbox/i);
  assert.equal(provenanceHint("not-a-class"), undefined);
});
