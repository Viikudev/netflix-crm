import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "@/components/SignOutButton";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">STREAMING PZO DASHBOARD</h1>
      <div className="mt-8 text-center">
        <SignOutButton />
      </div>
    </div>
  );
}
