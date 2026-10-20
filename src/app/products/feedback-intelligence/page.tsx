import { CtaBand } from "@/components/cta-band";
import { FeedbackDemo } from "@/components/feedback-demo";
import { Eyebrow, Section, StatusNote } from "@/components/section";
import { feedbackValue } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Feedback Intelligence",
  description:
    "Feedback Intelligence is an early Avasara Lab product direction. Explore a synthetic demo that groups sample feedback, severity, and recommended next steps. It is not a live product.",
  path: "/products/feedback-intelligence",
});

const planned = [
  "Connections to the tools where reviews, tickets, and call notes already live",
  "A review step so a person can correct a theme before it becomes a priority",
  "A record of which recommendation was accepted and what changed afterward",
  "Permissions for the product, support, and operations people who share the reading",
];

export default function FeedbackIntelligencePage() {
  return (
    <>
      <Section className="border-b border-line">
        <Eyebrow>Early product direction</Eyebrow>
        <h1 className="max-w-3xl text-4xl font-semibold text-navy sm:text-5xl">
          Feedback Intelligence
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
          A direction for turning customer feedback and support conversations
          into themes, priorities, and recommended actions. The interface below
          shows the intended reading. It does not analyze a live account.
        </p>
        <div className="mt-8 max-w-3xl">
          <StatusNote>
            This is a demo with synthetic examples. Feedback Intelligence is
            not live, not production-ready, and not available for purchase.
          </StatusNote>
        </div>
      </Section>

      <Section tone="paper">
        <h2 className="max-w-2xl text-3xl font-semibold text-navy">
          The value the product is meant to create.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {feedbackValue.map((item) => (
            <article key={item.title} className="rounded-xl border border-line bg-white p-6">
              <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Demo</Eyebrow>
            <h2 className="text-3xl font-semibold text-navy">
              A sample reading of customer feedback.
            </h2>
          </div>
        </div>
        <FeedbackDemo />
      </Section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Not built yet</Eyebrow>
            <h2 className="text-3xl font-semibold text-navy">
              Planned capabilities, separate from the demo.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              The demo can filter and display examples that were written for
              this website. The items below are planned product work. They are
              not implemented here.
            </p>
          </div>
          <ul className="rounded-xl border border-line bg-white">
            {planned.map((item) => (
              <li
                key={item}
                className="border-b border-line px-5 py-4 text-sm leading-6 text-ink last:border-b-0"
              >
                <span className="mr-2 text-xs font-semibold tracking-wide text-violet uppercase">
                  Planned
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand
        title="See whether this direction fits the feedback you already have."
        copy="If reviews and tickets are already hard to read, a scoped project can organize that material now. The product itself is still an experiment."
      />
    </>
  );
}
