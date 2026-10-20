import { handleContactRequest } from "@/lib/contact-handler";
import { createResendMailer, readMailConfig } from "@/lib/mailer";
import { createMemoryRateLimiter } from "@/lib/rate-limit";

/**
 * Process-local limit of 8 submissions per 15 minutes.
 * Swap this for a shared RateLimiter before relying on it across instances.
 * See `RateLimiter` in src/lib/rate-limit.ts.
 */
const limiter = createMemoryRateLimiter({
  limit: 8,
  windowMs: 15 * 60 * 1000,
});

export async function POST(request: Request) {
  const config = readMailConfig();
  return handleContactRequest(request, {
    mailer: config ? createResendMailer(config) : null,
    limiter,
  });
}
