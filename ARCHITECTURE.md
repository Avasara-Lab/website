# Architecture

Avasara Lab is one Next.js 16 application. The public marketing site and the Opportunity Intelligence application share a process, a brand, and a deployment. Business logic lives in `src/server/modules` and does not import React.

## Why this shape

The master build names Fastify, PostgreSQL, Drizzle, Redis, BullMQ, R2-compatible storage, Better Auth, Zod, and the Meta Model API. This repository already runs the marketing site and the contact API as Next.js Route Handlers. Splitting a Fastify process out now would fork sessions, cookies, and local startup before the product loop works.

The chosen release keeps those modules behind Route Handlers:

- Same-origin Better Auth cookies. The browser never receives `MODEL_API_KEY`, Resend keys, or storage credentials.
- One `npm run dev` process for the site, the app, and inline ingestion.
- A module boundary that a later Fastify adapter can call without moving SQL or detection code.

Tradeoff: the HTTP surface is Next.js, not a standalone Fastify server. Redis and BullMQ are implemented and used when `INGESTION_MODE=queue` and `REDIS_URL` are set. The default mode processes an upload in the request so a laptop without Redis still completes the path. That inline path records the same ingestion job.

## Request path

```
Browser
  → src/proxy.ts (optimistic session-cookie check for /app)
  → Route Handler or Server Component
  → requireOrg() (session + membership)
  → src/server/modules/*
  → PostgreSQL
```

Every tenant query takes an `organizationId` from the membership row, not from an unchecked body field.

## Intelligence path

```
Upload or synthetic seed
  → parse (CSV, Excel, JSON, text, PDF, WAV)
  → business events and entities (observed)
  → deterministic signal detection
  → opportunities with evidence that points at those signals
  → optional Meta interpretation stored separately
  → human approval
  → Customer Support Automation Agent
  → simulated channel, labeled simulated
  → verification against observed approved answers
  → impact metrics with a classification on each row
```

Frequencies and delays are computed in code. A model may write an interpretation. It cannot add evidence ids or flip a row to `observed` or `verified`.

## Meta Model API

Documented base URL: `https://api.meta.ai/v1`. Auth: `Authorization: Bearer $MODEL_API_KEY`.

| Capability | Model id | Endpoint |
| --- | --- | --- |
| Reasoning and tool calling | `muse-spark-1.3` | `POST /v1/chat/completions` |
| Longer investigations | `muse-wonder-1.0` | `POST /v1/responses` |
| Speech to text | `muse-voice-transcribe-1.0` | `POST /v1/asr/transcribe` |
| Images | `muse-image-1.0` | `POST /v1/images/generations` |
| Catalog | — | `GET /v1/models` |

Muse Spark Open and Muse Glimmer are open-weight and are not called on this API. SAM 3.1 (`sam-3.1`) is documented on the Responses and media-segmentation APIs. This release does not send segmentation requests, because the request body is not wired from the media-segmentation schema. The configuration screen says so.

If `MODEL_API_KEY` is missing, the provider returns a blocked result and does not call another vendor.

## Storage and jobs

- Object storage uses the S3 API against Cloudflare R2 when `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` are set.
- Otherwise files are stored under `.data/uploads`, which is gitignored.
- Queue: BullMQ on `REDIS_URL` when `INGESTION_MODE=queue`. Run `npm run worker`.

## Production

Marketing routes and `POST /api/contact` do not open PostgreSQL. `/app`, `/api/auth`, and `/api/app` do. They read `DATABASE_URL` through `src/server/db/client.ts` and refuse to start auth without `BETTER_AUTH_SECRET`. `BETTER_AUTH_URL` is the cookie origin and the only trusted origin.

Hostinger Web and Cloud hosting provide MySQL. Their Node.js database setup writes a `mysql://` `DATABASE_URL`. This schema is PostgreSQL. Hostinger’s database support article, updated 29 October 2026, places PostgreSQL and Redis on VPS hosting, not on Web or Cloud. A full product deploy therefore uses PostgreSQL the Node process can reach: an external managed database, or PostgreSQL operated on a VPS. Deploy steps, the seed rule, and the smoke checklist are in `README.md`.

`npm run build` does not apply `drizzle/`. Run `scripts/migrate.ts` with `DATABASE_URL` set to the target database before `/app` is used. `npm run db:seed` loads a synthetic company and a password that is in this repository. Keep that command off production databases.

Inline ingestion is the production default on a host that only starts `next start`. Queue mode needs `REDIS_URL` and a separate `npm run worker` process. Disk uploads under `.data/uploads` are replaced when the app is redeployed. R2 is the durable store when those four variables are set. A missing `MODEL_API_KEY` blocks live model calls.

## Deletion

Deleting an organization cascades tenant rows. Deleting a user cascades memberships and sessions. Audit rows keep a null user id when the account is removed (`ON DELETE SET NULL`).
