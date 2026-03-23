"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientStatus } from "@/types/clientStatus";
import ClientStatusActions from "@/components/ClientStatusActions";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  NEAR_EXPIRATION: "Por expirar",
};

export const columns: ColumnDef<ClientStatus>[] = [
  {
    accessorKey: "clientName",
    header: "Cliente",
  },
  {
    accessorKey: "phoneNumber",
    header: "Telefono",
  },
  {
    id: "activeAccount",
    header: "Cuenta activa",
    accessorFn: (row) => row.activeAccount?.email ?? row.activeAccountId,
  },
  {
    id: "service",
    header: "Servicio",
    accessorFn: (row) => row.service?.serviceName ?? row.serviceId,
  },
  {
    id: "profileName",
    header: "Perfil",
    accessorFn: (row) => row.screen?.profileName ?? "-",
  },
  {
    id: "profilePIN",
    header: "PIN",
    accessorFn: (row) => row.screen?.profilePIN ?? "-",
  },
  {
    accessorKey: "expirationDate",
    header: "Días restantes",
    cell: ({ row, getValue }) => {
      const status = row.getValue("status") as string;
      if (status === "EXPIRED") return "Expirado";

      const val = getValue() as string | null | undefined;
      if (!val) return "-";
      const days = differenceInDays(new Date(val), new Date());
      return days >= 0 ? `${days} días` : "Expirado";
    },
  },
  {
    accessorKey: "status",
    header: "Estado de pago",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const label = STATUS_LABEL[status] ?? status;

      if (status === "ACTIVE") {
        return <Badge className="bg-green-200 text-green-700">{label}</Badge>;
      }
      if (status === "EXPIRED") {
        return <Badge className="bg-red-200 text-red-700">{label}</Badge>;
      }
      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ getValue }) => {
      const amount = getValue() as number | null | undefined;
      return amount != null ? `${(amount / 100).toFixed(2)} Bs` : "-";
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ClientStatusActions clientStatus={row.original} />,
  },
];
