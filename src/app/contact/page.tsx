import { Suspense } from "react";
import { EnquiryFormGate } from "@/components/enquiry-form";
import { Eyebrow, Section, StatusNote } from "@/components/section";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Prepare a project enquiry for Avasara Lab. The form validates in the browser. Email delivery is not configured, so submissions are not sent.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="text-4xl font-semibold text-navy sm:text-5xl">
            Discuss your project.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Describe the operational problem, the kind of help you want, and
            an approximate budget if you have one. A useful first note is
            specific about the workflow, the feedback, or the decision that is
            stuck.
          </p>
          <div className="mt-6">
            <StatusNote>
              Email delivery is not configured. The form checks your details
              and prepares a copy. It does not send the enquiry to {site.name}.
              The published email {site.emailPlaceholder} is a placeholder and
              is not monitored.
            </StatusNote>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Suspense
            fallback={
              <div className="rounded-xl border border-line bg-white p-8 text-sm text-muted">
                Loading the enquiry form.
              </div>
            }
          >
            <EnquiryFormGate />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}
