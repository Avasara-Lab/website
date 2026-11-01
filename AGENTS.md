<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

This is the Avasara Lab marketing site plus the Opportunity Intelligence application. Do not invent clients, testimonials, or customer metrics. Feedback Intelligence is a synthetic demo. The seeded company “Avasara Demo Technologies” is synthetic and must stay labeled that way. The contact form posts to `/api/contact` and sends mail with Resend. Do not claim an enquiry was delivered unless the provider returns a message id. `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` stay in the environment. The in-memory rate limiter is single-process only. Meta model calls use `MODEL_API_KEY` on the server only. If that key is missing, say the call is blocked. Do not substitute another model provider.
