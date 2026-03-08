"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateScreen } from "@/services/screens";
import { updateScreenSchema, UpdateScreenValues } from "@/lib/schemas";
import type { ScreenProps } from "@/types/screen";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateScreenDialogProps {
  screen: ScreenProps;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateScreenDialog({
  screen,
  open,
  onOpenChange,
}: UpdateScreenDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateScreenValues>({
    resolver: zodResolver(updateScreenSchema),
    defaultValues: {
      profileName: screen.profileName,
      profilePIN: screen.profilePIN,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateScreenValues) => {
      return await updateScreen(screen.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to update screen:", error);
    },
  });

  const onSubmit = async (values: UpdateScreenValues) => {
    await mutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Pantalla</DialogTitle>
          <DialogDescription>
            Modifique el nombre o PIN del perfil.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Nombre del perfil</Label>
            <Input {...register("profileName")} />
            {errors.profileName && (
              <p className="text-destructive text-sm font-medium">
                {String(errors.profileName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>PIN</Label>
            <Input type="number" {...register("profilePIN")} />
            {errors.profilePIN && (
              <p className="text-destructive text-sm font-medium">
                {String(errors.profilePIN.message)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
