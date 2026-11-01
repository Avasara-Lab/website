import { CtaBand } from "@/components/cta-band";
import { ButtonLink } from "@/components/button-link";
import { Eyebrow, Section, StatusNote } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Feedback Intelligence is an early Avasara Lab direction with a synthetic demo. Opportunity Intelligence is a longer-term vision, not a finished platform.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>Products</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-medium text-navy sm:text-6xl">
          Early product directions beside the service work.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          The company tagline remains the point: turn business signals into automation opportunities. The products below are how that idea may become software. Neither is a mature enterprise platform.
        </p>
      </Section>
      <Section tone="paper">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="panel rounded-xl p-7">
            <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">Early direction</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Feedback Intelligence</h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              A working demonstration that groups synthetic reviews, tickets, and notes into themes, severity, and a recommended next step. It does not connect to a customer&apos;s live tools.
            </p>
            <div className="mt-6">
              <ButtonLink href="/products/feedback-intelligence" arrow>
                Open the synthetic demo
              </ButtonLink>
            </div>
          </article>
          <article className="rounded-xl border border-line bg-inverse p-7 text-on-inverse">
            <p className="text-xs font-semibold tracking-[0.14em] text-orange uppercase">Longer-term vision</p>
            <h2 className="mt-3 text-4xl font-semibold">Opportunity Intelligence</h2>
            <p className="mt-4 text-sm leading-6 text-on-inverse/75">
              The longer aim is a system that connects signals, opportunities, and the workflow that follows. Today that work happens as a scoped engagement, not as a product you can log into.
            </p>
          </article>
        </div>
        <div className="mt-8">
          <StatusNote>
            Service engagements are the way to start. The demos explain the shape of the work. They do not report client results.
          </StatusNote>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
