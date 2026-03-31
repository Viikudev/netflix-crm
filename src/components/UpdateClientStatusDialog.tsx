"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateClientStatus } from "@/services/clientStatus";
import { fetchClients } from "@/services/clients";
import { fetchServices } from "@/services/services";
import { fetchActiveAccount } from "@/services/activeAccount";
import { fetchScreens } from "@/services/screens";
import {
  updateClientStatusSchema,
  UpdateClientStatusValues,
} from "@/lib/schemas";
import { ClientStatus } from "@/types/clientStatus";
import { Client } from "@/types/client";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { UpdateClientStatusDialogProps } from "@/types/clientStatus";

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

  const clients = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const activeAccounts = useQuery<ActiveAccountProps[]>({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateClientStatusSchema),
    defaultValues: {
      clientId: clientStatus.clientId,
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

  const selectedClientId = useWatch({
    control,
    name: "clientId",
  });

  const selectedClient =
    clients.data?.find((client) => client.id === selectedClientId) ?? null;

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
          <DialogTitle>Actualizar suscripcion</DialogTitle>
          <DialogDescription>
            Modifique los datos de la suscripcion.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Cliente</Label>
            <Select
              value={selectedClientId || undefined}
              onValueChange={(value) =>
                setValue("clientId", value, { shouldValidate: true })
              }
              disabled={clients.isLoading || (clients.data?.length ?? 0) === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="max-h-70 overflow-y-auto">
                  <SelectLabel className="sticky top-0 z-999 bg-white!">
                    Clientes
                  </SelectLabel>
                  {(clients.data ?? []).map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.clientName} ({client.phoneNumber})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-1 text-xs">
              Si no encuentras el cliente, crealo primero en la pestaña
              Clientes.
            </p>
            {errors.clientId && (
              <p className="text-destructive">
                {String(errors.clientId.message)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefono</Label>
              <Input value={selectedClient?.phoneNumber ?? ""} readOnly />
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
