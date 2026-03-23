"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateClientStatus } from "@/services/clientStatus";
import { fetchServices } from "@/services/services";
import { fetchActiveAccount } from "@/services/activeAccount";
import { fetchScreens } from "@/services/screens";
import {
  updateClientStatusSchema,
  UpdateClientStatusValues,
} from "@/lib/schemas";
import { ClientStatus } from "@/types/clientStatus";
import { ServiceProps } from "@/types/service";
import { ActiveAccountProps } from "@/types/activeAccount";
import { ScreenProps } from "@/types/screen";

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
  SelectLabel,
  SelectGroup,
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
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateClientStatusSchema),
    defaultValues: {
      clientName: clientStatus.clientName,
      phoneNumber: clientStatus.phoneNumber,
      activeAccountId: clientStatus.activeAccountId,
      serviceId: clientStatus.serviceId,
      screenId: clientStatus.screenId,
      status:
        (clientStatus.status as "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION") ??
        "NEAR_EXPIRATION",
      expirationDate: clientStatus.expirationDate
        ? new Date(clientStatus.expirationDate).toISOString().split("T")[0]
        : null,
    },
  });

  const selectedAccountId = useWatch({
    control,
    name: "activeAccountId",
  });

  const screens = useQuery<ScreenProps[]>({
    queryKey: ["screens", selectedAccountId],
    queryFn: () =>
      selectedAccountId ? fetchScreens(selectedAccountId) : Promise.resolve([]),
    enabled: !!selectedAccountId,
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateClientStatusValues) => {
      return await updateClientStatus(clientStatus.id, {
        ...data,
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

  const onSubmit = async (values: UpdateClientStatusValues) => {
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

          <div className="grid grid-cols-2 gap-4">
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cuentas Activas</SelectLabel>
                    {activeAccounts.data?.map((account: ActiveAccountProps) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.activeAccountId && (
                <p className="text-destructive">
                  {String(errors.activeAccountId.message)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Servicio</Label>
              <Select
                onValueChange={(val) => setValue("serviceId", val)}
                defaultValue={clientStatus.serviceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Servicios</SelectLabel>
                    {services.data?.map((service: ServiceProps) => (
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
              <Label>Perfil</Label>
              <Select
                onValueChange={(val) => setValue("screenId", val)}
                defaultValue={clientStatus.screenId}
                disabled={
                  !selectedAccountId || (screens.data?.length ?? 0) === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedAccountId
                        ? "Seleccione una cuenta primero"
                        : screens.data?.length === 0
                          ? "No hay pantallas"
                          : "Seleccione una pantalla"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Perfiles</SelectLabel>
                    {screens.data?.map((screen: ScreenProps) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.profileName} (PIN: {screen.profilePIN})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.screenId && (
                <p className="text-destructive">
                  {String(errors.screenId.message)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
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
