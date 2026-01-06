"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Header() {
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
    <header className="mx-10 flex justify-between py-4 max-sm:mx-4">
      <h1 className="text-2xl font-bold">Streamings PZO</h1>
      <DropdownMenu>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={signOutAction} data-variant="destructive">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
