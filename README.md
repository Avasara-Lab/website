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

Set `NEXT_PUBLIC_SITE_URL` to the public site origin, including the scheme, before production. Canonical URLs, the sitemap, robots, and social metadata use it. When the variable is unset, those URLs use `http://localhost:3000`.

No API keys are required. The site does not call an external analysis, email, or CRM service.

## Enquiry form

The contact form validates in the browser and prepares a copy of the enquiry. It does not send email. `hello@avasaralab.com` is a placeholder and is not a monitored inbox.

## Product status

Feedback Intelligence is an early direction with a synthetic demo. Opportunity Intelligence is a longer-term vision. Neither is live, production-ready, or for sale.
