"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateClientStatus } from "@/services/clientStatus";
import {
  createClientStatusSchema,
  CreateClientStatusValues,
} from "@/lib/schemas";
import { ClientStatus } from "@/types/clientStatus";
import { fetchServices } from "@/services/services";
import { fetchActiveAccount } from "@/services/activeAccount";
import { ServiceProps } from "@/types/service";
import { ActiveAccountProps } from "@/types/activeAccount";
import { addDays, differenceInDays } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateClientStatusDialogProps {
  clientStatus: ClientStatus;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateClientStatusDialog({
  clientStatus,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: UpdateClientStatusDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;
  const queryClient = useQueryClient();

  const [days, setDays] = useState<number | "">(() => {
    if (!clientStatus.expirationDate) return "";
    const diff = differenceInDays(
      new Date(clientStatus.expirationDate),
      new Date(),
    );
    return diff >= 0 ? diff : 0;
  });

  const services = useQuery<ServiceProps[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const activeAccounts = useQuery<ActiveAccountProps[]>({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientStatusSchema),
    defaultValues: {
      clientName: clientStatus.clientName,
      phoneNumber: clientStatus.phoneNumber,
      activeAccountId: clientStatus.activeAccountId,
      serviceId: clientStatus.serviceId,
      profileName: clientStatus.profileName,
      profilePIN: Number(clientStatus.profilePIN),
      status:
        (clientStatus.status as "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION") ??
        "NEAR_EXPIRATION",
      expirationDate: clientStatus.expirationDate
        ? new Date(clientStatus.expirationDate).toISOString().split("T")[0]
        : null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateClientStatusValues) => {
      let expirationDate = data.expirationDate;
      if (days !== "" && !isNaN(Number(days))) {
        expirationDate = addDays(new Date(), Number(days)).toISOString();
      }
      return await updateClientStatus(clientStatus.id, {
        ...data,
        expirationDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      if (setOpen) setOpen(false);
    },
    onError: (error) => {
      console.error("Failed to update client status:", error);
    },
  });

  const onSubmit = async (values: CreateClientStatusValues) => {
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Actualizar Estado del Cliente</DialogTitle>
          <DialogDescription>
            Modifique los datos del estado del cliente.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Nombre del Cliente</Label>
            <Input {...register("clientName")} />
            {errors.clientName && (
              <p className="text-destructive">
                {String(errors.clientName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Teléfono</Label>
            <Input {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-destructive">
                {String(errors.phoneNumber.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Cuenta Activa</Label>
            <Select
              onValueChange={(val) => setValue("activeAccountId", val)}
              defaultValue={clientStatus.activeAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.data?.map((account: ActiveAccountProps) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activeAccountId && (
              <p className="text-destructive">
                {String(errors.activeAccountId.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Servicio</Label>
            <Select
              onValueChange={(val) => setValue("serviceId", val)}
              defaultValue={clientStatus.serviceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.data?.map((service: ServiceProps) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.serviceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-destructive">
                {String(errors.serviceId.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Nombre del Perfil</Label>
            <Input {...register("profileName")} />
            {errors.profileName && (
              <p className="text-destructive">
                {String(errors.profileName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>PIN del Perfil</Label>
            <Input
              type="number"
              {...register("profilePIN", { valueAsNumber: true })}
            />
            {errors.profilePIN && (
              <p className="text-destructive">
                {String(errors.profilePIN.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Estado</Label>
            <Select
              onValueChange={(val) =>
                setValue(
                  "status",
                  val as "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION",
                )
              }
              defaultValue={clientStatus.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="EXPIRED">Expirado</SelectItem>
                <SelectItem value="NEAR_EXPIRATION">Por expirar</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-destructive">
                {String(errors.status.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Días de duración</Label>
            <Input
              type="number"
              placeholder="Ej: 30"
              value={days}
              onChange={(e) => {
                const val = e.target.value;
                setDays(val === "" ? "" : Number(val));
              }}
            />
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
