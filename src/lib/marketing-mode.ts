import { cacheLife } from "next/cache";
import { marketingSiteVisible } from "@/lib/marketing-window";

export async function marketingSiteIsVisible() {
  "use cache";
  cacheLife("hours");
  return marketingSiteVisible(Date.now(), process.env["MARKETING_SITE"]);
}
