import type { MetadataRoute } from "next";
import { servicePages } from "@/lib/services-catalog";
import { site } from "@/lib/site";

const paths = [
  "/",
  "/services",
  ...servicePages.map((page) => `/services/${page.slug}`),
  "/products",
  "/products/feedback-intelligence",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: new URL(path, site.url).toString(),
    lastModified: "2026-10-20",
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
