import { Suspense } from "react";
import { SiteFooterSwitch, SiteHeaderSwitch } from "@/components/site-chrome";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const showMarketing = await marketingSiteIsVisible();
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line bg-background" />}>
        <SiteHeaderSwitch showMarketing={showMarketing} />
      </Suspense>
      <main id="content" className="flex-1">
        {children}
      </main>
      <Suspense fallback={null}>
        <SiteFooterSwitch showMarketing={showMarketing} />
      </Suspense>
    </>
  );
}
