# Avasara Lab

Marketing site for Avasara Lab, an AI engineering and intelligent automation company for US and global B2B teams.

The homepage line is “Find the opportunity. Build the intelligence. Automate the outcome.” The supporting idea is the tagline: turn business signals into automation opportunities. The site presents six service categories, an early Feedback Intelligence demo, a project enquiry form, and the authenticated Opportunity Intelligence application. It does not invent clients, metrics, or certifications. Feedback Intelligence and the seeded demo company are synthetic.

## Design

Black, white, and gray are the brand. Blue is the technology accent. Orange marks opportunities and the occasional highlight. The values live as CSS variables in `src/app/globals.css`, with a light set and a dark set.

The navigation control cycles Light, Dark, and System. The choice is stored in `localStorage` as `avasara-theme`. A blocking script in the document head applies it before the first paint, so a saved dark theme does not flash white. With nothing stored, the site follows the operating system.

Type is Inter, loaded through `next/font`.

On a phone, the hero stacks the headline, the paragraph, the two actions, and a vertical Opportunity Intelligence path. On a large screen that same path sits beside the copy, so the diagram is in the first view instead of under a split headline. The diagram uses synthetic notes. Sign in at `/login` to open the application under `/app`. A seeded company on a development database is labeled synthetic and is not a customer result.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

## Pages

- `/` homepage
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
- `/app` authenticated product screens (session required)

The service pages are generated from `src/lib/services-catalog.ts`. The six categories are AI agents and intelligent automation, generative AI and knowledge systems, data engineering and business intelligence, custom software and product engineering, AI infrastructure and implementation, and AI-powered growth and opportunity intelligence.

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored. Never commit real credentials. Production values belong in the host’s environment, not in the repository. The two profiles are listed under [Production deploy](#production-deploy).

Set `NEXT_PUBLIC_SITE_URL` to an absolute origin, including `https://`, before production. Canonical URLs, the sitemap, robots, and social metadata use it. When the variable is unset, those URLs use `https://avasaralab.com`. A hostname without a scheme, including `www.avasaralab.com`, is normalized to that same origin. `www` is not the canonical host. Any other malformed value fails the build.

Marketing pages and `POST /api/contact` need three server-only variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Those routes do not open PostgreSQL and do not call an analysis or CRM service.

`/login`, `/register`, `/app`, `/api/auth`, and `/api/app` also need `DATABASE_URL` and `BETTER_AUTH_SECRET`. `DATABASE_URL` must be a PostgreSQL connection string. `BETTER_AUTH_URL` must be the origin the browser uses. `MODEL_API_KEY`, Redis, and Cloudflare R2 are optional. Without `MODEL_API_KEY`, live model calls are blocked and no other provider is used.

## Lead capture

`POST /api/contact` validates the enquiry and sends one plain-text email with the [Resend](https://resend.com) SDK. The browser never sees the API key, the recipient, or the sender address. A visitor cannot choose who receives the message. The confirmation “Your enquiry has been sent” appears only after Resend returns a message id.

### Create the Resend account

1. Create an account at [resend.com](https://resend.com).
2. Open [API keys](https://resend.com/api-keys) and create a key that can send email.
3. Put that key in `RESEND_API_KEY`.

### Verify the sending domain

1. Open [Domains](https://resend.com/domains) and add the domain that will send enquiries.
2. Add the DNS records Resend shows, then wait until the domain status is verified.
3. Set `CONTACT_FROM_EMAIL` to an address on that domain. A display name is allowed, for example `Avasara Lab <enquiries@yourdomain.com>`.
4. Do not use an unverified address. `hello@avasaralab.com` is not a configured sender.

Resend’s `onboarding@resend.dev` address is only for Resend’s own test inbox. It is not a production sender for this site.

### Choose the recipient inbox

Set `CONTACT_TO_EMAIL` to one mailbox that should receive enquiries, such as `leads@yourdomain.com`. The value must be a single email address. The form does not publish this address.

### Test locally

```bash
cp .env.example .env.local
npm run dev
```

With the three email variables set to a verified sender and a real inbox:

```bash
curl -sS -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Avery Chen","email":"avery@example.com","company":"Northwind","challenge":"Our team copies weekly account status from the CRM into a spreadsheet.","help":"automation"}'
```

A delivered enquiry responds with `{"delivered":true}`. Resend’s dashboard shows the message id. Any other response means the email was not accepted. Missing configuration responds with delivery unavailable and does not claim success.

`npm test` covers validation, oversized bodies, the honeypot, provider errors, network errors, and the success response using a fake Resend client. Those tests do not send a real email.

The endpoint also applies a process-local limit of 8 requests per 15 minutes per address in `x-forwarded-for`. That counter resets when the process restarts and is not shared across serverless instances, so it is not sufficient protection on its own for a multi-instance deploy. Replace the limiter in `src/app/api/contact/route.ts` with a `RateLimiter` from `src/lib/rate-limit.ts` backed by Redis or Upstash when that shared storage is available. The address is used only for that in-memory count.

The honeypot field `company_website` must stay empty. A filled honeypot is discarded and no email is sent. The API does not store enquiries in a database. Deploy steps, including the contact variables, are in [Production deploy](#production-deploy).

## Production deploy

This app needs a Node.js server at runtime. `POST /api/contact` and the product Route Handlers are not a static file upload. `npm run build` does not migrate the database and does not seed it.

Two profiles share one process:

| Profile | What works | Required server environment |
| --- | --- | --- |
| Marketing only | Public pages and `POST /api/contact` | `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| Full product | Those routes, plus `/login`, `/register`, `/app`, `/api/auth`, and `/api/app` | The marketing variables, plus `DATABASE_URL` and `BETTER_AUTH_SECRET`. Set `BETTER_AUTH_URL` to the deployed origin. |

`/app` reads the database from its layout, so that route fails until `DATABASE_URL` is set and `BETTER_AUTH_SECRET` is present. `/login` and `/register` render without the database. Submitting either form calls `/api/auth`, which fails the same way until both are set. `src/server/auth/auth.ts` rejects a secret shorter than 16 characters. Use at least 32 random characters in production.

### Environment

| Variable | Marketing only | Full product | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Required | Required | Public. Inlined at build time. Production value `https://avasaralab.com`. Changing it needs a new build. |
| `RESEND_API_KEY` | Required for delivery | Required for delivery | Server only. Without it the contact API returns delivery unavailable. |
| `CONTACT_TO_EMAIL` | Required for delivery | Required for delivery | Server only. One inbox. |
| `CONTACT_FROM_EMAIL` | Required for delivery | Required for delivery | Server only. A sender on a domain Resend has verified. |
| `DATABASE_URL` | Omit | Required | Server only. PostgreSQL URL (`postgres://` or `postgresql://`), including the provider’s TLS parameters when it requires them (for example `sslmode=require`). |
| `BETTER_AUTH_SECRET` | Omit | Required | Server only. At least 32 random characters in production. Never commit a real value. |
| `BETTER_AUTH_URL` | Omit | Required | Server only. Absolute origin of this deployment, with no path. Cookie and trusted-origin base in `src/server/auth/auth.ts`. |
| `MODEL_API_KEY` | Omit | Optional | Server only. Empty means live Meta calls are blocked. No other model vendor is called. |
| `REDIS_URL` | Omit | Optional | Server only. Used only when `INGESTION_MODE=queue`. |
| `INGESTION_MODE` | Omit | Optional | Leave unset. The default processes an upload in the request. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Omit | Optional | Server only. When any one is missing, files go to `.data/uploads` on the server disk. |

`NEXT_PUBLIC_SITE_URL` is the only public variable. Do not prefix a secret with `NEXT_PUBLIC_`. The browser never receives Resend keys, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `MODEL_API_KEY`, `REDIS_URL`, or R2 credentials.

`BETTER_AUTH_URL` must match the origin users open. On a temporary host such as `https://example.hostingersite.com`, set it to that origin. After the custom domain is connected, set it to `https://avasaralab.com` and restart so cookies and callbacks use the new origin. It is not the same setting as `NEXT_PUBLIC_SITE_URL` in local development: locally the auth origin is `http://localhost:3000` and the canonical site URL stays `https://avasaralab.com`.

### PostgreSQL

The product schema is PostgreSQL. Drizzle’s dialect in `drizzle.config.ts` is `postgresql`, and `src/server/db/client.ts` uses the `postgres` driver. A MySQL URL will not run `/app`.

Hostinger Web and Cloud hosting do not provide PostgreSQL. Their support article [Which databases and data tools are supported at Hostinger](https://www.hostinger.com/support/which-databases-and-data-tools-are-supported-at-hostinger/) (updated 29 October 2026) says PostgreSQL, Redis, and MongoDB need VPS hosting, and MySQL is what Web and Cloud plans provide. The Node.js article [Connecting a Hostinger MySQL database to a Node.js application](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/) says the same, and the platform’s website-database setup writes `DATABASE_URL` as `mysql://user:password@127.0.0.1:3306/name`. Do not run that setup for this app. It would replace a PostgreSQL URL with a MySQL URL.

Provision PostgreSQL somewhere the Node process can reach, then put that URL in `DATABASE_URL`:

- An external managed PostgreSQL database. Hostinger documents this path for Node.js apps and uses Supabase as the example in [Connecting a Supabase database to a Hostinger Node.js application](https://www.hostinger.com/support/connecting-a-supabase-database-to-a-hostinger-node-js-application/). Hostinger does not change this repository to match the provider. If you paste a Supabase URL yourself, use the pooler string. On a free Supabase project the direct host is IPv6-only. Any other PostgreSQL provider works the same way if the connection string is valid for the `postgres` driver. Confirm the name the host stored is `DATABASE_URL`. A wizard that writes a different name does not configure this app.
- PostgreSQL you operate on a Hostinger VPS. That is the plan Hostinger documents for PostgreSQL, including a one-click PostgreSQL template. You install, patch, back up, and firewall it. Web and Cloud Node hosting still only reaches it if you allow the app’s outbound address.
- The whole app on a host that can run `next start` and reach PostgreSQL, if the Node process should live somewhere other than Hostinger. This repository has no second deploy manifest for that.

Create an empty database. Apply `drizzle/` from a checkout of this repository on a machine that can reach that database. `npm run build` does not migrate. Hostinger’s start command does not migrate. The script reads `DATABASE_URL` and prints `Migrations applied.`

```bash
export DATABASE_URL='postgres://…'   # the database you intend to change; do not commit it
node --experimental-strip-types --import ./scripts/register-test-hooks.mjs scripts/migrate.ts
```

`npm run db:migrate` is the local shortcut. It passes `--env-file=.env.local`, and Node exits if that file is missing. When the file exists, a `DATABASE_URL` already exported in the shell still wins. Run the command again after a later migration lands. Do not point it at production until the URL is the one you mean to change.

### Seed

`npm run db:seed` creates the user `founder@avasara-demo.test` with the password `DemoFounder!2026` and the synthetic organization Avasara Demo Technologies, then ingests synthetic records. The password is in the repository. Running it again does not duplicate events.

Run the seed only on local and other non-production databases. Do not run it on a production database. A production workspace starts empty: register a real account and create an organization in the product.

### Redis, uploads, and the model key

Leave `INGESTION_MODE` unset on Hostinger. The default handles an upload inside the request and still writes an ingestion job. `INGESTION_MODE=queue` needs `REDIS_URL` and a separate process running `npm run worker`. Hostinger starts the Next.js server. It does not start that worker. Web and Cloud plans do not provide Redis. Agency Hosting’s Redis is an object-cache plugin for those sites, not a `REDIS_URL` this worker reads. Queued ingestion needs an external Redis and a process you run yourself.

`.data/uploads` is the fallback file store. A Node deploy replaces the site contents, so files written there do not survive the next deploy. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET` when uploads must be kept. `R2_ENDPOINT` is optional.

Leave `MODEL_API_KEY` unset until you intend to call Meta. The AI screen and `POST /api/app/ai` report that live calls are blocked. Do not put a substitute provider in its place.

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

`next.config.ts` exports an object, which Hostinger can wrap with `output: "standalone"`. Do not change that export into a function.

Deploy from GitHub only after the site is on `main`:

1. In hPanel, open Websites → Add Website → Node.js web app → Import Git repository.
2. Connect the Hostinger GitHub App to the account that can read `Avasara-Lab/website`.
3. Select that repository and the `main` branch. Keep the root directory at the repository root.
4. Confirm the framework is Next.js, the build script is `build`, and the output directory is `.next`.
5. On the same screen, open Set environment variables and add the names for the profile you are deploying. Add the Resend values only after the sending domain is verified. For the full product, add the PostgreSQL `DATABASE_URL` and the Better Auth values. Do not add Hostinger’s MySQL `DATABASE_URL`. Save. Hostinger injects these into the build and the running server, then redeploys when they change. The API that replaces Node.js environment variables replaces the whole set: a name omitted from that call is deleted. `NEXT_PUBLIC_SITE_URL` is read at build time, so a change to it needs a new build.
6. Deploy. Later pushes to `main` trigger another build. The deployment log is under Deployments.
7. Apply migrations against the production database before anyone uses `/app`. The build does not apply them.

Do not remove the current `avasaralab.com` website to make room for this app until you have chosen to replace it. Hostinger’s “domain already added” flow can require changing the main domain and removing the existing website. That would replace whatever is live today. Connect the custom domain only after the Node.js app is running on Hostinger’s temporary domain and you have authorized the DNS change. If Cloudflare proxies the domain, set the SSL mode to Full after the records point at Hostinger. When the public origin changes, update `BETTER_AUTH_URL` to that origin.

### Secrets

`.gitignore` ignores `.env*` and keeps `.env.example`. Do not commit production URLs, API keys, or the auth secret. Set them in the host’s environment UI. Hostinger masks stored values on read. Do not copy a masked value back into a replace call.

Server-only names: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MODEL_API_KEY`, `REDIS_URL`, and the `R2_*` keys. They are read in server modules. They are not `NEXT_PUBLIC_` variables.

### Smoke checklist

Marketing, on either profile:

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

Non-production database only:

- Run `npm run db:seed`.
- Sign in as `founder@avasara-demo.test`. The workspace says the company is synthetic.

## Opportunity Intelligence application

The marketing pages stay on `/`, `/services`, `/products`, `/about`, and `/contact`. The authenticated product lives under `/app`. Register at `/register`. Architecture choices, including why the first release uses Next.js Route Handlers instead of a separate Fastify process, are in `ARCHITECTURE.md`.

### Local setup

PostgreSQL is required. Redis is required only when ingestion is queued. Copy the environment file and set the database URL plus a random auth secret of at least 32 characters:

```bash
cp .env.example .env.local
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in to the seeded synthetic company with `founder@avasara-demo.test` and `DemoFounder!2026`. That company is labeled synthetic. Its counts are not customer results.

`npm run db:seed` creates the user through Better Auth and ingests the synthetic records through the same pipeline as an upload. Running it again does not duplicate events. Use it on local and other non-production databases. The password is in this repository, so do not seed a production database. Production migration and seed rules are in [Production deploy](#production-deploy).

Set `MODEL_API_KEY` to call Meta Model API at `https://api.meta.ai/v1`. Without it, AI configuration reports that live calls are blocked. The app does not call another model vendor. Optional R2 variables switch uploads from `.data/uploads` to Cloudflare R2. Set `INGESTION_MODE=queue` and `REDIS_URL`, then run `npm run worker`, to process uploads with BullMQ. The default processes an upload in the request and still writes an ingestion job.

### Checks

```bash
npm test
npm run lint
npm run build
```

`npm test` includes the contact-form tests and a PostgreSQL critical-path test. That test expects `postgres://avasara:avasara@127.0.0.1:5432/avasara_test`. Create that database before running the suite, or point the test at another database by editing the connection string in `src/server/critical-path.test.ts`.

### Product behavior that is intentionally incomplete

- HubSpot, Gmail, Slack, Notion, ClickUp, and QuickBooks are listed as needing configuration. Credentials are not stored and no sync is pretended.
- The support agent writes to a simulated inbox. The log says simulated.
- Sales follow-up and reporting recommendations have no executor.
- Muse Spark Open and Muse Glimmer are open-weight and are not called on the hosted API. SAM 3.1 is documented and not requested, because this release does not assemble a media-segmentation body.
- Invitation email is not sent. The owner is shown a one-time accept path.

## Product status

Feedback Intelligence is a synthetic demo. Opportunity Intelligence is the authenticated application in this repository. The seeded company and its metrics are synthetic. The contact form still delivers only after Resend returns a message id.
