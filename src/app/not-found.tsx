import { ButtonLink } from "@/components/button-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
    <SiteHeader />
    <main id="content" className="flex-1">
    <section className="mx-auto flex w-full max-w-6xl flex-col px-5 py-24 md:px-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">
        404
      </p>
      <h1 className="mt-3 text-4xl font-medium text-navy">This page is not on the site.</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">
        The address does not match a published page. You can return home or
        go to the project enquiry form.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Discuss Your Project
        </ButtonLink>
      </div>
    </section>
    </main>
    <SiteFooter />
    </>
  );
}
