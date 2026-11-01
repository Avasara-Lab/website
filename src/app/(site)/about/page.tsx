import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section } from "@/components/section";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Avasara Lab is an AI engineering studio for US and global B2B teams. The work starts from a business signal and ends in a scoped automation, application, or analysis.",
  path: "/about",
});

const beliefs = [
  { title: "A signal before a platform", text: "We start from tickets, handoffs, documents, or a metric someone already argues about." },
  { title: "A person keeps the judgment", text: "Agents and models take the repeatable step. Money, customers, and exceptions stay reviewable." },
  { title: "A result you can check", text: "Every engagement names how the team will know whether the change helped." },
];

export default function AboutPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>About</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-medium text-navy sm:text-6xl">{site.tagline}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          Avasara Lab builds practical AI systems, automations, and software for US and global B2B companies. We are an engineering studio, not a marketplace of unnamed case studies.
        </p>
      </Section>
      <Section tone="paper">
        <div className="grid gap-4 md:grid-cols-3">
          {beliefs.map((item) => (
            <article key={item.title} className="panel rounded-xl p-6">
              <h2 className="font-display text-3xl text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-base leading-7 text-ink">
          Opportunity Intelligence is the longer vision: connect a business signal to a recommended change and the workflow that carries it. Feedback Intelligence is the early demonstration of the reading step. Until those are products a team can buy, the credible path is a scoped service engagement.
        </p>
      </Section>
      <CtaBand />
    </>
  );
}
