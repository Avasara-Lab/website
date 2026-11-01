# Development status

Updated 1 November 2026.

## Working

- Public marketing routes, theme, and `POST /api/contact` remain in place. A missing Resend configuration returns delivery unavailable.
- Email registration and sign-in through Better Auth.
- Organization create, membership roles, invitation token, and org switcher. When `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are set, the invitation is also sent through Resend. Otherwise the API returns `emailDelivery: "not_configured"` and the one-time path.
- CSV, XLSX, JSON, text, Markdown, and PDF upload. JSON records keep nested `attributes` and other nested maps of known fields. WAV is stored and transcribed only when `MODEL_API_KEY` is set.
- Ingestion jobs, duplicate-file rejection, business events, entities, and relationships.
- Deterministic signals for repeated support questions, delayed sales follow-ups, and manual weekly reports.
- Opportunities with evidence, a published priority formula, and Opportunity Radar filters.
- Customer Support Automation Agent: human approval, allowlisted tools, simulated inbox, execution log, verification against observed approved answers.
- Impact rows classified as observed, estimate, simulated, or verified. The synthetic company is labeled.
- Meta provider for chat completions (`muse-spark`), responses (`muse-wonder`), image generation (`muse-image`), file transcription (`muse-voice-transcribe`), and `GET /models`. An empty or whitespace `MODEL_API_KEY` returns a blocked result and does not call another host. A base URL other than `https://api.meta.ai/v1` is refused.
- Tests: 36 passed, including the PostgreSQL path from ingest through verified impact, invitation isolation, search isolation, and nested JSON attributes.
- `npm run build` completes.

## Partial

- Redis/BullMQ is implemented and not the default. Inline processing is the path exercised by the seed and the upload API.
- R2 storage is implemented and used only when the R2 environment variables are set. Local disk is the default.
- SAM 3.1 is named and not called. Realtime speech (`wss://api.meta.ai/v1/asr/realtime`) and `POST /images/edits` are not called.
- The support agent writes to a simulated inbox. Sales follow-up and reporting have no executor.
- A separate Fastify process is not running. Module functions are the boundary described in `ARCHITECTURE.md`.

## Blocked

- Live Meta calls until `MODEL_API_KEY` is set. The AI page and `POST /api/app/ai` report the blocked state. No substitute provider is wired.

## Deploy

- Marketing pages and `POST /api/contact` can run on Hostinger Node.js hosting without `DATABASE_URL`.
- `/app` needs PostgreSQL. Hostinger Web and Cloud plans provide MySQL and write a `mysql://` `DATABASE_URL` if you use their website database setup. This app cannot use that URL. Use external managed PostgreSQL, or PostgreSQL you operate on a VPS. Steps are in `README.md`.
- `npm run db:migrate` applies `drizzle/` and is not part of `npm run build` or the Hostinger start command. Run it against the target database before using `/app`.
- `npm run db:seed` is for non-production databases. It refuses `NODE_ENV=production`, a `BETTER_AUTH_URL` on `avasaralab.com`, and the production database host. It creates the synthetic user documented in `README.md`. That password is not a production credential.
- `MODEL_API_KEY`, Redis, and R2 stay optional. Missing `MODEL_API_KEY` blocks live model calls. Hostinger’s Node process does not start `npm run worker`. Invitation email needs the same Resend key and verified sender as the contact form. `CONTACT_TO_EMAIL` is the enquiry inbox only.

## Not claimed

- No customer metrics, connected CRM, or live support channel.
- Feedback Intelligence is still the synthetic marketing demo.
- A live customer workspace. The deploy notes describe how to run the application.
