import assert from "node:assert/strict";
import test from "node:test";
import { safeNextPath } from "./safe-next";

test("product paths are preserved", () => {
  assert.equal(safeNextPath("/app"), "/app");
  assert.equal(safeNextPath("/app/radar"), "/app/radar");
  assert.equal(safeNextPath("/app/opportunities/6f1e7a2c-1b3d-4e5f-8a90-aabbccddeeff"), "/app/opportunities/6f1e7a2c-1b3d-4e5f-8a90-aabbccddeeff");
});

test("queries and hashes are dropped", () => {
  assert.equal(safeNextPath("/app/radar?status=NEW"), "/app/radar");
  assert.equal(safeNextPath("/app/signals#top"), "/app/signals");
});

test("open redirects and traversal fall back to overview", () => {
  for (const value of [
    null,
    "",
    "/login",
    "/contact",
    "//evil.example",
    "https://evil.example/app",
    "/app/../login",
    "/app/./radar",
    "/app//radar",
    "/\\app",
    "/app/radar\n",
  ]) {
    assert.equal(safeNextPath(value), "/app");
  }
});
