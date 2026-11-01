import assert from "node:assert/strict";
import { test } from "node:test";
import { seedRefusal } from "@/server/demo/seed-guard";

const local = {
  NODE_ENV: "development",
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "https://avasaralab.com",
  DATABASE_URL: "postgres://avasara:avasara@127.0.0.1:5432/avasara",
};

test("the demo seed is allowed on a local database", () => {
  assert.equal(seedRefusal(local), null);
});

test("the demo seed refuses production", () => {
  assert.match(seedRefusal({ ...local, NODE_ENV: "production" }) ?? "", /NODE_ENV is production/);
  assert.match(seedRefusal({ ...local, BETTER_AUTH_URL: "https://avasaralab.com" }) ?? "", /production origin/);
  assert.match(seedRefusal({ ...local, BETTER_AUTH_URL: "https://www.avasaralab.com" }) ?? "", /production origin/);
  assert.match(
    seedRefusal({ ...local, DATABASE_URL: "postgresql://postgres.gxrifaedgzkagvvrmmim:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres" }) ?? "",
    /production database/,
  );
});
