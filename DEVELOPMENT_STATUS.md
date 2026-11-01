# Development status

Updated 1 November 2026.

## Working

- Public marketing routes, theme, and `POST /api/contact` remain in place. A missing Resend configuration returns delivery unavailable.
- Email registration and sign-in through Better Auth.
- Organization create, membership roles, invitation token, and org switcher.
- CSV, XLSX, JSON, text, Markdown, and PDF upload. WAV is stored and transcribed only when `MODEL_API_KEY` is set.
- Ingestion jobs, duplicate-file rejection, business events, entities, and relationships.
- Deterministic signals for repeated support questions, delayed sales follow-ups, and manual weekly reports.
- Opportunities with evidence, a published priority formula, and Opportunity Radar filters.
- Customer Support Automation Agent: human approval, allowlisted tools, simulated inbox, execution log, verification against observed approved answers.
- Impact rows classified as observed, estimate, simulated, or verified. The synthetic company is labeled.
- Meta provider for chat completions, responses, image generation, transcription, and model list. Missing key returns a blocked result.
- Tests: 27 passed, including the PostgreSQL path from ingest through verified impact and org isolation.
- `npm run build` completes.

## Partial

- Redis/BullMQ is implemented and not the default. Inline processing is the path exercised by the seed and the upload API.
- R2 storage is implemented and used only when the R2 environment variables are set. Local disk is the default.
- Team invitations do not send email.
- SAM 3.1 is named and not called.
- A separate Fastify process is not running. Module functions are the boundary described in `ARCHITECTURE.md`.

## Blocked

- Live Meta calls. `MODEL_API_KEY` is not set in this environment. The AI page reports that, and a catalog test returns `blocked: true`. No substitute provider is wired.

## Deploy

- Marketing pages and `POST /api/contact` can run on Hostinger Node.js hosting without `DATABASE_URL`.
- `/app` needs PostgreSQL. Hostinger Web and Cloud plans provide MySQL and write a `mysql://` `DATABASE_URL` if you use their website database setup. This app cannot use that URL. Use external managed PostgreSQL, or PostgreSQL you operate on a VPS. Steps are in `README.md`.
- `npm run db:migrate` applies `drizzle/` and is not part of `npm run build` or the Hostinger start command. Run it against the target database before using `/app`.
- `npm run db:seed` is for non-production databases. It creates `founder@avasara-demo.test` with a password that is in the repository.
- `MODEL_API_KEY`, Redis, and R2 stay optional. Missing `MODEL_API_KEY` blocks live model calls. Hostinger’s Node process does not start `npm run worker`.

## Not claimed

- No customer metrics, connected CRM, or live support channel.
- Feedback Intelligence is still the synthetic marketing demo.
- A live customer workspace. The deploy notes describe how to run the application.
