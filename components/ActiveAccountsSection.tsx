"use client";

import { useQuery } from "@tanstack/react-query";
import CreateAccountDialog from "./CreateAccountDialog";
import { fetchActiveAccount } from "@/services/activeAccount";
import type { ActiveAccountProps } from "@/types/activeAccount";
import ActiveAccountActions from "@/components/ActiveAccountActions";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  // ItemTitle,
} from "@/components/ui/item";

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
              <Item
                key={activeAccount.id}
                variant="outline"
                className="col-span-1 items-start"
              >
                <ItemContent>
                  <ItemDescription className="text-black">
                    <span className="font-semibold">Correo:</span>{" "}
                    {activeAccount.email}
                  </ItemDescription>
                  <ItemDescription className="text-black">
                    <span className="font-semibold">Contraseña:</span>{" "}
                    {activeAccount.password}
                  </ItemDescription>
                  <ItemDescription className="text-black">
                    <span className="font-semibold">Expira:</span>{" "}
                    {new Date(
                      activeAccount.expirationDate,
                    ).toLocaleDateString()}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ActiveAccountActions activeAccount={activeAccount} />
                </ItemActions>
              </Item>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
