import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/app/client";
import { Eyebrow } from "@/components/section";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";

const points = [
  {
    title: "Bring operational records in",
    text: "Upload the support, sales, and operations files the team already keeps. Each organization sees only its own data.",
  },
  {
    title: "Read the repeated patterns",
    text: "Signals are counted from those records. The score on a card is explained in the product, not presented as a customer benchmark.",
  },
  {
    title: "Prioritize the next opportunity",
    text: "Opportunity Radar ranks what to investigate and keeps the evidence attached, so a scattered list becomes a decision.",
  },
  {
    title: "Approve agentic execution",
    text: "A person with the right role approves the recommendation. An agent then runs only the tools it is allowed to use.",
  },
] as const;

export async function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const signingIn = mode === "login";
  const showMarketing = await marketingSiteIsVisible();
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-start lg:gap-x-16 lg:py-16">
      <div className="order-1 lg:col-start-1 lg:row-start-1">
        <Eyebrow>Opportunity Intelligence</Eyebrow>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
          Turn operational data into prioritized opportunities.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
          Opportunity Intelligence is the Avasara Lab workspace for that work. It exists because the same operational problem often sits across tickets, exports, and notes, while the team still has to decide what deserves action first.
        </p>
      </div>
      <div className="order-3 grid gap-5 lg:col-start-1 lg:row-start-2">
        <ol className="grid gap-4">
          {points.map((point, index) => (
            <li key={point.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-cyan-soft text-xs font-semibold text-cyan tabular-nums">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{point.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{point.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="max-w-xl border-l-2 border-line pl-4 text-xs leading-5 text-muted">
          Data stays inside the organization you join. This application does not publish customer results. A workspace marked synthetic is a demo, and its figures are not a client outcome.
        </p>
        <Link href={showMarketing ? "/features" : "/#product"} className="w-fit text-sm font-semibold text-cyan">
          {showMarketing ? "See what the application does today" : "See the product screens"}
        </Link>
      </div>
      <div className="order-2 grid gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <header>
          <h2 className="text-2xl font-semibold text-navy">{signingIn ? "Sign in" : "Create an account"}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {signingIn
              ? showMarketing
                ? "Use the email and password for your workspace. The marketing site stays public."
                : "Use the email and password for your workspace. After you sign in, the product opens."
              : "After this step you name your organization. You become its owner, and its data is not visible to other organizations."}
          </p>
        </header>
        <Suspense fallback={<p className="panel rounded-xl p-6 text-sm text-muted">Loading the form…</p>}>
          <AuthForm mode={mode} />
        </Suspense>
        <p className="text-sm text-muted">
          {signingIn ? (
            <>
              No account yet?{" "}
              <Link className="font-semibold text-cyan" href="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link className="font-semibold text-cyan" href="/login">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
