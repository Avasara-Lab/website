import { AuthScreen } from "@/components/app/auth-screen";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Register",
  description: "Create an Avasara Lab account and an organization for Opportunity Intelligence.",
  path: "/register",
});

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
