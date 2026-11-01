# Implementation log

## 2026-11-01 — Opportunity Intelligence application

Inspected the existing Next.js 16 marketing site and the Meta Model API docs at `https://dev.meta.ai/docs` before choosing endpoints.

Chose one Next.js app with domain modules under `src/server/modules`. Documented the Fastify tradeoff in `ARCHITECTURE.md`. Added Drizzle schema and `drizzle/0000_opportunity_intelligence.sql` for users, organizations, sources, memory, signals, opportunities, agents, approvals, runs, impact, notifications, audit, and AI usage.

Implemented Better Auth email sign-in, organization roles, uploads, deterministic detection, opportunity scoring, the support-agent workflow, and the Meta provider. Seeded Avasara Demo Technologies with 451 synthetic records, 6 signals, and 3 opportunities.

Verified with `npm test` (27 passed), `npm run build`, a signed-in request to `/app` and `/app/radar`, a CSV upload that completed, a blocked Meta catalog call, and a browser pass of sign-in, radar, evidence, AI configuration, and the contact form.

Known limits are recorded in `DEVELOPMENT_STATUS.md`.

## 2026-11-01 — Invitations, Meta configuration, and seed guard

Checked the Meta Model API docs at `https://dev.meta.ai/docs/models`, the chat, image, speech, and models references. The hosted calls stay on `https://api.meta.ai/v1`: Muse Spark on chat completions, Muse Wonder on responses, Muse Voice on `POST /asr/transcribe`, Muse Image on `POST /images/generations`, and the catalog on `GET /models`. An empty key stays blocked. Another host is refused. SAM 3.1, realtime speech, and image edits stay unwired.

Invitation creation still returns the one-time path. When `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are set, the same Resend client sends that link to the invited address. A missing configuration or a provider error keeps the path and says the email was not sent.

`npm run db:seed` now refuses production `NODE_ENV`, a production auth origin, and the production database host. It reuses only the synthetic demo organization and the upload source.

`npm test` passed 36 tests, including organization isolation for invitations and search and nested JSON attributes. `npm run build` completed.

## 2026-11-01 — Nested JSON attributes

`parseJsonRecords` mapped only top-level keys, so a nested `attributes` object became an empty attribute bag. Known fields inside `attributes` and other nested objects are now flattened before `recordFromRow`. A top-level field still wins when the same name appears in both places. Flat CSV columns are unchanged.
