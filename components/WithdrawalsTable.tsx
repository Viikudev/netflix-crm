"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithdrawals, type BankWithdrawal } from "@/services/bankEarnings";

function formatAmount(
  amountInCents: number,
  currency: BankWithdrawal["currency"],
) {
  const amount = amountInCents / 100;
  return `${amount.toFixed(2)} ${currency === "BS" ? "Bs" : "USDT"}`;
}

export default function WithdrawalsTable() {
  const {
    data: withdrawals,
    isLoading,
    isError,
    error,
  } = useQuery<BankWithdrawal[]>({
    queryKey: ["bankWithdrawals"],
    queryFn: fetchWithdrawals,
  });

  const columns = useMemo<ColumnDef<BankWithdrawal>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString("es-VE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        accessorKey: "currency",
        header: "Moneda",
        cell: ({ row }) => (row.original.currency === "BS" ? "Bs" : "USDT"),
      },
      {
        accessorKey: "amount",
        header: "Monto",
        cell: ({ row }) =>
          formatAmount(row.original.amount, row.original.currency),
      },
      {
        accessorKey: "reason",
        header: "Razón",
      },
    ],
    [],
  );

  return (
    <Card className="col-span-4 gap-4 pb-0! max-sm:col-span-1 max-sm:py-4">
      <CardHeader className="max-sm:px-4">
        <CardTitle className="text-lg font-bold">Retiros</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="space-y-2 px-6 py-4">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`withdrawal-header-skeleton-${index}`}
                  className="h-8 w-full"
                />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <div
                key={`withdrawal-row-skeleton-${rowIndex}`}
                className="grid grid-cols-4 gap-2"
              >
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <Skeleton
                    key={`withdrawal-cell-skeleton-${rowIndex}-${cellIndex}`}
                    className="h-8 w-full"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-destructive px-6 py-4">
            {error instanceof Error
              ? error.message
              : "Ocurrió un error cargando los retiros"}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={withdrawals ?? []}
            emptyMessage="No se encontraron retiros"
          />
        )}
      </CardContent>
    </Card>
  );
}
