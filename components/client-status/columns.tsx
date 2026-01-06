"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientStatus } from "@/types/clientStatus";
import ClientStatusActions from "@/components/ClientStatusActions";
import { differenceInDays } from "date-fns";

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
    accessorKey: "profileName",
    header: "Perfil",
  },
  {
    accessorKey: "profilePIN",
    header: "PIN",
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
      return STATUS_LABEL[status] ?? status;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => <ClientStatusActions clientStatus={row.original} />,
  },
];
