import type { Metadata } from "next";
import { resolveSiteUrl } from "./site-url";

export const site = {
  name: "Avasara Lab",
  tagline: "Turn business signals into automation opportunities.",
  description:
    "We help ambitious businesses turn operational challenges, customer signals, and disconnected workflows into intelligent software, AI-powered automation, and measurable business improvements.",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
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
      card: "summary_large_image",
      title: `${title} · ${site.name}`,
      description,
    },
  };
}
