import type { MetadataRoute } from "next";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { servicePages } from "@/lib/services-catalog";
import { site } from "@/lib/site";

const marketingPaths = [
  "/",
  "/services",
  ...servicePages.map((page) => `/services/${page.slug}`),
  "/products",
  "/products/feedback-intelligence",
  "/about",
  "/contact",
  "/how-it-works",
  "/features",
  "/login",
  "/register",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing = await marketingSiteIsVisible();
  const paths = marketing ? marketingPaths : ["/", "/login", "/register"];
  return paths.map((path) => ({
    url: new URL(path, site.url).toString(),
    lastModified: marketing ? "2026-10-21" : "2026-11-06",
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
