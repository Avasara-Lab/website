# Avasara Lab

**Opportunity Intelligence** is the product in this repository: the Opportunity Intelligence Layer, multi-tenant AI business intelligence and agentic execution for founders and small teams. The live site is [https://avasaralab.com](https://avasaralab.com). Marketing pages and the authenticated application at `/app` ship together. Until 16 November 2026 at 00:00 UTC, the public homepage presents Opportunity Intelligence. The studio homepage stays in the repository and returns after that instant. Restore steps are in `src/lib/marketing-window.ts`.

Avasara Lab is an AI engineering studio for US and global B2B teams. The public line is “Find the opportunity. Build the intelligence. Automate the outcome.” The tagline is “Turn business signals into automation opportunities.” This repository does not publish clients, certifications, revenue, or customer metrics. Feedback Intelligence is a synthetic demo. The seeded company “Avasara Demo Technologies” is synthetic and stays labeled that way.

## What the application does

Each organization is its own workspace. Membership decides what a person can see. A tenant query uses the organization on that membership.

The implemented loop:

1. Register, create an organization, and invite teammates.
2. Upload CSV, Excel, JSON, text, PDF, or WAV. The file is stored, parsed, and written as business events, entities, and relationships.
3. Deterministic detectors count repeated support questions, delayed sales follow-ups, and manual weekly reports.
4. Those signals become opportunities with the evidence that produced them, a visible priority score, the method used to compute it, and Opportunity Radar.
5. A person with the right role approves. The Customer Support Automation Agent then runs allowlisted tools against a simulated inbox. The log says simulated. Replies are checked against observed approved answers.
6. Each impact row carries a classification such as `observed`, `estimate`, `simulated`, or `verified`. A synthetic workspace shows a banner that its figures are not customer results.

HubSpot, Gmail, Slack, Notion, ClickUp, and QuickBooks appear as connectors that still need configuration. Credentials are not stored, and no sync is pretended. Sales follow-up and reporting recommendations have no executor. WAV transcription runs only when a Meta key is set; otherwise the file is stored and transcription is blocked.

Service pages, the contact form, and the Feedback Intelligence demo remain on the public site. Feedback Intelligence groups synthetic reviews, tickets, and notes. It does not connect to a customer’s tools. A scoped service engagement is still how a team starts work this application does not cover.

The request path, the intelligence path, and the Route Handler boundary are in [ARCHITECTURE.md](ARCHITECTURE.md).

### Signals and the model stay separate

Signal detection, opportunity evidence, and priority scores are application code. Frequencies and delays are computed there. A model may write an interpretation, stored separately. It cannot add evidence ids or mark a row `observed` or `verified`.

When `MODEL_API_KEY` is set, generative calls go only to the Meta Model API at `https://api.meta.ai/v1`, with `Authorization: Bearer`. The configuration screen maps Muse Spark to `POST /chat/completions`, Muse Wonder to `POST /responses`, Muse Voice Transcribe to `POST /asr/transcribe`, and Muse Image to `POST /images/generations`. Model ids ending in `-contributor` are Contributor mode. An empty or whitespace key blocks live calls. `META_API_BASE_URL`, if set, must stay `https://api.meta.ai/v1`. Any other host is refused.

Muse Spark Open and Muse Glimmer are open-weight and are not requested from this API. SAM 3.1 is documented and not requested, because this release does not assemble a media-segmentation body. Realtime transcription and image edits are not requested.

## Stack

| Piece | Role |
| --- | --- |
| Next.js | One app: public marketing routes and `/app` Route Handlers. `engines` asks for Node.js 20 or newer. |
| PostgreSQL and Drizzle | Product schema. Production uses Supabase. The app reads `DATABASE_URL` with the `postgres` driver. |
| Better Auth | Email and password sessions for `/login`, `/register`, and `/app`. |
| Resend | Contact-form delivery and, when configured, team-invitation email. |
| Meta Model API | Optional. `MODEL_API_KEY` on the server. Meta is the only model vendor this app calls. |
| Redis and BullMQ | Optional. Used when `INGESTION_MODE=queue`. The default handles an upload inside the request. |
| Cloudflare R2 | Optional S3-compatible uploads. Without the R2 variables, files go to `.data/uploads` on the server disk. |

## Run locally

PostgreSQL is required for `/app`. Redis is required only for queued ingestion.

```bash
npm install
cp .env.example .env.local
```

Set `DATABASE_URL` to a PostgreSQL URL and `BETTER_AUTH_SECRET` to at least 32 random characters. Auth refuses to start when the secret is shorter than 16 characters. `.env.local` is gitignored. Never commit real credentials.

```bash
npm run db:migrate
npm run db:seed    # optional; non-production databases only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login` to open `/app`.

`npm run db:migrate` passes `--env-file=.env.local`. Node exits if that file is missing. When the file exists, a `DATABASE_URL` already exported in the shell still wins. `npm run build` does not migrate and does not seed.

```bash
npm test
npm run lint
npm run build
```

`npm test` covers contact-form validation with a fake Resend client and a PostgreSQL critical path. That database test expects `postgres://avasara:avasara@127.0.0.1:5432/avasara_test`. Create that database before the suite, or point the test at another database by editing the connection string in `src/server/critical-path.test.ts`.

To process uploads with BullMQ, set `INGESTION_MODE=queue` and `REDIS_URL`, then run `npm run worker` in a second process. Leave `INGESTION_MODE` unset to process an upload in the request. That inline path still writes an ingestion job. Optional R2 variables switch uploads from `.data/uploads` to Cloudflare R2.

## Demo data

`npm run db:seed` creates the synthetic user `founder@avasara-demo.test` with the password `DemoFounder!2026` and the synthetic organization Avasara Demo Technologies, then ingests synthetic records through the same pipeline as an upload. The password is in this repository. It is a local demo credential. Running the command again does not duplicate events, and it writes into that synthetic company even if the user already belongs to another organization. The workspace banner says the company is synthetic. Its counts are example data.

The seed exits before any write when `NODE_ENV` is `production`, when `BETTER_AUTH_URL` is `https://avasaralab.com` or `www.avasaralab.com`, or when `DATABASE_URL` points at the production database. A local `NEXT_PUBLIC_SITE_URL` of `https://avasaralab.com` does not block the seed. A production workspace starts empty: register a real account and create an organization in the product.

Those credentials are for non-production databases only. A fictional demo organization may exist on the live site for demonstrations. If it does, it is labeled synthetic. Do not read its figures as customer results, and do not invent clients or metrics from it.

## Pages

- `/` Opportunity Intelligence landing until 16 November 2026, then the studio homepage
- `/company` unlinked, noindex copy of the studio homepage while the product landing is public
- `/services`
- `/services/ai-agents`
- `/services/generative-ai`
- `/services/data-intelligence`
- `/services/saas-development`
- `/services/opportunity-audits`
- `/services/workflow-automation`
- `/products`
- `/products/feedback-intelligence`
- `/about`
- `/contact`
- `/how-it-works`
- `/features`
- `/login`
- `/register`
- `/invite/[token]` accept one organization invitation
- `/app` authenticated product screens (session required)

The service pages are generated from `src/lib/services-catalog.ts`. The six categories are AI agents and intelligent automation, generative AI and knowledge systems, data engineering and business intelligence, custom software and product engineering, AI infrastructure and implementation, and AI-powered growth and opportunity intelligence.

Inside `/app`, the navigation covers Overview, Opportunity Radar, Signals, Business Connect, data sources, Business Memory, AI agents, executions, Impact, notifications, AI configuration, team, settings, and search.

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. Production values belong in the host’s environment, not in the repository. The two runtime profiles are under [Production deploy](#production-deploy).

Set `NEXT_PUBLIC_SITE_URL` to an absolute origin, including `https://`, before production. Canonical URLs, the sitemap, robots, and social metadata use it. When the variable is unset, those URLs use `https://avasaralab.com`. A hostname without a scheme, including `www.avasaralab.com`, is normalized to that same origin. `www` is not the canonical host. Any other malformed value fails the build.

Public pages and `POST /api/contact` need `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. Those routes do not open PostgreSQL and do not call a model or CRM.

`/login`, `/register`, `/app`, `/api/auth`, and `/api/app` also need `DATABASE_URL` and `BETTER_AUTH_SECRET`. `DATABASE_URL` must be a PostgreSQL connection string. `BETTER_AUTH_URL` must be the origin the browser uses. `/app` reads the database from its layout, so that route fails until both are set. `/login` and `/register` render without the database. Submitting either form calls `/api/auth`, which fails the same way until both are set.

`NEXT_PUBLIC_SITE_URL` is the only public variable. Do not prefix a secret with `NEXT_PUBLIC_`. The browser never receives Resend keys, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `MODEL_API_KEY`, `REDIS_URL`, or R2 credentials.

## Contact and invitations

`POST /api/contact` validates the enquiry and sends one plain-text email with the [Resend](https://resend.com) SDK. The browser never sees the API key, the recipient, or the sender. A visitor cannot choose who receives the message. The confirmation “Your enquiry has been sent” appears only after Resend returns a message id. The API does not store enquiries in a database.

1. Create an account at [resend.com](https://resend.com).
2. Open [API keys](https://resend.com/api-keys) and create a key that can send email. Put it in `RESEND_API_KEY`.
3. Open [Domains](https://resend.com/domains), add the sending domain, and wait until Resend marks it verified.
4. Set `CONTACT_FROM_EMAIL` to an address on that domain. A display name is allowed, for example `Avasara Lab <enquiries@yourdomain.com>`. An unverified address will not do. `hello@avasaralab.com` is not a configured sender. Resend’s `onboarding@resend.dev` address is only for Resend’s own test inbox.
5. Set `CONTACT_TO_EMAIL` to one mailbox that should receive enquiries. The value must be a single email address. The form does not publish it.

With those three variables set to a verified sender and a real inbox:

```bash
curl -sS -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Avery Chen","email":"avery@example.com","company":"Northwind","challenge":"Our team copies weekly account status from the CRM into a spreadsheet.","help":"automation"}'
```

A delivered enquiry responds with `{"delivered":true}`. Any other response means the email was not accepted. Missing configuration responds with delivery unavailable and does not claim success. `npm test` covers validation, oversized bodies, the honeypot, provider errors, network errors, and the success response. Those tests do not send a real email.

The endpoint applies a process-local limit of 8 requests per 15 minutes per address in `x-forwarded-for`. That counter resets when the process restarts and is not shared across instances. Replace the limiter in `src/app/api/contact/route.ts` with a `RateLimiter` from `src/lib/rate-limit.ts` backed by Redis or Upstash when shared storage is available. The honeypot field `company_website` must stay empty. A filled honeypot is discarded and no email is sent.

Team invitations use `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`. `CONTACT_TO_EMAIL` stays the contact-form inbox and is not the invitation recipient. The API says the email was accepted only after Resend returns a message id. When either variable is missing, or Resend rejects the send, the API keeps the one-time path and says that email was not sent.

## Production deploy

This app needs a Node.js server at runtime. `POST /api/contact` and the product Route Handlers are not a static file upload. `npm run build` does not migrate the database and does not seed it.

Two profiles share one process. The public site can run without the database. The product routes cannot.

| Profile | What works | Required server environment |
| --- | --- | --- |
| Public site | Public pages and `POST /api/contact` | `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| Full product | Those routes, plus `/login`, `/register`, `/app`, `/api/auth`, and `/api/app` | The public-site variables, plus `DATABASE_URL` and `BETTER_AUTH_SECRET`. Set `BETTER_AUTH_URL` to the deployed origin. |

### Environment

| Variable | Public site | Full product | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Required | Required | Public. Inlined at build time. Production value `https://avasaralab.com`. Changing it needs a new build. |
| `RESEND_API_KEY` | Required for delivery | Required for delivery | Server only. Without it the contact API returns delivery unavailable. |
| `CONTACT_TO_EMAIL` | Required for delivery | Required for delivery | Server only. One inbox. |
| `CONTACT_FROM_EMAIL` | Required for delivery | Required for delivery | Server only. A sender on a domain Resend has verified. Also the invitation sender. |
| `DATABASE_URL` | Omit | Required | Server only. PostgreSQL URL (`postgres://` or `postgresql://`), including the provider’s TLS parameters when it requires them (for example `sslmode=require`). Production points at Supabase. |
| `BETTER_AUTH_SECRET` | Omit | Required | Server only. At least 32 random characters in production. Never commit a real value. |
| `BETTER_AUTH_URL` | Omit | Required | Server only. Absolute origin of this deployment, with no path. Cookie and trusted-origin base in `src/server/auth/auth.ts`. |
| `MODEL_API_KEY` | Omit | Optional | Server only. Empty or whitespace means live Meta calls are blocked. No other model vendor is called. |
| `META_API_BASE_URL` | Omit | Optional | Server only. Must stay `https://api.meta.ai/v1`. Any other host is refused. |
| `REDIS_URL` | Omit | Optional | Server only. Used only when `INGESTION_MODE=queue`. |
| `INGESTION_MODE` | Omit | Optional | Leave unset. The default processes an upload in the request. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Omit | Optional | Server only. When any one is missing, files go to `.data/uploads` on the server disk. |
| `R2_ENDPOINT` | Omit | Optional | Server only. Defaults to the account’s `r2.cloudflarestorage.com` endpoint. |

`BETTER_AUTH_URL` must match the origin users open. On a temporary host such as `https://example.hostingersite.com`, set it to that origin. After the custom domain is connected, set it to `https://avasaralab.com` and restart so cookies and callbacks use the new origin. Locally the auth origin is `http://localhost:3000` while the canonical site URL stays `https://avasaralab.com`.

### PostgreSQL

The product schema is PostgreSQL. Drizzle’s dialect in `drizzle.config.ts` is `postgresql`, and `src/server/db/client.ts` uses the `postgres` driver. A MySQL URL will not run `/app`.

Hostinger Web and Cloud hosting do not provide PostgreSQL. Their support article [Which databases and data tools are supported at Hostinger](https://www.hostinger.com/support/which-databases-and-data-tools-are-supported-at-hostinger/) (updated 29 October 2026) says PostgreSQL, Redis, and MongoDB need VPS hosting, and MySQL is what Web and Cloud plans provide. The Node.js article [Connecting a Hostinger MySQL database to a Node.js application](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/) says the same, and the platform’s website-database setup writes `DATABASE_URL` as `mysql://user:password@127.0.0.1:3306/name`. Leave that setup unused for this app. It would replace a PostgreSQL URL with a MySQL URL.

Production uses Supabase. Hostinger documents an external database for Node.js apps and uses Supabase as the example in [Connecting a Supabase database to a Hostinger Node.js application](https://www.hostinger.com/support/connecting-a-supabase-database-to-a-hostinger-node-js-application/). Use the pooler connection string. On a free Supabase project the direct host is IPv6-only. Confirm the name the host stored is `DATABASE_URL`. A wizard that writes a different name does not configure this app.

Other reachable PostgreSQL works the same way if the connection string is valid for the `postgres` driver, including PostgreSQL you operate on a Hostinger VPS. That is the plan Hostinger documents for PostgreSQL. You install, patch, back up, and firewall it. Web and Cloud Node hosting still only reaches it if you allow the app’s outbound address. This repository has no second deploy manifest for a host other than the Node.js app described below.

Create an empty database. Apply `drizzle/` from a checkout of this repository on a machine that can reach that database. The script reads `DATABASE_URL` and prints `Migrations applied.`

```bash
export DATABASE_URL='postgres://…'   # the database you intend to change; do not commit it
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs scripts/migrate.ts
```

`npm run db:migrate` is the local shortcut. Run it again after a later migration lands. Do not point it at production until the URL is the one you mean to change. Keep `npm run db:seed` off production. The guards are in [Demo data](#demo-data).

### Redis, uploads, and the model key

Leave `INGESTION_MODE` unset on Hostinger. The default handles an upload inside the request and still writes an ingestion job. `INGESTION_MODE=queue` needs `REDIS_URL` and a separate process running `npm run worker`. Hostinger starts the Next.js server. It does not start that worker. Web and Cloud plans do not provide Redis. Agency Hosting’s Redis is an object-cache plugin for those sites, not a `REDIS_URL` this worker reads. Queued ingestion needs an external Redis and a process you run yourself.

`.data/uploads` is the fallback file store. A Node deploy replaces the site contents, so files written there do not survive the next deploy. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` when uploads must be kept. `R2_ENDPOINT` is optional.

Leave `MODEL_API_KEY` unset until you intend to call Meta. The AI screen and `POST /api/app/ai` report that live calls are blocked, including a whitespace value. Do not put a substitute provider in its place.

### Hostinger Node.js

Hostinger Business web hosting can run the Next.js server. Hostinger’s docs say Business plans include Node.js websites, run Next.js in server mode with API routes, and rebuild from GitHub on each push to the connected branch. Confirmed settings from those docs:

| Setting | Value |
| --- | --- |
| Application type | `next` |
| Node.js | 20 or newer (`engines` asks for `>=20`) |
| Root directory | repository root |
| Build command | `npm run build`, which runs `next build --webpack` |
| Output directory | `.next` |
| Entry file | ignored for Next.js |
| Start script in this repo | `next start` (Hostinger starts the standalone server it adds during the build) |

`next.config.ts` exports an object, which Hostinger can wrap with `output: "standalone"`. Keep that export as an object.

Deploy from GitHub only after the site is on `main`:

1. In hPanel, open Websites → Add Website → Node.js web app → Import Git repository.
2. Connect the Hostinger GitHub App to the account that can read `Avasara-Lab/website`.
3. Select that repository and the `main` branch. Keep the root directory at the repository root.
4. Confirm the framework is Next.js, the build script is `build`, and the output directory is `.next`.
5. On the same screen, open Set environment variables and add the names for the profile you are deploying. Add the Resend values only after the sending domain is verified. For the full product, add the PostgreSQL `DATABASE_URL` and the Better Auth values. Do not add Hostinger’s MySQL `DATABASE_URL`. Save. Hostinger injects these into the build and the running server, then redeploys when they change. The API that replaces Node.js environment variables replaces the whole set: a name omitted from that call is deleted. `NEXT_PUBLIC_SITE_URL` is read at build time, so a change to it needs a new build.
6. Deploy. Later pushes to `main` trigger another build. The deployment log is under Deployments.
7. Apply migrations against the production database before anyone uses `/app`. The build does not apply them. Do not seed production.

Do not remove the current `avasaralab.com` website to make room for this app until you have chosen to replace it. Hostinger’s “domain already added” flow can require changing the main domain and removing the existing website. That would replace whatever is live today. Connect the custom domain only after the Node.js app is running on Hostinger’s temporary domain and you have authorized the DNS change. If Cloudflare proxies the domain, set the SSL mode to Full after the records point at Hostinger. When the public origin changes, update `BETTER_AUTH_URL` to that origin.

### Secrets

`.gitignore` ignores `.env*` and keeps `.env.example`. Do not commit production URLs, API keys, or the auth secret. Set them in the host’s environment UI. Hostinger masks stored values on read. Do not copy a masked value back into a replace call.

Server-only names: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MODEL_API_KEY`, `META_API_BASE_URL`, `REDIS_URL`, and the `R2_*` keys. They are read in server modules. They are not `NEXT_PUBLIC_` variables.

### Smoke checklist

Public site, on either profile:

- Open `/`. The page shows the homepage line.
- Submit the contact form, or `POST /api/contact` with a valid body. `{"delivered":true}` appears only after Resend returns a message id. Otherwise the response is delivery unavailable and the form must not claim success.
- Confirm the message is in `CONTACT_TO_EMAIL`. Email delivery is not confirmed until that send is accepted.

Full product, after migrations:

- `DATABASE_URL` uses the `postgres://` or `postgresql://` scheme.
- The migrate command printed `Migrations applied.`
- The production database was not seeded.
- `/register` and `/login` render.
- Register an account, sign in, create an organization, and open `/app`.
- Open `/app/ai` as an owner or administrator. With `MODEL_API_KEY` unset, the screen says live Meta calls are blocked. Other roles see “Key configured: no”.
- Invite a teammate from `/app/team`. With Resend unset, the screen says email was not sent and shows the one-time path. With `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` set, the screen says Resend accepted the email only after a message id comes back.

Non-production database only:

- Run `npm run db:seed`.
- Sign in as `founder@avasara-demo.test`. The workspace says the company is synthetic.
