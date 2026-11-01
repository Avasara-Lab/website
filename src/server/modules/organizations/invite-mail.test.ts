import assert from "node:assert/strict";
import { test } from "node:test";
import { createResendSender, readSenderConfig } from "@/lib/mailer";
import { INVITE_EMAIL_NOTES, invitationMessage, inviteOrigin } from "@/server/modules/organizations/invite-mail";

test("invitation mail needs the Resend key and the verified sender", () => {
  assert.equal(readSenderConfig({ RESEND_API_KEY: "", CONTACT_FROM_EMAIL: "Avasara Lab <hello@example.com>" }), null);
  assert.equal(readSenderConfig({ RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "" }), null);
  assert.equal(readSenderConfig({ RESEND_API_KEY: "re_test", CONTACT_FROM_EMAIL: "not-an-email" }), null);
  assert.deepEqual(readSenderConfig({ RESEND_API_KEY: " re_test ", CONTACT_FROM_EMAIL: "Avasara Lab <hello@example.com>" }), {
    apiKey: "re_test",
    from: "Avasara Lab <hello@example.com>",
  });
});

test("the invitation message keeps the one-time link and names one organization", () => {
  const message = invitationMessage({
    organizationName: "Northwind",
    role: "member",
    acceptUrl: "http://localhost:3000/invite/token-value",
  });
  assert.match(message.subject, /Northwind/);
  assert.match(message.text, /http:\/\/localhost:3000\/invite\/token-value/);
  assert.match(message.text, /only to that organization/);
  assert.equal(inviteOrigin({ BETTER_AUTH_URL: "http://localhost:3000/ignored" }), "http://localhost:3000");
  assert.equal(inviteOrigin({}), "http://localhost:3000");
  assert.match(INVITE_EMAIL_NOTES.not_configured, /was not sent/);
  assert.match(INVITE_EMAIL_NOTES.sent, /accepted/);
  assert.match(INVITE_EMAIL_NOTES.failed, /did not accept/);
});

test("the Resend sender addresses the invited person and requires a message id", async () => {
  const sent: Array<{ to: string[]; subject: string }> = [];
  const sender = createResendSender(
    { apiKey: "re_test", from: "Avasara Lab <hello@example.com>" },
    {
      emails: {
        async send(payload) {
          sent.push({ to: payload.to, subject: payload.subject });
          return { data: { id: "email_invite" }, error: null };
        },
      },
    },
  );
  const result = await sender.send({
    to: "member@example.com",
    subject: "Invitation to Northwind on Avasara Lab",
    text: "Open http://localhost:3000/invite/token-value",
  });
  assert.equal(result.id, "email_invite");
  assert.deepEqual(sent, [{ to: ["member@example.com"], subject: "Invitation to Northwind on Avasara Lab" }]);

  const failing = createResendSender(
    { apiKey: "re_test", from: "hello@example.com" },
    { emails: { async send() { return { data: null, error: { message: "Invalid API key" } }; } } },
  );
  await assert.rejects(() => failing.send({ to: "member@example.com", subject: "Invite", text: "Link" }), /Invalid API key/);
});
