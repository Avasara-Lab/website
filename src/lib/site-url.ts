export const canonicalSiteUrl = "https://avasaralab.com";

export function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) return canonicalSiteUrl;

  let url: URL;
  try {
    url = new URL(withProtocol(value));
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an absolute http(s) origin. Received ${displayValue(value)}.`,
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must use http or https. Received ${displayValue(value)}.`,
    );
  }
  if (url.username || url.password) {
    throw new Error("NEXT_PUBLIC_SITE_URL must not include credentials.");
  }
  if ((url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be an origin without a path, query, or hash. Received ${displayValue(value)}.`,
    );
  }

  const hostname =
    url.hostname.toLowerCase() === "www.avasaralab.com" ? "avasaralab.com" : url.hostname.toLowerCase();
  const protocol = hostname === "avasaralab.com" ? "https:" : url.protocol;
  const port = url.port ? `:${url.port}` : "";
  return `${protocol}//${hostname}${port}`;
}

function withProtocol(value: string): string {
  if (value.startsWith("//")) return `https:${value}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

function displayValue(value: string): string {
  if (value.includes("@") || value.length > 200) return "an invalid value";
  return JSON.stringify(value);
}
