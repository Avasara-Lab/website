import Link from "next/link";
import { serviceCategories, servicePages } from "@/lib/services-catalog";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-inverse text-on-inverse">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-2xl font-semibold tracking-tight text-on-inverse">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-on-inverse/75">
            {site.tagline} We help US and global B2B teams find a practical AI,
            automation, or software engagement and judge whether it worked.
          </p>
        </div>
        <div className="lg:col-span-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-on-inverse/60 uppercase">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {serviceCategories.map((category) => (
              <li key={category.id}>
                <Link className="text-on-inverse/80 hover:text-on-inverse" href={`/services#${category.id}`}>
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-on-inverse/60 uppercase">Focus</p>
          <ul className="mt-3 space-y-2 text-sm">
            {servicePages.map((page) => (
              <li key={page.slug}>
                <Link className="text-on-inverse/80 hover:text-on-inverse" href={`/services/${page.slug}`}>
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-on-inverse/60 uppercase">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="text-on-inverse/80 hover:text-on-inverse" href="/products">Products</Link></li>
            <li><Link className="text-on-inverse/80 hover:text-on-inverse" href="/about">About</Link></li>
            <li><Link className="text-on-inverse/80 hover:text-on-inverse" href="/contact">Contact</Link></li>
            <li><Link className="text-on-inverse/80 hover:text-on-inverse" href="/products/feedback-intelligence">Feedback Intelligence</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-on-inverse/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-on-inverse/55 md:px-8">
          Illustrations and demonstrations on this site use synthetic data. Avasara Lab does not publish client metrics it cannot substantiate.
        </p>
      </div>
    </footer>
  );
}
