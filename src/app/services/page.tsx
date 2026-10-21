import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section } from "@/components/section";
import { serviceCategories } from "@/lib/services-catalog";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "AI agents, generative AI, data intelligence, product engineering, strategy, and growth work from Avasara Lab. Each engagement is scoped to a business problem.",
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
            <a key={category.id} href={`#${category.id}`} className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-navy/40">
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
                <p className="font-mono text-xs text-cyan">0{index + 1}</p>
                <h2 className="mt-2 font-display text-4xl text-navy">{category.title}</h2>
                <p className="mt-4 text-sm leading-6 text-muted">{category.summary}</p>
                <p className="mt-4 text-sm leading-6 text-ink">{category.outcome}</p>
                {category.page ? (
                  <Link href={`/services/${category.page.slug}`} className="mt-5 inline-flex text-sm font-semibold text-cyan hover:text-navy">
                    {category.page.title}
                  </Link>
                ) : null}
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
                {category.offers.map((offer) => (
                  <li key={offer.name} className="panel panel-hover rounded-2xl px-4 py-4">
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
