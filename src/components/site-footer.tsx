import Link from "next/link";
import { services } from "@/lib/content";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper text-ink">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-display text-lg font-semibold tracking-tight text-navy">
            {site.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            {site.tagline} We work with US B2B SaaS startups and growing
            businesses on practical AI solutions, automation, and insight.
          </p>
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-navy uppercase">
            Navigate
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-muted hover:text-navy" href="/services">
                Services
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-navy" href="/products">
                Products
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-navy" href="/#how-we-work">
                How We Work
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-navy" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-navy" href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-navy uppercase">
            Services
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  className="text-muted hover:text-navy"
                  href={`/services#${service.id}`}
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-navy uppercase">
            Products
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                className="text-muted hover:text-navy"
                href="/products/feedback-intelligence"
              >
                Feedback Intelligence
              </Link>
            </li>
            <li>
              <Link className="text-muted hover:text-navy" href="/products#opportunity">
                Opportunity Intelligence
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-navy uppercase">
            Contact
          </p>
          <dl className="mt-3 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-navy">Email</dt>
              <dd className="mt-1 text-muted">
                {site.emailPlaceholder}
                <span className="mt-1 block text-xs leading-5">
                  Placeholder address. It is not a monitored inbox.
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-navy">Location</dt>
              <dd className="mt-1 text-muted">
                United States
                <span className="mt-1 block text-xs leading-5">
                  Working with US teams. A street address is not published.
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© 2026 Avasara Lab</p>
          <p>Project enquiries are prepared in the browser and are not sent.</p>
        </div>
      </div>
    </footer>
  );
}
