"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateActiveAccount } from "@/features/streaming-services/services/active-accounts/activeAccount";
import { fetchServices } from "@/features/streaming-services/services/service-management/services";
import {
  createActiveAccountSchema,
  CreateActiveAccountValues,
} from "@/features/streaming-services/schemas";
// import type { ActiveAccountProps } from "@/features/streaming-services/types/activeAccount";
import type { ServiceProps } from "@/features/streaming-services/types/service";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Spinner } from "@/shared/components/ui/spinner";
import { z } from "zod";
import { UpdateActiveAccountDialogProps } from "@/features/streaming-services/types/activeAccount";

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
    control,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof createActiveAccountSchema>>({
    resolver: zodResolver(createActiveAccountSchema),
    defaultValues: {
      email: activeAccount.email,
      password: activeAccount.password,
      serviceId: activeAccount.serviceId ?? "",
      expirationDate: new Date(activeAccount.expirationDate)
        .toISOString()
        .split("T")[0],
    },
  });

  const selectedServiceId = useWatch({
    control,
    name: "serviceId",
  });

  const servicesQuery = useQuery<ServiceProps[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
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
          <input type="hidden" {...register("serviceId")} />

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
            <Label>Servicio</Label>
            <Select
              value={selectedServiceId}
              onValueChange={(val) => setValue("serviceId", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione un servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Servicios</SelectLabel>
                  {servicesQuery.data?.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.serviceName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-destructive">
                {String(errors.serviceId.message)}
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
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Guardar cambios
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
