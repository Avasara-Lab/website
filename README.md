# Avasara Lab

Marketing site for Avasara Lab, an AI engineering and intelligent automation company for US and global B2B teams.

The homepage line is “Find the opportunity. Build the intelligence. Automate the outcome.” The supporting idea is the tagline: turn business signals into automation opportunities. The site presents six service categories, an early Feedback Intelligence demo, and a project enquiry form. It does not invent clients, metrics, certifications, or a live product.

## Design

Black, white, and gray are the brand. Blue is the technology accent. Orange marks opportunities and the occasional highlight. The values live as CSS variables in `src/app/globals.css`, with a light set and a dark set.

The navigation control cycles Light, Dark, and System. The choice is stored in `localStorage` as `avasara-theme`. A blocking script in the document head applies it before the first paint, so a saved dark theme does not flash white. With nothing stored, the site follows the operating system.

Type is Inter, loaded through `next/font`.

On a phone, the hero stacks the headline, the paragraph, the two actions, and a vertical Opportunity Intelligence path. On a large screen that same path sits beside the copy, so the diagram is in the first view instead of under a split headline. Opportunity Intelligence is a strategic direction. The path uses synthetic notes and is not a product a customer can log into.

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

The service pages are generated from `src/lib/services-catalog.ts`. The six categories are AI agents and intelligent automation, generative AI and knowledge systems, data engineering and business intelligence, custom software and product engineering, AI infrastructure and implementation, and AI-powered growth and opportunity intelligence.

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored. Never commit real credentials.

Set `NEXT_PUBLIC_SITE_URL` to an absolute origin, including `https://`, before production. Canonical URLs, the sitemap, robots, and social metadata use it. When the variable is unset, those URLs use `https://avasaralab.com`. A hostname without a scheme, including `www.avasaralab.com`, is normalized to that same origin. `www` is not the canonical host. Any other malformed value fails the build.

The contact form needs three server-only variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

No other API keys are required. The site does not call an analysis or CRM service.

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

### Production

This app needs a Node.js server at runtime. `POST /api/contact` is a Route Handler, so a static file upload is not enough.

Hostinger Business web hosting can run it as a Node.js web app. Hostinger’s docs say Business plans include Node.js websites, run Next.js in server mode with API routes, and rebuild from GitHub on each push to the connected branch. Confirmed settings from those docs:

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
5. On the same screen, open Set environment variables and add the four names below. Add the Resend values only after the sending domain is verified. Save. Hostinger injects these into the build and the running server, then redeploys when they change.
6. Deploy. Later pushes to `main` trigger another build. The deployment log is under Deployments.

Do not remove the current `avasaralab.com` website to make room for this app until you have chosen to replace it. Hostinger’s “domain already added” flow can require changing the main domain and removing the existing website. That would replace whatever is live today. Connect the custom domain only after the Node.js app is running on Hostinger’s temporary domain and you have authorized the DNS change. If Cloudflare proxies the domain, set the SSL mode to Full after the records point at Hostinger.

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://avasaralab.com` |
| `RESEND_API_KEY` | Resend API key, set in hPanel only |
| `CONTACT_TO_EMAIL` | The one inbox that should receive enquiries |
| `CONTACT_FROM_EMAIL` | A sender on a domain Resend has verified |

`NEXT_PUBLIC_SITE_URL` is public and is also the code fallback. The other three stay server-side. Confirm a real enquiry arrives in `CONTACT_TO_EMAIL` before announcing the form. Email delivery is not confirmed until Resend accepts a real send.

The endpoint also applies a process-local limit of 8 requests per 15 minutes per address in `x-forwarded-for`. That counter resets when the process restarts and is not shared across serverless instances, so it is not sufficient protection on its own for a multi-instance deploy. Replace the limiter in `src/app/api/contact/route.ts` with a `RateLimiter` from `src/lib/rate-limit.ts` backed by Redis or Upstash when that shared storage is available. The address is used only for that in-memory count.

The honeypot field `company_website` must stay empty. A filled honeypot is discarded and no email is sent. The API does not store enquiries in a database.

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

`npm run db:seed` creates the user through Better Auth and ingests the synthetic records through the same pipeline as an upload. Running it again does not duplicate events.

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
