"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteActiveAccount } from "@/features/streaming-services/services/active-accounts/activeAccount";
import { ActiveAccountActionsProps } from "@/features/streaming-services/types/activeAccount";
import UpdateActiveAccountDialog from "@/features/streaming-services/components/active-accounts/UpdateActiveAccountDialog";
import CreateScreenDialog from "@/features/streaming-services/components/active-accounts/CreateScreenDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Spinner } from "@/shared/components/ui/spinner";

export default function ActiveAccountActions({
  activeAccount,
}: ActiveAccountActionsProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateScreenDialog, setShowCreateScreenDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteActiveAccount(activeAccount.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAccounts"] });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Failed to delete active account:", error);
    },
  });

  return (
    <>
      <UpdateActiveAccountDialog
        activeAccount={activeAccount}
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
      />

      <CreateScreenDialog
        activeAccountId={activeAccount.id}
        open={showCreateScreenDialog}
        onOpenChange={setShowCreateScreenDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la cuenta activa &quot;{activeAccount.email}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner />
                  Eliminando
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
            <Pencil className="h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCreateScreenDialog(true)}>
            <Plus className="h-4 w-4" />
            <span>Agregar pantalla</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="focus:bg-destructive/10 text-destructive focus:text-destructive"
          >
            <Trash className="text-destructive h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
