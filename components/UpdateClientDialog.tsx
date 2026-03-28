"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "@/services/clients";
import { createClientSchema } from "@/lib/schemas";
import { Client } from "@/types/client";

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

interface UpdateClientDialogProps {
  client: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateClientDialog({
  client,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateClientDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof createClientSchema>>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      clientName: client.clientName,
      phoneNumber: client.phoneNumber,
    },
  });

  useEffect(() => {
    reset({
      clientName: client.clientName,
      phoneNumber: client.phoneNumber,
    });
  }, [client, reset]);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof createClientSchema>) =>
      updateClient(client.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      setErrorMessage(null);
      setOpen?.(false);
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "No se pudo actualizar el cliente";

      setErrorMessage(message);
    },
  });

  const onSubmit = async (values: z.infer<typeof createClientSchema>) => {
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
          <DialogTitle>Actualizar cliente</DialogTitle>
          <DialogDescription>
            Modifique los datos del cliente.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Nombre del cliente</Label>
            <Input {...register("clientName")} />
            {errors.clientName && (
              <p className="text-destructive text-sm">
                {String(errors.clientName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Numero de telefono</Label>
            <Input {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-destructive text-sm">
                {String(errors.phoneNumber.message)}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-destructive text-sm">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen?.(false)}
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
