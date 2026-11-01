import { createMemoryRateLimiter } from "@/lib/rate-limit";
import { getAuth } from "@/server/auth/auth";
import { ORG_COOKIE, listMemberships } from "@/server/auth/context";
import { getDb, type AppDatabase } from "@/server/db/client";
import { canAdminister, canWrite, type Role } from "@/server/domain";

const limiter = createMemoryRateLimiter({ limit: 60, windowMs: 60_000 });

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && "status" in error && typeof error.status === "number") {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "The request could not be completed." }, { status: 500 });
}

export async function guard(request: Request, level: "read" | "write" | "admin" = "read") {
  assertSameOrigin(request);
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw new HttpError("Sign in required.", 401);
  const limit = await limiter.consume(session.user.id);
  if (!limit.allowed) throw new HttpError("Too many requests. Wait a minute and try again.", 429);
  const db = getDb();
  const memberships = await listMemberships(db, session.user.id);
  const requested = readCookie(request, ORG_COOKIE);
  const current = memberships.find((item) => item.organizationId === requested) ?? memberships[0];
  if (!current) throw new HttpError("Create an organization before using the application.", 409);
  if (level === "write" && !canWrite(current.role)) throw new HttpError("Your role cannot change this organization.", 403);
  if (level === "admin" && !canAdminister(current.role)) throw new HttpError("An owner or administrator has to do that.", 403);
  return {
    db,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    organizationId: current.organizationId,
    role: current.role as Role,
  };
}

export function orgCookie(organizationId: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ORG_COOKIE}=${organizationId}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function assertSameOrigin(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return;
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) throw new HttpError("The request origin is missing.", 403);
  if (new URL(origin).host !== host) throw new HttpError("The request origin was rejected.", 403);
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export type Guard = {
  db: AppDatabase;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  role: Role;
};
