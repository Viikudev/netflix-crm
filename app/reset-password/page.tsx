"use client";

import { useEffect } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [router, searchParams]);

  return <ResetPasswordForm />;
}
