import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb, type AppDatabase } from "@/server/db/client";
import * as schema from "@/server/db/schema";

const globalForAuth = globalThis as unknown as { avasaraAuth?: ReturnType<typeof createAuth> };

export function createAuth(database: AppDatabase) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("BETTER_AUTH_SECRET must be set to at least 16 characters.");
  }
  const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return betterAuth({
    secret,
    baseURL,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(database, { provider: "pg", schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    plugins: [nextCookies()],
  });
}

export function getAuth(): ReturnType<typeof createAuth> {
  const existing = globalForAuth.avasaraAuth;
  if (existing) return existing;
  const created = createAuth(getDb());
  globalForAuth.avasaraAuth = created;
  return created;
}
