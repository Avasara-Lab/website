import { ButtonLink } from "@/components/button-link";
import { ProductSiteFooter } from "@/components/product-site-footer";
import { ProductSiteHeader } from "@/components/product-site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { opportunity } from "@/lib/opportunity";

export default async function NotFound() {
  const showMarketing = await marketingSiteIsVisible();
  return (
    <>
      {showMarketing ? <SiteHeader /> : <ProductSiteHeader />}
      <main id="content" className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col px-5 py-24 md:px-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">404</p>
          <h1 className="mt-3 text-4xl font-medium text-navy">This page is not on the site.</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            {showMarketing
              ? "The address does not match a published page. You can return home or go to the project enquiry form."
              : "The address does not match a published page. You can return home or open the live demo."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Back home</ButtonLink>
            {showMarketing ? (
              <ButtonLink href="/contact" variant="secondary">
                Discuss Your Project
              </ButtonLink>
            ) : (
              <ButtonLink href={opportunity.demoLogin} variant="secondary">
                Try the live demo
              </ButtonLink>
            )}
          </div>
        </section>
      </main>
      {showMarketing ? <SiteFooter /> : <ProductSiteFooter />}
    </>
  );
}
