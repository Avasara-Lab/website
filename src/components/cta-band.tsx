import { ButtonLink } from "@/components/button-link";

export function CtaBand({
  title = "Find your next opportunity with AI.",
  copy = "Let's explore how AI, automation, and custom software can help your business work smarter.",
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-24">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/80">{copy}</p>
        </div>
        <ButtonLink href="/contact" variant="inverse" arrow>
          Discuss Your Project
        </ButtonLink>
      </div>
    </section>
  );
}
