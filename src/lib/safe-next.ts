const SEGMENT = /^[A-Za-z0-9_-]+$/;

/** Keeps post-login navigation inside the product. Anything else opens Overview. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || value.length > 200) return "/app";
  if (!value.startsWith("/app") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return "/app";
  }
  if (/[\u0000-\u001f\s]/.test(value)) return "/app";
  const path = value.split("#")[0]?.split("?")[0] ?? "";
  const segments = path.split("/").slice(1);
  if (segments[0] !== "app") return "/app";
  if (segments.some((part) => part === "" || part === "." || part === ".." || !SEGMENT.test(part))) {
    return "/app";
  }
  return path;
}
