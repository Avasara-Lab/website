import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section } from "@/components/section";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Avasara Lab helps growing businesses translate operational signals into practical AI solutions, intelligent automation, and measurable impact.",
  path: "/about",
});

const principles = [
  {
    title: "Start from the signal",
    text: "A ticket pattern, a manual report, or a stalled workflow is more useful than a general request for AI.",
  },
  {
    title: "Build something the team can run",
    text: "The result of a project should fit the tools and the people who will keep using it after the engagement.",
  },
  {
    title: "Judge the work",
    text: "A success criterion is part of the scope, so the team can tell whether the solution changed the original problem.",
  },
  {
    title: "Leave room for a product",
    text: "Repeated problems across companies can become product directions. Those directions stay labeled until they are real.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>About</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
          {site.tagline}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          Avasara Lab is an AI technology company. The mission is to help
          growing businesses translate business signals into practical AI
          solutions and measurable impact.
        </p>
      </Section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-navy">Who the work is for</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              US B2B SaaS startups and growing businesses. The usual
              conversation is with a founder, a CEO, a head of product, or a
              head of operations who can point to a process or a feedback pile
              that is already costing time.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-navy">What the company builds</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Intelligent automation, custom AI applications, and feedback
              analysis delivered as scoped projects. Over time, repeated
              problems can become products. Feedback Intelligence and
              Opportunity Intelligence are those directions, and they are not
              shipping products today.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-navy">
          How an engagement is held.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {principles.map((item) => (
            <article key={item.title} className="rounded-xl border border-line p-6">
              <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
