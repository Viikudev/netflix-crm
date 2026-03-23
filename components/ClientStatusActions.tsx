"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientStatus } from "@/services/clientStatus";
import { ClientStatus } from "@/types/clientStatus";
import UpdateClientStatusDialog from "@/components/UpdateClientStatusDialog";
import ClientStatusRenewDialog from "@/components/ClientStatusRenewDialog";
import ClientStatusMessageDialog from "@/components/ClientStatusMessageDialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, CreditCard, MessageCircle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientStatusActionsProps {
  clientStatus: ClientStatus;
}

export default function ClientStatusActions({
  clientStatus,
}: ClientStatusActionsProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
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

      <ClientStatusRenewDialog
        clientStatus={clientStatus}
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
      />

      <ClientStatusMessageDialog
        clientName={clientStatus.clientName}
        phoneNumber={clientStatus.phoneNumber}
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
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

      <div className="flex items-center justify-start gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUpdateDialog(true)}
              // title="Editar"
              className="size-7! cursor-pointer rounded-md bg-neutral-200 text-black hover:bg-neutral-200 hover:text-black"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar cliente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive! size-7! cursor-pointer rounded-md bg-red-200!"
              // title="Eliminar"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar cliente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowRenewDialog(true)}
              className="size-7! cursor-pointer rounded-md bg-black! text-white hover:text-white!"
              // title="Renovar"
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Renovar cliente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMessageDialog(true)}
              className="size-7! cursor-pointer rounded-md bg-green-500! text-white hover:text-white!"
              // title="Enviar mensaje"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={3} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enviar WhatsApp</p>
          </TooltipContent>
        </Tooltip>

        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive hover:text-destructive"
          title="Eliminar"
        >
          <Trash className="h-4 w-4" />
        </Button> */}
      </div>
    </>
  );
}
