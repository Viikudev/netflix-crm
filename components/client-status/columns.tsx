"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientStatus } from "@/types/clientStatus";
import ClientStatusActions from "@/components/ClientStatusActions";
import EditableTextCell from "@/components/client-status/EditableTextCell";
import { differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  EXPIRED: "Expirado",
  NEAR_EXPIRATION: "Cerca de expirar",
};

function getDerivedStatus(
  row: ClientStatus,
): "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION" {
  const currentStatus = row.status as "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION";

  if (currentStatus === "EXPIRED") return "EXPIRED";

  if (!row.expirationDate)
    return currentStatus === "NEAR_EXPIRATION" ? "NEAR_EXPIRATION" : "ACTIVE";

  const days = differenceInDays(new Date(row.expirationDate), new Date()) + 1;

  if (days < 0) return "EXPIRED";
  if (days <= 3) return "NEAR_EXPIRATION";

  return "ACTIVE";
}

export const columns: ColumnDef<ClientStatus>[] = [
  {
    accessorKey: "clientName",
    header: () => <div className="w-60">Cliente</div>,
    cell: ({ row, getValue }) => (
      <EditableTextCell
        clientStatusId={row.original.id}
        field="clientName"
        value={(getValue() as string) ?? ""}
      />
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: () => <div className="w-50">Telefono</div>,
    cell: ({ row, getValue }) => (
      <EditableTextCell
        clientStatusId={row.original.id}
        field="phoneNumber"
        value={(getValue() as string) ?? ""}
      />
    ),
  },
  {
    id: "activeAccount",
    header: () => <div className="w-40">Cuenta activa</div>,
    accessorFn: (row) => row.activeAccount?.email ?? row.activeAccountId,
  },
  {
    id: "service",
    header: () => <div className="w-40">Servicio</div>,
    accessorFn: (row) => row.service?.serviceName ?? row.serviceId,
  },
  {
    id: "profileName",
    header: () => <div className="w-40">Perfil</div>,
    accessorFn: (row) => row.screen?.profileName ?? "-",
  },
  {
    id: "profilePIN",
    header: () => <div className="w-40">PIN</div>,
    accessorFn: (row) => row.screen?.profilePIN ?? "-",
  },
  {
    accessorKey: "expirationDate",
    header: () => <div className="w-40">Días restantes</div>,
    cell: ({ row, getValue }) => {
      const status = row.getValue("status") as string;
      // const status = getDerivedStatus(row.original);
      if (status === "EXPIRED") return "Expirado";
      if (status === "NEAR_EXPIRATION") return "Cerca de expirar";

      const val = getValue() as string | null | undefined;
      if (!val) return "-";
      const days = differenceInDays(new Date(val), new Date()) + 1;
      return days >= 0 ? `${days} días` : "Expirado";
    },
  },
  {
    accessorKey: "status",
    header: "Estado de pago",
    cell: ({ row }) => {
      const status = getDerivedStatus(row.original);
      const label = STATUS_LABEL[status] ?? status;

      if (status === "ACTIVE") {
        return <Badge className="bg-green-200 text-green-700">{label}</Badge>;
      }

      if (status === "EXPIRED") {
        return <Badge className="bg-red-200 text-red-700">{label}</Badge>;
      }

      if (status === "NEAR_EXPIRATION") {
        return <Badge className="bg-yellow-200 text-yellow-700">{label}</Badge>;
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
