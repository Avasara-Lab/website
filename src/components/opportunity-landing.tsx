import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { opportunity } from "@/lib/opportunity";
import { META_CAPABILITIES, OPEN_WEIGHT_NOTES, SAM_NOTE } from "@/server/modules/meta-ai/catalog";

const stages = [
  {
    index: "01",
    name: "Find opportunities",
    text: "Repeated questions, delayed follow-ups, and manual reports, counted from the records a team already keeps.",
  },
  {
    index: "02",
    name: "Rank actions",
    text: "Opportunity Radar orders what to do next and keeps the evidence that produced each score.",
  },
  {
    index: "03",
    name: "Agentic execution",
    text: "A person approves. An agent then runs only the tools it is allowed to use.",
  },
] as const;

const steps = [
  {
    index: "01",
    title: "Connect the records you already keep",
    text: "Business Connect accepts CSV, Excel, JSON, text, PDF, and WAV. WAV is transcribed only when the server has a Meta key. Named systems such as HubSpot stay unconfigured until a real integration exists.",
    href: "/app/connect",
    route: "/app/connect",
  },
  {
    index: "02",
    title: "Count the signals in code",
    text: "Detectors flag repeated support questions, sales proposals with no follow-up inside 5 days, and manual weekly reports. A model may write an interpretation later. It does not add the evidence.",
    href: "/app/signals",
    route: "/app/signals",
  },
  {
    index: "03",
    title: "Rank the next actions",
    text: "Those signals become opportunities. Opportunity Radar shows the priority score, the method behind it, and the evidence a person can open.",
    href: "/app/radar",
    route: "/app/radar",
  },
  {
    index: "04",
    title: "Approve, then execute",
    text: "A person with the right role approves. The Customer Support Automation Agent records replies on a simulated inbox and checks them against observed approved answers. Impact keeps observed, estimate, simulated, and verified separate.",
    href: "/app/agents",
    route: "/app/agents",
  },
] as const;

const screenGroups = [
  {
    label: "Decide",
    screens: [
      {
        href: "/app",
        route: "/app",
        title: "Overview",
        text: "Workspace counts for this organization. Estimates stay labeled as estimates.",
      },
      {
        href: "/app/signals",
        route: "/app/signals",
        title: "Signals",
        text: "Active patterns from support, sales, and operations records.",
      },
      {
        href: "/app/radar",
        route: "/app/radar",
        title: "Opportunity Radar",
        text: "Filter and open ranked opportunities, with the evidence still attached.",
      },
    ],
  },
  {
    label: "Remember",
    screens: [
      {
        href: "/app/connect",
        route: "/app/connect",
        title: "Business Connect",
        text: "Upload a file. Ingestion history shows what was written.",
      },
      {
        href: "/app/sources",
        route: "/app/sources",
        title: "Data sources",
        text: "Files this organization has stored, and whether a source needs configuration.",
      },
      {
        href: "/app/memory",
        route: "/app/memory",
        title: "Business Memory",
        text: "Events, entities, and relationships. Observed rows stay separate from model text.",
      },
    ],
  },
  {
    label: "Act",
    screens: [
      {
        href: "/app/agents",
        route: "/app/agents",
        title: "AI agents",
        text: "The support agent uses allowlisted tools. It cannot delete data or move money.",
      },
      {
        href: "/app/executions",
        route: "/app/executions",
        title: "Executions",
        text: "The log of a run, including what happened on the simulated inbox.",
      },
      {
        href: "/app/impact",
        route: "/app/impact",
        title: "Impact",
        text: "Each figure says whether it is observed, an estimate, simulated, or verified.",
      },
    ],
  },
] as const;

export function OpportunityLanding() {
  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-12 px-5 py-14 md:px-8 lg:grid-cols-12 lg:gap-16 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">Opportunity Intelligence</p>
            <h1 className="mt-4 max-w-3xl text-[2.4rem] leading-[1.02] font-semibold tracking-tight text-balance text-navy sm:text-6xl lg:text-[4.25rem]">
              {opportunity.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-pretty text-muted">{opportunity.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={opportunity.demoLogin} arrow>
                Try the live demo
              </ButtonLink>
              <ButtonLink href={opportunity.bookCall} variant="secondary" external>
                Book a call
              </ButtonLink>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted">
              Synthetic demo account. {opportunity.demoCompany} is labeled synthetic. Its figures are not customer results.
            </p>
            <p className="mt-1 text-sm leading-6 text-navy">
              <span className="font-semibold whitespace-nowrap">{opportunity.demoEmail}</span>
              <span className="text-muted"> · </span>
              <span className="font-semibold whitespace-nowrap">{opportunity.demoPassword}</span>
            </p>
          </div>
          <div className="lg:col-span-5">
            <ol className="grid gap-3" aria-label="What the layer does">
              {stages.map((stage) => (
                <li key={stage.index} className="panel grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-xl p-4">
                  <span className="flex size-9 items-center justify-center rounded-full bg-cyan-soft font-mono text-xs font-semibold text-cyan">
                    {stage.index}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-navy">{stage.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{stage.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="how" className="scroll-mt-24 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">How it works</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            From a file you already have to an approved action.
          </h2>
          <ol className="mt-10">
            {steps.map((step) => (
              <li key={step.index} className="grid gap-3 border-t border-line py-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6">
                <p className="font-mono text-sm font-semibold text-cyan">{step.index}</p>
                <div>
                  <h3 className="text-xl font-semibold text-navy">{step.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{step.text}</p>
                  <p className="mt-3">
                    <RouteLink href={step.href}>{step.route}</RouteLink>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="product" className="scroll-mt-24">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">Product</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            The screens that are in the app today.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Each card opens a real route. Signing in is required. There are no sample customer logos and no published client metrics.
          </p>
          <div className="mt-10 grid gap-10">
            {screenGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{group.label}</h3>
                <ul className="mt-4 grid gap-3 md:grid-cols-3">
                  {group.screens.map((screen) => (
                    <li key={screen.href}>
                      <article className="panel flex h-full flex-col rounded-xl p-5">
                        <h4 className="text-lg font-semibold text-navy">{screen.title}</h4>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{screen.text}</p>
                        <p className="mt-4">
                          <RouteLink href={screen.href}>{screen.route}</RouteLink>
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="meta" className="scroll-mt-24 bg-inverse text-on-inverse">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">Meta Model API</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Built on the Meta Model API.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-on-inverse/75">
            Calls go only to https://api.meta.ai/v1, with MODEL_API_KEY on the server. An empty key blocks the call. No other model provider is used, and the browser never receives the key.
          </p>
          <ul className="mt-10 grid gap-3 md:grid-cols-2">
            {META_CAPABILITIES.map((item) => (
              <li key={item.key} className="rounded-xl border border-on-inverse/15 bg-on-inverse/5 p-5">
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <p className="mt-1 font-mono text-xs text-cyan">{item.endpoint}</p>
                <p className="mt-3 text-sm leading-6 text-on-inverse/80">{item.purpose}</p>
                <details className="mt-3 text-sm leading-6 text-on-inverse/70">
                  <summary className="min-h-11 cursor-pointer font-semibold text-on-inverse">What this release does not do</summary>
                  <p className="pb-2">{item.note}</p>
                </details>
              </li>
            ))}
          </ul>
          <div className="mt-8 max-w-3xl text-sm leading-6 text-on-inverse/75">
            {OPEN_WEIGHT_NOTES.map((item) => (
              <p key={item.name}>
                <span className="font-semibold text-on-inverse">{item.name}.</span> {item.note}
              </p>
            ))}
            <p className="mt-2">{SAM_NOTE}</p>
          </div>
          <p className="mt-8">
            <Link
              href="/app/ai"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-on-inverse underline decoration-on-inverse/40 underline-offset-4"
            >
              Open model configuration at /app/ai
            </Link>
          </p>
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">Demo</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            Watch the walkthrough, then open the workspace.
          </h2>
          <figure className="mt-8">
            <video
              className="aspect-video w-full rounded-xl border border-line bg-black"
              controls
              playsInline
              preload="metadata"
              aria-label="Opportunity Intelligence walkthrough"
            >
              <source src={opportunity.demoVideo} type="video/mp4" />
            </video>
            <figcaption className="mt-3 text-sm leading-6 text-muted">
              Product walkthrough. Captions are not available for this file.{" "}
              <a
                className="font-semibold text-navy underline underline-offset-4"
                href={opportunity.demoVideo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the video file
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </figcaption>
          </figure>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={opportunity.demoLogin} arrow>
              Try the live demo
            </ButtonLink>
            <ButtonLink href={opportunity.bookCall} variant="secondary" external>
              Book a call
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function RouteLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center font-mono text-xs font-semibold text-navy underline decoration-line underline-offset-4 hover:decoration-cyan"
    >
      {children}
    </Link>
  );
}
