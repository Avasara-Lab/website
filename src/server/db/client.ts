import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { avasaraSql?: ReturnType<typeof postgres> };

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and point it at PostgreSQL.");
  }
  return url;
}

export function getDb(): AppDatabase {
  if (!globalForDb.avasaraSql) {
    globalForDb.avasaraSql = postgres(getDatabaseUrl(), { max: 10 });
  }
  return drizzle(globalForDb.avasaraSql, { schema });
}

export function createDb(url: string): AppDatabase {
  return drizzle(postgres(url, { max: 1 }), { schema });
}
