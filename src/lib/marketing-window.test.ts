import assert from "node:assert/strict";
import test from "node:test";
import { MARKETING_RETURNS_AT, marketingSiteVisible } from "./marketing-window";

const at = Date.parse(MARKETING_RETURNS_AT);

test("the marketing site stays hidden until 16 November 2026 UTC", () => {
  assert.equal(marketingSiteVisible(at - 1, undefined, false), false);
  assert.equal(marketingSiteVisible(Date.parse("2026-11-15T23:59:59.999Z"), undefined, false), false);
  assert.equal(marketingSiteVisible(at, undefined, false), true);
  assert.equal(marketingSiteVisible(Date.parse("2026-11-16T00:00:01.000Z"), undefined, false), true);
});

test("MARKETING_SITE and the code flag override the date", () => {
  assert.equal(marketingSiteVisible(at - 1, "on", false), true);
  assert.equal(marketingSiteVisible(at - 1, " TRUE ", false), true);
  assert.equal(marketingSiteVisible(at + 1, "off", false), false);
  assert.equal(marketingSiteVisible(at + 1, "0", false), false);
  assert.equal(marketingSiteVisible(at - 1, undefined, true), true);
  assert.equal(marketingSiteVisible(at - 1, "nope", false), false);
});
