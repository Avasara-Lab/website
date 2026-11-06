import { ButtonLink } from "@/components/button-link";
import { Eyebrow, Section } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Features",
  description: "The Opportunity Intelligence modules that are implemented in this application.",
  path: "/features",
});

const features = [
  ["Business onboarding", "Registration, organizations, roles, departments, and a company profile."],
  ["Business Connect", "File upload and an ingestion history. External systems are listed as needing configuration."],
  ["Business Memory", "Events, entities, and relationships with a provenance label."],
  ["Signal and opportunity engines", "Deterministic detection, evidence, and a visible priority score."],
  ["Opportunity Radar", "Filters and cards driven by the database."],
  ["Meta models", "Muse Spark, Muse Wonder, Muse Voice Transcribe, and Muse Image through the official API when a key is set."],
  ["Support agent", "Human approval, a simulated inbox, execution logs, and verification."],
  ["Impact", "Classified metrics, including a banner when the company is synthetic."],
];

export default function FeaturesPage() {
  return (
    <Section>
      <Eyebrow>Product</Eyebrow>
      <h1 className="max-w-3xl text-4xl font-semibold text-navy">What the application does today.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">Feedback Intelligence remains a synthetic demo on its own page. This list is the authenticated Opportunity Intelligence application.</p>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {features.map(([title, text]) => (
          <li key={title} className="panel rounded-xl p-5">
            <h2 className="text-lg font-semibold text-navy">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <ButtonLink href="/register">Create an account</ButtonLink>
      </div>
    </Section>
  );
}
