import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ServicesSection from "@/components/ServicesSection";
import ActiveAccountsSection from "@/components/ActiveAccountsSection";

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="mx-10 grid grid-cols-2 gap-4">
      <ServicesSection />
      <ActiveAccountsSection />
      <ServicesSection />
    </div>
  );
}
