import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_COMPANY, DEMO_EMAIL, DEMO_PASSWORD } from "../server/demo/synthetic-company";
import { opportunity } from "./opportunity";

test("the public demo account matches the synthetic seed", () => {
  assert.equal(opportunity.demoEmail, DEMO_EMAIL);
  assert.equal(opportunity.demoPassword, DEMO_PASSWORD);
  assert.equal(opportunity.demoCompany, DEMO_COMPANY);
  assert.equal(opportunity.demoLogin, "/login?next=%2Fapp");
});
