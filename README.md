# Avasara Lab

Marketing site for Avasara Lab, an AI technology partner for US B2B SaaS startups and growing businesses.

The site presents services, an early Feedback Intelligence demo, and a project enquiry form. It does not invent clients, metrics, or a live product.

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
- `/products`
- `/products/feedback-intelligence`
- `/about`
- `/contact`

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored. Never commit real credentials.

Set `NEXT_PUBLIC_SITE_URL` to the public site origin, including the scheme, before production. Canonical URLs, the sitemap, robots, and social metadata use it. When the variable is unset, those URLs use `http://localhost:3000`.

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

Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and `NEXT_PUBLIC_SITE_URL` in the hosting provider’s environment. Redeploy after changing them. Confirm a real enquiry arrives in `CONTACT_TO_EMAIL` before announcing the form.

The endpoint also applies a process-local limit of 8 requests per 15 minutes per address in `x-forwarded-for`. That counter resets when the process restarts and is not shared across serverless instances, so it is not sufficient protection on its own for a multi-instance deploy. Replace the limiter in `src/app/api/contact/route.ts` with a `RateLimiter` from `src/lib/rate-limit.ts` backed by Redis or Upstash when that shared storage is available. The address is used only for that in-memory count.

The honeypot field `company_website` must stay empty. A filled honeypot is discarded and no email is sent. The API does not store enquiries in a database.

## Product status

Feedback Intelligence is an early direction with a synthetic demo. Opportunity Intelligence is a longer-term vision. Neither is live, production-ready, or for sale.
