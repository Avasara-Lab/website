import { CapabilityStrip } from "@/components/capability-strip";
import { CtaBand } from "@/components/cta-band";
import { DemoStage } from "@/components/demo-stage";
import { HeroFlow } from "@/components/hero-flow";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { ServiceIcon } from "@/components/service-icon";
import { Eyebrow } from "@/components/section";
import { serviceCategories } from "@/lib/services-catalog";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Find the opportunity. Build the intelligence. Automate the outcome.",
  description: site.description,
  path: "/",
});

const capabilities = [
  {
    title: "Discover opportunities",
    text: "Identify business problems, operational inefficiencies, customer needs, and automation opportunities.",
  },
  {
    title: "Build intelligent systems",
    text: "Develop AI applications, agents, integrations, and software products around a defined job.",
  },
  {
    title: "Automate and optimize",
    text: "Improve workflows, reduce repetitive work, and measure whether the change held.",
  },
];

const steps = [
  { name: "Discover", text: "Start from the people, the process, and the signals the company already has." },
  { name: "Analyze", text: "Separate a repeatable step from judgment that should stay with a person." },
  { name: "Design", text: "Shape the workflow, the software, and the criteria for a useful result." },
  { name: "Build", text: "Implement the agent, application, pipeline, or analysis with the team that will use it." },
  { name: "Optimize", text: "Compare the result with the agreed criteria and decide what to keep." },
];

const industries = [
  { name: "FinTech and financial services", text: "Onboarding, operations, and customer questions where the handoff is documented." },
  { name: "B2B SaaS", text: "Product feedback, revenue operations, and the internal tools around a subscription business." },
  { name: "Healthcare technology", text: "Workflow and product engineering. We do not claim clinical certification or compliance guarantees." },
  { name: "E-commerce and retail", text: "Support volume, order questions, and the reporting that still starts in a spreadsheet." },
  { name: "Professional services", text: "Knowledge reuse, proposal work, and the status updates clients keep requesting." },
  { name: "Operations-intensive businesses", text: "Handoffs between systems where the same fields move every day." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-5 py-14 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-10 xl:py-12">
          <div className="lg:col-span-7">
            <Eyebrow>AI engineering · Intelligent automation</Eyebrow>
            <h1 className="text-4xl leading-[1.05] font-semibold text-navy sm:text-5xl lg:text-[2.75rem] xl:text-5xl">
              Find the opportunity.
              <br />
              Build the intelligence.
              <br />
              Automate the outcome.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">{site.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" arrow>
                Discuss Your Project
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Explore Our Services
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <HeroFlow />
          </div>
        </div>
      </section>

      <CapabilityStrip />

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
            <h2 className="max-w-2xl text-4xl font-medium text-navy sm:text-5xl">Three ways an engagement starts.</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <article className="panel panel-hover h-full rounded-xl p-6">
                  <p className="font-mono text-xs text-cyan">0{index + 1}</p>
                  <h3 className="mt-3 font-display text-3xl text-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h2 className="max-w-2xl text-4xl font-medium text-navy sm:text-5xl">A catalogue organized around the work, not a tool list.</h2>
            </div>
            <ButtonLink href="/services" variant="secondary">
              View all services
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((category) => (
              <a key={category.id} href={`/services#${category.id}`} className="panel panel-hover rounded-xl p-6">
                <ServiceIcon id={category.id} />
                <h3 className="mt-4 text-xl font-semibold text-navy">{category.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{category.summary}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Eyebrow>Demonstrations</Eyebrow>
          <h2 className="max-w-2xl text-4xl font-medium text-navy sm:text-5xl">See the shape of the work.</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            These panels use synthetic notes. They show how an engagement is framed. They are not measured client outcomes.
          </p>
          <div className="mt-8">
            <DemoStage />
          </div>
        </div>
      </section>

      <section id="how-we-work" className="scroll-mt-24 bg-inverse text-on-inverse">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan uppercase">Our approach</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold sm:text-5xl">Discover, analyze, design, build, optimize.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step.name} className="rounded-xl border border-on-inverse/15 bg-on-inverse/5 p-4">
                <span className="font-mono text-xs text-cyan">0{index + 1}</span>
                <h3 className="mt-3 text-2xl font-semibold">{step.name}</h3>
                <p className="mt-2 text-sm leading-6 text-on-inverse/75">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Eyebrow>Industries</Eyebrow>
          <h2 className="max-w-2xl text-4xl font-medium text-navy sm:text-5xl">Where the same patterns show up.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.name} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-display text-2xl text-navy">{industry.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{industry.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
