"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientStatus } from "@/services/clientStatus";
import { ClientStatus } from "@/types/clientStatus";
import UpdateClientStatusDialog from "@/components/UpdateClientStatusDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClientStatusActionsProps {
  clientStatus: ClientStatus;
}

export default function ClientStatusActions({
  clientStatus,
}: ClientStatusActionsProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteClientStatus(clientStatus.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Failed to delete client status:", error);
    },
  });

  return (
    <>
      <UpdateClientStatusDialog
        clientStatus={clientStatus}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el estado del cliente &quot;{clientStatus.clientName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowUpdateDialog(true)}
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive"
          title="Eliminar"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
