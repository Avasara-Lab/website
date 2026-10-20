import {
  deliveryMessages,
  maxBodyBytes,
  parseEnquiry,
  type Enquiry,
} from "./enquiry";
import type { Mailer } from "./mailer";
import { clientRateKey, type RateLimiter } from "./rate-limit";

export type ContactDeps = {
  mailer: Mailer | null;
  limiter: RateLimiter;
  now?: () => Date;
  rateKey?: (request: Request) => string;
};

export async function handleContactRequest(
  request: Request,
  deps: ContactDeps,
): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ delivered: false, error: "unsupported", message: deliveryMessages.failed }, 415);
  }

  const claimedLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(claimedLength) && claimedLength > maxBodyBytes) {
    return json({ delivered: false, error: "payload", message: deliveryMessages.tooLarge }, 413);
  }

  const limit = await deps.limiter.consume((deps.rateKey ?? clientRateKey)(request));
  if (!limit.allowed) {
    return json(
      { delivered: false, error: "rate_limit", message: deliveryMessages.rateLimited },
      429,
      { "retry-after": String(limit.retryAfterSeconds) },
    );
  }

  const raw = await readLimitedBody(request);
  if (raw === null) {
    return json({ delivered: false, error: "payload", message: deliveryMessages.tooLarge }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(
      {
        delivered: false,
        error: "validation",
        message: deliveryMessages.failed,
        fields: { challenge: "Send the enquiry as JSON." },
      },
      400,
    );
  }

  const parsed = parseEnquiry(payload);
  if (!parsed.ok && parsed.honeypot) {
    return json({ delivered: false, accepted: true }, 200);
  }
  if (!parsed.ok) {
    return json(
      { delivered: false, error: "validation", message: deliveryMessages.failed, fields: parsed.fields },
      400,
    );
  }

  if (!deps.mailer) {
    return json(
      { delivered: false, error: "delivery", message: deliveryMessages.unavailable },
      503,
    );
  }

  const submittedAt = (deps.now ?? (() => new Date()))().toISOString();
  try {
    const result = await deps.mailer.send(parsed.enquiry, submittedAt);
    if (!result.id) {
      return json({ delivered: false, error: "delivery", message: deliveryMessages.failed }, 502);
    }
    console.info(`contact enquiry accepted by email provider id=${result.id}`);
    return json({ delivered: true }, 200);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown delivery error";
    console.error(`contact enquiry delivery failed: ${detail}`);
    return json({ delivered: false, error: "delivery", message: deliveryMessages.failed }, 502);
  }
}

async function readLimitedBody(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBodyBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function json(body: unknown, status: number, extraHeaders?: Record<string, string>) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export type { Enquiry };
