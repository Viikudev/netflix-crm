"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActiveAccount } from "@/services/activeAccount";
import {
  createActiveAccountSchema,
  CreateActiveAccountValues,
} from "@/lib/schemas";
import type { ActiveAccountProps } from "@/types/activeAccount";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

interface UpdateActiveAccountDialogProps {
  activeAccount: ActiveAccountProps;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateActiveAccountDialog({
  activeAccount,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateActiveAccountDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createActiveAccountSchema>>({
    resolver: zodResolver(createActiveAccountSchema),
    defaultValues: {
      email: activeAccount.email,
      password: activeAccount.password,
      expirationDate: new Date(activeAccount.expirationDate)
        .toISOString()
        .split("T")[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateActiveAccountValues) => {
      return await updateActiveAccount(activeAccount.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAccounts"] });
      if (setOpen) setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to update active account:", error);
    },
  });

  const onSubmit = async (values: CreateActiveAccountValues) => {
    await mutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Cuenta Activa</DialogTitle>
          <DialogDescription>
            Modifique los datos de la cuenta activa.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Email</Label>
            <Input {...register("email")} />
            {errors.email && (
              <p className="text-destructive">{String(errors.email.message)}</p>
            )}
          </div>

          <div>
            <Label>Contraseña</Label>
            <Input {...register("password")} />
            {errors.password && (
              <p className="text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Fecha de Expiración</Label>
            <Input type="date" {...register("expirationDate")} />
            {errors.expirationDate && (
              <p className="text-destructive">
                {String(errors.expirationDate.message)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen && setOpen(false)}
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
