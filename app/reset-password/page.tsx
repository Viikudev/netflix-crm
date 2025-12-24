import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;

  if (!token) redirect("/forgot-password");

  return <ResetPasswordForm token={token} />;
}
