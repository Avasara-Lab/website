import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export const site = {
  name: "Avasara Lab",
  tagline: "Turn business signals into automation opportunities.",
  description:
    "Avasara Lab helps growing businesses turn operational challenges into practical AI solutions, intelligent automation, and actionable business insights.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/#how-we-work", label: "How We Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
    },
    twitter: {
      title: `${title} · ${site.name}`,
      description,
    },
  };
}
