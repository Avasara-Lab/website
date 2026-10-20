import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { CtaBand } from "@/components/cta-band";
import { Section, Eyebrow } from "@/components/section";
import { SignalConsole } from "@/components/signal-console";
import { problems, services, steps, useCases } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Turn Business Problems Into AI Opportunities",
  description:
    "Avasara Lab builds practical AI products, intelligent automations, and custom software that help growing businesses work smarter, make better decisions, and scale faster.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <section className="hero-grid border-b border-line">
        <div className="mx-auto w-full max-w-6xl px-5 pt-16 pb-16 md:px-8 md:pt-24 md:pb-20">
          <Eyebrow>AI technology partner</Eyebrow>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold text-balance text-navy sm:text-5xl lg:col-span-8 lg:text-6xl">
              Turn Business Problems Into AI Opportunities.
            </h1>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="text-base leading-7 text-muted">
                We build practical AI products, intelligent automations, and
                custom software that help growing businesses work smarter, make
                better decisions, and scale faster.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contact" arrow>
                  Discuss Your Project
                </ButtonLink>
                <ButtonLink href="/products" variant="secondary">
                  Explore Our Products
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <SignalConsole />
          </div>
        </div>
      </section>

      <Section tone="paper">
        <div className="max-w-2xl">
          <Eyebrow>Where the work starts</Eyebrow>
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
            Operational problems with a visible signal.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Avasara Lab works with founders, product leaders, and operations
            teams when a repeating process, a pile of feedback, or a manual
            handoff is slowing the business down.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2">
          {problems.map((problem, index) => (
            <li key={problem.title} className="rounded-xl border border-line bg-white p-6">
              <p className="font-mono text-xs text-cyan">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-navy">{problem.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{problem.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Services</Eyebrow>
            <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
              Three ways to turn a problem into a build.
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            Review how projects are scoped
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.id}
              className="flex flex-col rounded-xl border border-line p-6"
            >
              <h3 className="text-xl font-semibold text-navy">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                {service.summary}
              </p>
              <Link
                href={`/services#${service.id}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy"
              >
                See this service
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section id="how-we-work" tone="paper">
        <div className="max-w-2xl">
          <Eyebrow>How we work</Eyebrow>
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
            Discover, design, build, measure.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Projects begin with a defined business problem, a scoped solution,
            and measurable success criteria.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.name} className="rounded-xl border border-line bg-white p-5">
              <p className="font-mono text-xs text-cyan">0{index + 1}</p>
              <h3 className="mt-4 text-lg font-semibold text-navy">{step.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Eyebrow>Products</Eyebrow>
        <h2 className="max-w-2xl text-3xl font-semibold text-navy sm:text-4xl">
          Early product direction, separate from project work.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Paid work today is scoped project delivery. The product directions
          below are not live, production-ready, or available for purchase.
        </p>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-line p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.14em] text-cyan uppercase">
              Early direction
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-navy">
              Feedback Intelligence
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              A direction for reading customer feedback and support
              conversations, naming recurring themes, ranking problems for
              investigation, and attaching a recommended action.
            </p>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-ink">
              <li>Analyze customer feedback and support conversations.</li>
              <li>Identify recurring themes and potential product issues.</li>
              <li>Prioritize problems for investigation.</li>
              <li>Turn insights into recommended actions.</li>
            </ul>
            <Link
              href="/products/feedback-intelligence"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy"
            >
              View the synthetic demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
          <article
            id="opportunity"
            className="scroll-mt-24 rounded-xl border border-navy bg-navy p-6 text-white sm:p-8"
          >
            <p className="text-xs font-semibold tracking-[0.14em] text-cyan-soft uppercase">
              Longer-term vision
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Opportunity Intelligence</h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              A future system for finding where automation and AI could create
              measurable value. It would connect operational signals to a
              recommended opportunity, a likely owner, and a way to judge the
              result.
            </p>
            <p className="mt-5 text-sm leading-6 text-white/75">
              This is a product vision. There is no build to try, and it is not
              part of a current offer.
            </p>
            <Link
              href="/products#opportunity"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              Read the roadmap note
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </Section>

      <Section tone="paper">
        <div className="max-w-2xl">
          <Eyebrow>Illustrative use cases</Eyebrow>
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">
            The shape of the work, not a client list.
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            These are illustrative situations. They are not completed client
            projects, and they do not describe a named customer.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {useCases.map((item) => (
            <article key={item.title} className="rounded-xl border border-line bg-white p-6">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan uppercase">
                Illustrative use case
              </p>
              <h3 className="mt-3 text-xl font-semibold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
