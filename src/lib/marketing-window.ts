/**
 * The studio marketing homepage is hidden until 16 November 2026, 00:00 UTC.
 * `/` shows Opportunity Intelligence during that window. The original homepage
 * stays in `src/components/marketing/home-page.tsx` and is also served, with
 * noindex and no navigation links, at `/company`.
 *
 * Restore the marketing site:
 * 1. Set `SHOW_MARKETING_SITE` below to `true` and redeploy, or
 * 2. Set the server environment variable `MARKETING_SITE=on` and redeploy, or
 * 3. Do nothing. After `MARKETING_RETURNS_AT` the cached check flips on its
 *    own. `marketingSiteIsVisible` uses `cacheLife("hours")`, so the public
 *    homepage updates on the server refresh after that instant (about an hour).
 *
 * `MARKETING_SITE=off` keeps the product landing even after the return instant.
 * Header and footer links to Services, Products, About, Contact, How it works,
 * and Feedback Intelligence follow the same switch.
 */

export const SHOW_MARKETING_SITE = false;

export const MARKETING_RETURNS_AT = "2026-11-16T00:00:00.000Z";

const RETURN_AT = Date.parse(MARKETING_RETURNS_AT);

const ON = new Set(["on", "1", "true"]);
const OFF = new Set(["off", "0", "false"]);

export function marketingSiteVisible(
  now: number,
  flag: string | undefined,
  force = SHOW_MARKETING_SITE,
): boolean {
  if (force) return true;
  const value = flag?.trim().toLowerCase();
  if (value && ON.has(value)) return true;
  if (value && OFF.has(value)) return false;
  return now >= RETURN_AT;
}
