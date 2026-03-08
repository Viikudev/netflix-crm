"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CreateAccountDialog from "./CreateAccountDialog";
import { fetchActiveAccount } from "@/services/activeAccount";
import type { ActiveAccountProps } from "@/types/activeAccount";
import ActiveAccountActions from "@/components/ActiveAccountActions";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
              className={`grid w-full grid-cols-2 gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                showScreens ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {activeAccount.screens.map((screen) => (
                <Tooltip key={screen.id}>
                  <TooltipTrigger className="w-fit">
                    <div
                      className="w-fit cursor-pointer rounded-full border px-4 py-1 font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                      onClick={() =>
                        setSelectedScreen({
                          ...screen,
                          activeAccountId: activeAccount.id,
                        })
                      }
                    >
                      <p className="text-left text-sm">{screen.profileName}</p>
                      <p className="text-left text-xs text-neutral-400">
                        PIN: {screen.profilePIN}
                      </p>
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
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md">
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
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
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
