import Link from "next/link";
import { AuthForm } from "@/components/app/client";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to the Avasara Lab Opportunity Intelligence application.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 px-5 py-16">
      <header>
        <h1 className="text-4xl font-semibold text-navy">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Use the account you registered for this workspace. The marketing site stays public.</p>
      </header>
      <AuthForm mode="login" />
      <p className="text-sm text-muted">No account yet? <Link className="font-semibold text-cyan" href="/register">Register</Link></p>
    </section>
  );
}
