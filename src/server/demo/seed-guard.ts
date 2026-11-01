const PRODUCTION_DATABASE_MARKERS = ["gxrifaedgzkagvvrmmim"];

export function seedRefusal(env: Record<string, string | undefined>): string | null {
  if ((env.NODE_ENV ?? "").trim().toLowerCase() === "production") {
    return "npm run db:seed refuses to run when NODE_ENV is production. It loads a synthetic company and a password stored in this repository.";
  }
  const host = hostnameOf(env.BETTER_AUTH_URL);
  if (host === "avasaralab.com" || host === "www.avasaralab.com") {
    return "npm run db:seed refuses to run when BETTER_AUTH_URL is the production origin. Use it only on a non-production database.";
  }
  const database = env.DATABASE_URL ?? "";
  if (PRODUCTION_DATABASE_MARKERS.some((marker) => database.includes(marker))) {
    return "npm run db:seed refuses to run against the production database. The synthetic company is not customer data.";
  }
  return null;
}

function hostnameOf(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}
