import { ButtonLink } from "@/components/button-link";
import { Eyebrow, Section } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "How it works",
  description: "How Avasara turns business records into signals, opportunities, an approved agent run, and labeled impact.",
  path: "/how-it-works",
});

const steps = [
  ["Register and create an organization", "Accounts and company data are isolated by organization membership."],
  ["Upload business records", "CSV, Excel, JSON, text, PDF, and WAV files are stored and parsed. Connectors such as HubSpot stay unconfigured until credentials and a real sync exist."],
  ["Business memory", "Rows become events and entities. Observed facts stay separate from model interpretations."],
  ["Signals", "Repeated questions, delayed follow-ups, and manual reports are counted in code."],
  ["Opportunities", "Signals become an opportunity with the evidence that produced it. Savings that use an assumption are labeled estimates."],
  ["Approval and execution", "A person approves. The support agent then records replies on a simulated inbox and checks them against approved answers."],
  ["Impact", "The dashboard shows observed, estimated, simulated, and verified figures separately."],
];

export default function HowItWorksPage() {
  return (
    <Section>
      <Eyebrow>Opportunity Intelligence</Eyebrow>
      <h1 className="max-w-3xl text-4xl font-semibold text-navy">From a record to a measured next step.</h1>
      <ol className="mt-10 grid gap-4">
        {steps.map(([title, text], index) => (
          <li key={title} className="panel rounded-xl p-5">
            <p className="text-xs font-semibold text-cyan">{index + 1}</p>
            <h2 className="mt-2 text-xl font-semibold text-navy">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/register">Register</ButtonLink>
        <ButtonLink href="/features" variant="secondary">Features</ButtonLink>
      </div>
    </Section>
  );
}
