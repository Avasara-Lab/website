import { notFound } from "next/navigation";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink } from "@/components/button-link";
import { Eyebrow, Section } from "@/components/section";
import { servicePageBySlug, servicePages } from "@/lib/services-catalog";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) return {};
  return pageMetadata({
    title: page.title,
    description: page.solution,
    path: `/services/${page.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>{page.categoryTitle}</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-medium text-navy sm:text-6xl">{page.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{page.solution}</p>
        <div className="mt-8">
          <ButtonLink href="/contact" arrow>
            Discuss this engagement
          </ButtonLink>
        </div>
      </Section>
      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-navy">The business problem</h2>
            <p className="mt-4 text-base leading-7 text-muted">{page.problem}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-navy">What the work includes</h2>
            <ul className="mt-4 space-y-3">
              {page.capabilities.map((item) => (
                <li key={item} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="font-display text-3xl text-navy">Use cases</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {page.cases.map((item) => (
            <article key={item.title} className="panel rounded-3xl p-6">
              <h3 className="font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm leading-6 text-muted">
          These are patterns for scoping a project. They are not case studies and they do not report a client metric.
        </p>
      </Section>
      <CtaBand />
    </>
  );
}
