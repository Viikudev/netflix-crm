"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CreateClientStatusDialog from "./CreateClientStatusDialog";
import {
  fetchClientStatuses,
  updateClientStatus,
} from "@/services/clientStatus";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/client-status/columns";
import { differenceInDays } from "date-fns";
import { ClientStatus } from "@/types/clientStatus";

export default function ClientStatusTable() {
  const queryClient = useQueryClient();
  const {
    data: clientStatuses,
    isLoading,
    isError,
    error,
  } = useQuery<ClientStatus[]>({
    queryKey: ["clientStatuses"],
    queryFn: fetchClientStatuses,
  });

  React.useEffect(() => {
    if (!clientStatuses) return;

    const checkAndExpire = async () => {
      let hasUpdates = false;
      for (const client of clientStatuses) {
        if (client.status === "ACTIVE" && client.expirationDate) {
          const days = differenceInDays(
            new Date(client.expirationDate),
            new Date(),
          );
          if (days <= 0) {
            try {
              await updateClientStatus(client.id, { status: "EXPIRED" });
              hasUpdates = true;
            } catch (e) {
              console.error("Failed to auto-expire client", client.id, e);
            }
          }
        }
      }
      if (hasUpdates) {
        queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      }
    };

    checkAndExpire();
  }, [clientStatuses, queryClient]);

  async function handleCreated() {
    await queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
  }

  return (
    <Card className="col-span-2 gap-4 max-sm:col-span-1 max-sm:py-4">
      <CardHeader className="max-sm:px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Clientes activos</CardTitle>
          <CreateClientStatusDialog onCreated={handleCreated} />
        </div>
      </CardHeader>
      <CardContent className="max-sm:px-0">
        {isLoading ? (
          <div>Loading…</div>
        ) : isError ? (
          <div className="text-destructive">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={clientStatuses ?? []}
            getRowClassName={(row) => {
              if (row.status === "ACTIVE")
                return "bg-green-100 dark:bg-green-900/30";
              if (row.status === "EXPIRED")
                return "bg-red-100 dark:bg-red-900/30";
              return "";
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
