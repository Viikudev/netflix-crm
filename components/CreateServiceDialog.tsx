"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "@/services/services";
import { createServiceSchema, CreateServiceValues } from "@/lib/schemas";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";

export default function CreateServiceDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof createServiceSchema>>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      serviceName: "",
      price: 0,
      imageUrl: "",
      description: "",
      currency: "USD",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateServiceValues) => {
      const payload = {
        serviceName: data.serviceName,
        description: data.description ?? "",
        price: data.price,
        currency: data.currency ?? "USD",
      };
      return await createService(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to create service:", error);
    },
  });

  const onSubmit = async (values: CreateServiceValues) => {
    await mutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Servicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Formulario para crear servicio</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo servicio.
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

          <div>
            <Label>URL de la imagen</Label>
            <Input {...register("imageUrl")} />
            {errors.imageUrl && (
              <p className="text-destructive">
                {String(errors.imageUrl.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea {...register("description")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
