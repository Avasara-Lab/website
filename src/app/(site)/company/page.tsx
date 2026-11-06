import { redirect } from "next/navigation";
import { MarketingHome } from "@/components/marketing/home-page";
import { marketingSiteIsVisible } from "@/lib/marketing-mode";
import { pageMetadata, site } from "@/lib/site";

export async function generateMetadata() {
  return {
    ...pageMetadata({
      title: "Studio homepage",
      description: site.description,
      path: "/company",
    }),
    robots: { index: false, follow: false },
  };
}

export default async function CompanyHomePage() {
  if (await marketingSiteIsVisible()) redirect("/");
  return <MarketingHome />;
}
