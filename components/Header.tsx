"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

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
        <DropdownMenuTrigger className="flex cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition hover:bg-neutral-200/50">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={session?.user?.image || ""}
              alt={session?.user?.name || "User Avatar"}
            />
            <AvatarFallback className="text-xl">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-sm text-neutral-500">{session?.user?.email}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOutAction} data-variant="destructive">
            Cerrar Sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
