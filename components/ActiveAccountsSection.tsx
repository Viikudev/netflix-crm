"use client";

import { useQuery } from "@tanstack/react-query";
import CreateAccountDialog from "./CreateAccountDialog";
import { fetchActiveAccount } from "@/services/activeAccount";
import type { ActiveAccountProps } from "@/types/activeAccount";

export default function ActiveAccountsSection() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  return (
    <div className="flex flex-col rounded-xl bg-white p-4 shadow-md">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">Correos Activos</h2>
        <CreateAccountDialog />
      </div>

      <div className="mt-4">
        {isLoading && <div>Loading active accounts...</div>}
        {isError && (
          <div className="text-red-600">
            Error loading accounts: {error?.message ?? String(error)}
          </div>
        )}

        {!isLoading && !isError && (!data || data.length === 0) && (
          <div>No active accounts found.</div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <ul className="grid grid-cols-2">
            {data.map((activeAccount: ActiveAccountProps) => (
              <li
                key={activeAccount.id}
                className="flex flex-col items-start justify-between rounded-md border p-2"
              >
                <div className="flex items-baseline gap-1">
                  <p className="text-md font-bold">Correo:</p>
                  <p className="text-sm">{activeAccount.email}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-md font-bold">Contraseña:</p>
                  <p className="text-sm">{activeAccount.password}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-md font-bold">Fecha de expiracion:</p>
                  <p className="text-sm">
                    {new Date(activeAccount.expirationDate).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
