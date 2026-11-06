"use client";

import { usePathname } from "next/navigation";
import { ProductSiteFooter } from "@/components/product-site-footer";
import { ProductSiteHeader } from "@/components/product-site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteHeaderSwitch({ showMarketing }: { showMarketing: boolean }) {
  const pathname = usePathname();
  if (showMarketing || pathname === "/company") return <SiteHeader />;
  return <ProductSiteHeader />;
}

export function SiteFooterSwitch({ showMarketing }: { showMarketing: boolean }) {
  const pathname = usePathname();
  if (showMarketing || pathname === "/company") return <SiteFooter />;
  return <ProductSiteFooter />;
}
