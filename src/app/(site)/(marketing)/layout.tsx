import type { Metadata } from "next";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";

export async function generateMetadata(): Promise<Metadata> {
  if (await marketingSiteIsVisible()) return {};
  return { robots: { index: false, follow: false } };
}

export default function MarketingSectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
