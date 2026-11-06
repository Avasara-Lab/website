import { MarketingHome } from "@/components/marketing/home-page";
import { OpportunityLanding } from "@/components/opportunity-landing";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { opportunity } from "@/lib/opportunity";
import { pageMetadata, site } from "@/lib/site";

export async function generateMetadata() {
  if (await marketingSiteIsVisible()) {
    return pageMetadata({
      title: "Find the opportunity. Build the intelligence. Automate the outcome.",
      description: site.description,
      path: "/",
    });
  }
  return pageMetadata({
    title: opportunity.title,
    description: opportunity.description,
    path: "/",
  });
}

export default async function HomePage() {
  if (await marketingSiteIsVisible()) return <MarketingHome />;
  return <OpportunityLanding />;
}
