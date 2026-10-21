import assert from "node:assert/strict";
import test from "node:test";
import { canonicalSiteUrl, resolveSiteUrl } from "./site-url";

test("a missing site URL uses the canonical production origin", () => {
  assert.equal(resolveSiteUrl(undefined), canonicalSiteUrl);
  assert.equal(resolveSiteUrl("  "), canonicalSiteUrl);
});

test("a hostname without a protocol becomes an absolute https URL", () => {
  assert.equal(resolveSiteUrl("www.avasaralab.com"), "https://avasaralab.com");
  assert.equal(resolveSiteUrl("avasaralab.com"), "https://avasaralab.com");
  assert.equal(resolveSiteUrl("preview.example.com"), "https://preview.example.com");
});

test("www is not the canonical host for the production domain", () => {
  assert.equal(resolveSiteUrl("https://www.avasaralab.com"), "https://avasaralab.com");
  assert.equal(resolveSiteUrl("http://www.avasaralab.com/"), "https://avasaralab.com");
  assert.equal(resolveSiteUrl("https://WWW.AvasaraLab.com"), "https://avasaralab.com");
});

test("other origins keep their host and scheme", () => {
  assert.equal(resolveSiteUrl("http://preview.example.com"), "http://preview.example.com");
  assert.equal(resolveSiteUrl("https://www.example.com"), "https://www.example.com");
});

test("the resolved value can be parsed as an absolute URL", () => {
  const origin = resolveSiteUrl("www.avasaralab.com");
  assert.equal(new URL(origin).href, "https://avasaralab.com/");
  assert.equal(new URL("/sitemap.xml", origin).href, "https://avasaralab.com/sitemap.xml");
});

test("malformed site URLs are rejected", () => {
  for (const value of [
    "not a url",
    "https://",
    "ftp://avasaralab.com",
    "https://user:secret@avasaralab.com",
    "https://avasaralab.com/path",
    "https://avasaralab.com?q=1",
  ]) {
    assert.throws(() => resolveSiteUrl(value), /NEXT_PUBLIC_SITE_URL/);
  }
  assert.throws(() => resolveSiteUrl("https://user:secret@avasaralab.com"), /must not include credentials/);
});
