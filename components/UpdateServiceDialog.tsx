"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateService } from "@/services/services";
import { createServiceSchema, CreateServiceValues } from "@/lib/schemas";
import type { ServiceProps } from "@/types/service";

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

interface UpdateServiceDialogProps {
  service: ServiceProps;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateServiceDialog({
  service,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateServiceDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    // reset,
    formState: { errors },
  } = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      serviceName: service.serviceName,
      price: service.price / 100, // Convert cents to dollars
      description: service.description ?? "",
      currency: service.currency,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateServiceValues) => {
      const payload = {
        serviceName: data.serviceName,
        description: data.description ?? "",
        price: data.price,
        currency: data.currency ?? "USD",
        imageUrl: data.imageUrl,
      };
      return await updateService(service.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setOpen?.(false);
    },
    onError: (error) => {
      console.error("Failed to update service:", error);
    },
  });

  const onSubmit = async (values: CreateServiceValues) => {
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
          <DialogTitle>Actualizar Servicio</DialogTitle>
          <DialogDescription>
            Modifique los datos del servicio.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Nombre del servicio</Label>
            <Input {...register("serviceName")} />
            {errors.serviceName && (
              <p className="text-destructive">
                {String(errors.serviceName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Precio (USD)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-destructive">{String(errors.price.message)}</p>
            )}
          </div>

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
