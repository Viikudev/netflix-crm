"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const signOutAction = async () => {
    try {
      await authClient.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <Button type="submit" size="lg" onClick={signOutAction}>
      Logout
    </Button>
  );
}
