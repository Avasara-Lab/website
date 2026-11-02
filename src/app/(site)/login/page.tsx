import { AuthScreen } from "@/components/app/auth-screen";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to Opportunity Intelligence. Turn operational data into prioritized opportunities and approved agent actions.",
  path: "/login",
});

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
