import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { ServiceIcon } from "@/components/service-icon";
import { Eyebrow, Section } from "@/components/section";
import { serviceCategories } from "@/lib/services-catalog";
import { pageMetadata } from "@/lib/site";

const helpFor: Record<string, string> = {
  agents: "automation",
  generative: "development",
  data: "intelligence",
  software: "development",
  strategy: "strategy",
  growth: "intelligence",
};

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI agents, knowledge systems, data engineering, product engineering, AI infrastructure, and opportunity intelligence from Avasara Lab. Each engagement is scoped to a business problem.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>Services</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-medium text-navy sm:text-6xl">
          Practical AI, software, and automation for a defined business job.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          The catalogue draws on the kinds of agent, knowledge, automation, data, and product work companies ask for. Avasara Lab delivers them as scoped engagements. We do not claim certifications, named clients, or results we have not earned.
        </p>
        <nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="Service categories">
          {serviceCategories.map((category) => (
            <a key={category.id} href={`#${category.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-navy hover:border-cyan/40">
              <ServiceIcon id={category.id} />
              {category.title.split(" and ")[0]}
            </a>
          ))}
        </nav>
      </Section>
      {serviceCategories.map((category, index) => (
        <section key={category.id} id={category.id} className={`scroll-mt-24 ${index % 2 ? "bg-paper" : "bg-white"}`}>
          <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3">
                  <ServiceIcon id={category.id} />
                  <p className="font-mono text-xs text-cyan">0{index + 1}</p>
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-navy sm:text-4xl">{category.title}</h2>
                <p className="mt-4 text-sm leading-6 text-muted">{category.summary}</p>
                <p className="mt-4 text-sm leading-6 text-ink">{category.outcome}</p>
                <div className="mt-5 flex flex-col items-start gap-2">
                  {category.page ? (
                    <Link href={`/services/${category.page.slug}`} className="text-sm font-semibold text-cyan hover:text-navy">
                      {category.page.title}
                    </Link>
                  ) : null}
                  <Link href={`/contact?help=${helpFor[category.id] ?? "unsure"}`} className="text-sm font-semibold text-navy hover:text-cyan">
                    Discuss this work
                  </Link>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
                {category.offers.map((offer) => (
                  <li key={offer.name} className="panel panel-hover rounded-xl px-4 py-4">
                    <h3 className="text-sm font-semibold text-navy">{offer.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{offer.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
      <CtaBand />
    </>
  );
}
