"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import CreateClientDialog from "@/components/CreateClientDialog";
import { columns } from "@/components/clients/columns";
import { fetchClients } from "@/services/clients";
import { Client } from "@/types/client";

export default function ClientsTable() {
  const { data, isLoading, isError, error } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  return (
    <Card className="gap-0 py-0 pb-0!">
      <CardHeader className="gap-0 py-4 shadow-md max-sm:gap-0 max-sm:px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Clientes</CardTitle>
          <CreateClientDialog />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-2 px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`clients-header-${index}`}
                  className="h-8 w-full"
                />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div
                key={`clients-row-${rowIndex}`}
                className="grid grid-cols-4 gap-2"
              >
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <Skeleton
                    key={`clients-cell-${rowIndex}-${cellIndex}`}
                    className="h-8 w-full"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-destructive px-4 py-3">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data ?? []}
            emptyMessage="No se encontraron clientes"
          />
        )}
      </CardContent>
    </Card>
  );
}
