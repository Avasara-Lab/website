import assert from "node:assert/strict";
import test from "node:test";
import { handleContactRequest } from "./contact-handler";
import { deliveryMessages, deliveryOutcome, maxBodyBytes } from "./enquiry";
import { createResendMailer, type MailConfig } from "./mailer";
import { createMemoryRateLimiter, type RateLimiter } from "./rate-limit";

const valid = {
  name: "Avery Chen",
  email: "Avery@Example.com",
  company: "Northwind",
  challenge: "Our team copies weekly account status from the CRM into a spreadsheet.",
  help: "automation",
  budget: "10-25",
};

function request(body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...headers,
    },
    body: raw,
  });
}

function allowingLimiter(): RateLimiter {
  return { async consume() { return { allowed: true, retryAfterSeconds: 0 }; } };
}

test("missing required fields are rejected and no email is sent", async () => {
  let calls = 0;
  const response = await handleContactRequest(request({ ...valid, name: " " }), {
    limiter: allowingLimiter(),
    mailer: { async send() { calls += 1; return { id: "should-not-send" }; } },
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.delivered, false);
  assert.equal(body.fields.name, "Enter your name.");
  assert.equal(calls, 0);
});

test("fields over their maximum length are rejected", async () => {
  const response = await handleContactRequest(
    request({ ...valid, name: "A".repeat(101), challenge: "C".repeat(4001) }),
    { limiter: allowingLimiter(), mailer: null },
  );
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.delivered, false);
  assert.match(body.fields.name, /under 100/);
  assert.match(body.fields.challenge, /under 4000/);
});

test("invalid email addresses are rejected", async () => {
  const response = await handleContactRequest(request({ ...valid, email: "not-an-email" }), {
    limiter: allowingLimiter(),
    mailer: { async send() { return { id: "nope" }; } },
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.fields.email, "Enter a valid work email.");
});

test("oversized payloads are rejected before delivery", async () => {
  const huge = "x".repeat(maxBodyBytes + 50);
  const response = await handleContactRequest(
    request({ ...valid, challenge: huge }),
    { limiter: allowingLimiter(), mailer: { async send() { return { id: "nope" }; } } },
  );
  assert.equal(response.status, 413);
  const body = await response.json();
  assert.equal(body.delivered, false);
  assert.equal(body.message, deliveryMessages.tooLarge);
});

test("a declared content-length above the limit is rejected", async () => {
  const response = await handleContactRequest(request(valid, { "content-length": String(maxBodyBytes + 1) }), {
    limiter: allowingLimiter(),
    mailer: null,
  });
  assert.equal(response.status, 413);
});

test("honeypot submissions do not send email", async () => {
  let calls = 0;
  const response = await handleContactRequest(
    request({ ...valid, company_website: "https://spam.example" }),
    {
      limiter: allowingLimiter(),
      mailer: { async send() { calls += 1; return { id: "should-not-send" }; } },
    },
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.delivered, false);
  assert.equal(calls, 0);
  assert.equal(deliveryOutcome(response.status, body).type, "failed");
});

test("a visitor cannot choose the recipient", async () => {
  const sent: Array<{ replyTo: string; to: string[] }> = [];
  const config: MailConfig = {
    apiKey: "re_test_key",
    to: "leads@avasara.example",
    from: "Avasara Lab <enquiries@avasara.example>",
  };
  const mailer = createResendMailer(config, {
    emails: {
      async send(payload) {
        sent.push({ replyTo: payload.replyTo, to: payload.to });
        assert.equal("html" in payload, false);
        assert.match(payload.text, /<script>alert\(1\)<\/script>/);
        assert.doesNotMatch(payload.subject, /[\r\n]/);
        assert.equal(payload.from, config.from);
        return { data: { id: "email_123" }, error: null };
      },
    },
  });
  const response = await handleContactRequest(
    request({
      ...valid,
      to: "attacker@example.net",
      challenge: `${valid.challenge} <script>alert(1)</script>`,
    }),
    { limiter: allowingLimiter(), mailer, now: () => new Date("2026-10-20T21:00:00.000Z") },
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.delivered, true);
  assert.deepEqual(sent, [{ replyTo: "avery@example.com", to: ["leads@avasara.example"] }]);
  assert.equal(deliveryOutcome(response.status, body).type, "sent");
});

test("provider errors do not report delivery", async () => {
  const mailer = createResendMailer(
    { apiKey: "re_test_key", to: "leads@avasara.example", from: "enquiries@avasara.example" },
    { emails: { async send() { return { data: null, error: { message: "Invalid API key" } }; } } },
  );
  const response = await handleContactRequest(request(valid), {
    limiter: allowingLimiter(),
    mailer,
  });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.delivered, false);
  assert.equal(body.message, deliveryMessages.failed);
});

test("network errors do not report delivery", async () => {
  const response = await handleContactRequest(request(valid), {
    limiter: allowingLimiter(),
    mailer: { async send() { throw new TypeError("fetch failed"); } },
  });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.delivered, false);
  assert.equal(deliveryOutcome(response.status, body).type, "failed");
});

test("missing email configuration does not report delivery", async () => {
  const response = await handleContactRequest(request(valid), {
    limiter: allowingLimiter(),
    mailer: null,
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.message, deliveryMessages.unavailable);
});

test("the memory limiter blocks only inside its own process", async () => {
  const limiter = createMemoryRateLimiter({ limit: 2, windowMs: 60_000 });
  const mailer = { async send() { return { id: "email_ok" }; } };
  const first = await handleContactRequest(request(valid), { limiter, mailer });
  const second = await handleContactRequest(request(valid), { limiter, mailer });
  const third = await handleContactRequest(request(valid), { limiter, mailer });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(third.status, 429);
  assert.equal((await third.json()).delivered, false);
});

test("a string delivered flag is not treated as success", () => {
  assert.equal(deliveryOutcome(200, { delivered: "true" }).type, "failed");
  assert.equal(deliveryOutcome(200, { delivered: true }).type, "sent");
});
