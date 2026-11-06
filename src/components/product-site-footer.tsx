import Link from "next/link";
import { opportunity } from "@/lib/opportunity";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#product", label: "Product screens" },
  { href: "/#meta", label: "Meta models" },
  { href: "/#demo", label: "Walkthrough" },
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Register" },
  { href: opportunity.demoLogin, label: "Try the live demo" },
] as const;

export function ProductSiteFooter() {
  return (
    <footer className="border-t border-line bg-inverse text-on-inverse">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="max-w-sm">
          <p className="text-lg font-semibold">Avasara Lab</p>
          <p className="mt-2 text-sm leading-6 text-on-inverse/75">{opportunity.description}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid gap-1 sm:grid-cols-2 sm:gap-x-10">
            {links.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center text-sm text-on-inverse/80 hover:text-on-inverse">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={opportunity.bookCall}
                className="inline-flex min-h-11 items-center text-sm text-on-inverse/80 hover:text-on-inverse"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a call
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-on-inverse/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs leading-5 text-on-inverse/55 md:px-8">
          {opportunity.demoCompany} is a synthetic company. This site does not publish customer metrics.
        </p>
      </div>
    </footer>
  );
}
