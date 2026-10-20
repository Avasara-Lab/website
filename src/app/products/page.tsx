import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section, StatusNote } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Avasara Lab product directions: Feedback Intelligence as an early experiment with a synthetic demo, and Opportunity Intelligence as a longer-term vision. Neither is for sale.",
  path: "/products",
});

const bands = [
  {
    label: "Available now",
    title: "Scoped project work",
    text: "Companies can engage Avasara Lab today for automation, custom AI software, and feedback analysis delivered as a project. That work is scoped, built, and measured with the team. It is not a self-serve product.",
    href: "/services",
    link: "Review services",
  },
  {
    label: "Early experiment",
    title: "Feedback Intelligence",
    text: "An early product direction for reading customer feedback, grouping themes, ranking issues, and recommending a next step. The page includes an interactive demo with synthetic examples. It is not a live product and it is not for purchase.",
    href: "/products/feedback-intelligence",
    link: "Open the demo",
  },
  {
    label: "Longer-term vision",
    title: "Opportunity Intelligence",
    text: "A future system that would help a business find where automation and AI could create measurable value. It remains a direction for later product work. There is no prototype to use.",
    href: "/products#opportunity",
    link: "Read the vision",
  },
] as const;

export default function ProductsPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>Products</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
          What is real today, and what is still ahead.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          Avasara Lab intends to build products that can stand on their own.
          Until those products exist, the commercial work is project delivery.
        </p>
        <div className="mt-8 max-w-3xl">
          <StatusNote>
            No product on this site is live, production-ready, or available for
            purchase. The demo uses synthetic examples written for the interface.
          </StatusNote>
        </div>
      </Section>

      <Section tone="paper">
        <ol className="grid gap-4">
          {bands.map((band, index) => (
            <li
              key={band.title}
              className="rounded-xl border border-line bg-white p-6 sm:p-8"
            >
              <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                <p className="font-mono text-xs text-cyan lg:col-span-2">0{index + 1}</p>
                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold tracking-[0.14em] text-navy uppercase">
                    {band.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-navy">{band.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{band.text}</p>
                </div>
                <div className="lg:col-span-3 lg:text-right">
                  <Link
                    href={band.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
                  >
                    {band.link}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="opportunity">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Opportunity Intelligence</Eyebrow>
            <h2 className="text-3xl font-semibold text-navy">
              A system for finding the next useful automation.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-6 text-muted">
            <p>
              The longer-term idea is a product that watches operational
              signals, such as repeated tasks, queue spikes, and unresolved
              feedback, and points to where an automation or AI workflow could
              change a measurable outcome.
            </p>
            <p>
              A credible version would need a source of real operating data, a
              way for the team to accept or reject a suggestion, and a record
              of what happened after the change. None of that is built.
            </p>
            <p>
              If a current process already shows that kind of opportunity, the
              practical path is a scoped project, not a wait for this product.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
