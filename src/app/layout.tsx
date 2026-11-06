import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { opportunity } from "@/lib/opportunity";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const themeBoot = `(function(){try{var stored=localStorage.getItem("avasara-theme");var theme=stored==="light"||stored==="dark"||stored==="system"?stored:"system";var dark=theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.dataset.themeChoice=theme;}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.themeChoice="system";}document.documentElement.classList.add("js","theme-ready");})();`;

export async function generateMetadata(): Promise<Metadata> {
  const product = !(await marketingSiteIsVisible());
  const description = product ? opportunity.description : site.description;
  const title = product ? opportunity.title : site.name;
  return {
    metadataBase: new URL(site.url),
    title: {
      default: product ? opportunity.name : site.name,
      template: `%s · ${site.name}`,
    },
    description,
    applicationName: product ? opportunity.name : site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const product = !(await marketingSiteIsVisible());
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: product ? opportunity.description : site.description,
    url: site.url,
    slogan: product ? opportunity.title : site.tagline,
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script id="theme-boot" dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-btn focus:px-4 focus:py-2 focus:text-sm focus:text-on-btn"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      </body>
    </html>
  );
}
