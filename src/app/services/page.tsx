import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section } from "@/components/section";
import { scopeItems, services, steps } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI and workflow automation, custom AI development, and data and feedback intelligence. Avasara Lab scopes each project around a business problem and measurable success criteria.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>Services</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
          Practical builds for a defined operational problem.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          Avasara Lab designs and builds AI solutions with the team that will
          use them. Each engagement has a written scope, a first version, and
          a way to judge whether it helped.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          Discuss Your Project
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Section>

      {services.map((service, index) => (
        <Section
          key={service.id}
          id={service.id}
          tone={index % 2 === 0 ? "paper" : "white"}
        >
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-cyan">0{index + 1}</p>
              <h2 className="mt-3 text-3xl font-semibold text-navy">{service.title}</h2>
              <p className="mt-4 text-base leading-7 text-muted">{service.detail}</p>
              <Link
                href={`/contact?help=${service.id}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy"
              >
                Discuss this work
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="lg:col-span-7">
              <h3 className="text-sm font-semibold tracking-[0.14em] text-navy uppercase">
                Typical deliverables
              </h3>
              <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
                {service.deliverables.map((item) => (
                  <li key={item} className="px-5 py-4 text-sm leading-6 text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ))}

      <Section id="process" tone="paper">
        <Eyebrow>Engagement</Eyebrow>
        <h2 className="max-w-2xl text-3xl font-semibold text-navy sm:text-4xl">
          Four steps, with the problem written down first.
        </h2>
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
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Scoping</Eyebrow>
            <h2 className="text-3xl font-semibold text-navy">
              The scope is agreed before the build.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              A discovery conversation becomes a short written scope. Build
              work starts after that scope is clear enough to review. Later
              phases are separate decisions, based on what the first phase
              showed.
            </p>
          </div>
          <ul className="rounded-xl border border-line">
            {scopeItems.map((item) => (
              <li
                key={item}
                className="border-b border-line px-5 py-4 text-sm leading-6 text-ink last:border-b-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand
        title="Bring one problem to the first conversation."
        copy="Tell us what is slowing the team down. We will help you decide whether it is an automation, a custom build, or a feedback question."
      />
    </>
  );
}
