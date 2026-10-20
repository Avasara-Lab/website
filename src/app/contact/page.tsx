import { Suspense } from "react";
import { EnquiryFormGate } from "@/components/enquiry-form";
import { Eyebrow, Section, StatusNote } from "@/components/section";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Send a project enquiry to Avasara Lab. The form checks the details, then emails them. A confirmation appears only after delivery is accepted.",
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
              The form emails your enquiry to Avasara Lab. You will see a
              confirmation only after the email service accepts it. If sending
              fails, the details stay on the page so you can retry.
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
