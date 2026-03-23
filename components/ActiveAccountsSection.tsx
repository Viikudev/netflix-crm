"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreateAccountDialog from "./CreateAccountDialog";
import { fetchActiveAccount } from "@/services/activeAccount";
import type { ActiveAccountProps } from "@/types/activeAccount";
import ActiveAccountActions from "@/components/ActiveAccountActions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UpdateScreenDialog from "./UpdateScreenDialog";
import type { ScreenProps } from "@/types/screen";

function ActiveAccountCard({
  activeAccount,
}: {
  activeAccount: ActiveAccountProps;
}) {
  const [showScreens, setShowScreens] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<ScreenProps | null>(
    null,
  );

  const handleCopyProfile = (e: React.MouseEvent, screen: ScreenProps) => {
    e.stopPropagation();
    const textToCopy = `Correo electronico: ${activeAccount.email}
Contraseña: ${activeAccount.password}
Perfil: ${screen.profileName}
PIN: ${screen.profilePIN}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Datos copiados al portapapeles");
    // toast.success("Datos copiados al portapapeles");
  };

  return (
    <Item variant="outline" className="col-span-1 items-start">
      <ItemContent>
        <div className="flex w-full flex-col justify-between sm:flex-row">
          <div>
            <ItemDescription className="text-black">
              <span className="font-semibold">Correo:</span>{" "}
              {activeAccount.email}
            </ItemDescription>
            <ItemDescription className="text-black">
              <span className="font-semibold">Contraseña:</span>{" "}
              {activeAccount.password}
            </ItemDescription>
            <ItemDescription className="text-black">
              <span className="font-semibold">Expiracion:</span>{" "}
              {new Date(activeAccount.expirationDate).toLocaleDateString()}
            </ItemDescription>
          </div>
        </div>

        {activeAccount.screens && activeAccount.screens.length > 0 && (
          <div className="text-sm">
            <Button
              variant="link"
              size="sm"
              className="flex h-8 cursor-pointer items-center gap-1 px-0! text-neutral-500 hover:text-blue-500"
              onClick={() => setShowScreens(!showScreens)}
            >
              <span>
                {showScreens ? "Ocultar" : "Mostrar"} pantallas (
                {activeAccount.screens.length}/5)
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${showScreens ? "rotate-180" : ""}`}
              />
            </Button>

            <div
              className={`grid w-full grid-cols-1 gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                showScreens ? "mt-2 max-h-70 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {activeAccount.screens.map((screen) => (
                <Tooltip key={screen.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="group flex cursor-pointer items-center justify-between gap-2 rounded-full border pl-4 font-medium text-neutral-600 transition-colors"
                      onClick={() =>
                        setSelectedScreen({
                          ...screen,
                          activeAccountId: activeAccount.id,
                        })
                      }
                    >
                      <div className="flex flex-col pr-2">
                        <div className="flex h-4 items-center gap-2 text-left text-sm">
                          <span>{screen.profileName}</span>
                          <Separator orientation="vertical" />
                          <span className="text-left text-xs text-neutral-400">
                            PIN: {screen.profilePIN}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 rounded-full transition-opacity group-hover:opacity-100 hover:bg-neutral-100!"
                        onClick={(e) => {
                          handleCopyProfile(e, {
                            ...screen,
                            activeAccountId: activeAccount.id,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualizar &quot;{screen.profileName}&quot;</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
        {(!activeAccount.screens || activeAccount.screens.length === 0) && (
          <div className="mt-2 text-sm text-neutral-400">
            Sin pantallas registradas
          </div>
        )}
      </ItemContent>
      <ItemActions className="flex shrink-0 flex-col gap-2">
        <ActiveAccountActions activeAccount={activeAccount} />
      </ItemActions>

      {selectedScreen && (
        <UpdateScreenDialog
          screen={selectedScreen}
          open={!!selectedScreen}
          onOpenChange={(isOpen) => !isOpen && setSelectedScreen(null)}
        />
      )}
    </Item>
  );
}

export default function ActiveAccountsSection() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  return (
    <div className="col-span-2 flex max-h-91 flex-col gap-4 overflow-y-scroll rounded-xl bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Correos Activos</h2>
        <CreateAccountDialog />
      </div>

      <div>
        {isLoading && <div>Loading active accounts...</div>}
        {isError && (
          <div className="text-red-600">
            Error loading accounts: {error?.message ?? String(error)}
          </div>
        )}

        {!isLoading && !isError && (!data || data.length === 0) && (
          <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
            No se encontraron cuentas activas
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
            {data.map((activeAccount: ActiveAccountProps) => (
              <ActiveAccountCard
                key={activeAccount.id}
                activeAccount={activeAccount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
