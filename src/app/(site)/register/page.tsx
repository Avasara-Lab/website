import Link from "next/link";
import { AuthForm } from "@/components/app/client";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Register",
  description: "Create an Avasara Lab account and an organization for Opportunity Intelligence.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 px-5 py-16">
      <header>
        <h1 className="text-4xl font-semibold text-navy">Create an account</h1>
        <p className="mt-3 text-sm leading-6 text-muted">After registration you create an organization. Its data is not visible to other organizations.</p>
      </header>
      <AuthForm mode="register" />
      <p className="text-sm text-muted">Already registered? <Link className="font-semibold text-cyan" href="/login">Sign in</Link></p>
    </section>
  );
}
