import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }> | { token?: string };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const token = resolvedSearchParams?.token;

  if (!token) redirect("/forgot-password");

  return <ResetPasswordForm token={token} />;
}
