# Implementation log

## 2026-11-01 — Opportunity Intelligence application

Inspected the existing Next.js 16 marketing site and the Meta Model API docs at `https://dev.meta.ai/docs` before choosing endpoints.

Chose one Next.js app with domain modules under `src/server/modules`. Documented the Fastify tradeoff in `ARCHITECTURE.md`. Added Drizzle schema and `drizzle/0000_opportunity_intelligence.sql` for users, organizations, sources, memory, signals, opportunities, agents, approvals, runs, impact, notifications, audit, and AI usage.

Implemented Better Auth email sign-in, organization roles, uploads, deterministic detection, opportunity scoring, the support-agent workflow, and the Meta provider. Seeded Avasara Demo Technologies with 451 synthetic records, 6 signals, and 3 opportunities.

Verified with `npm test` (27 passed), `npm run build`, a signed-in request to `/app` and `/app/radar`, a CSV upload that completed, a blocked Meta catalog call, and a browser pass of sign-in, radar, evidence, AI configuration, and the contact form.

Known limits are recorded in `DEVELOPMENT_STATUS.md`.
