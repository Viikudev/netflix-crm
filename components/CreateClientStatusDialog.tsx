"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

import {
  createClientStatus,
  type CreateClientStatusPayload,
} from "@/services/clientStatus";
import { fetchServices } from "@/services/services";
import { fetchActiveAccount } from "@/services/activeAccount";
import { fetchScreens } from "@/services/screens";
import {
  createClientStatusSchema,
  type CreateClientStatusValues,
} from "@/lib/schemas";

import { ServiceProps } from "@/types/service";
import { ActiveAccountProps } from "@/types/activeAccount";
import { ScreenProps } from "@/types/screen";

export type CreateClientStatusDialogProps = {
  onCreated?: (item: CreateClientStatusPayload) => void;
};

export default function CreateClientStatusDialog({
  onCreated,
}: CreateClientStatusDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientStatusSchema),
    defaultValues: {
      clientName: "",
      phoneNumber: "",
      activeAccountId: "",
      serviceId: "",
      screenId: "",
      status: "ACTIVE",
      expirationDate: undefined,
    },
  });

  const selectedAccountId = watch("activeAccountId");

  const { data: services = [] } = useQuery<ServiceProps[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const { data: accounts = [] } = useQuery<ActiveAccountProps[]>({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  const { data: screens = [] } = useQuery<ScreenProps[]>({
    queryKey: ["screens", selectedAccountId],
    queryFn: () =>
      selectedAccountId ? fetchScreens(selectedAccountId) : Promise.resolve([]),
    enabled: !!selectedAccountId,
  });

  const mutation = useMutation({
    mutationFn: createClientStatus,
    onSuccess: (created) => {
      setOpen(false);
      reset();
      setDate(undefined);
      onCreated?.(created);
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
    },
    onError: (err: unknown) => {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response?.data?.message ||
        (err as Error).message ||
        "Request failed";
      setError(message);
    },
  });

  const onSubmit = (data: CreateClientStatusValues) => {
    setError(null);
    let expirationDate = data.expirationDate;

    if (date) {
      expirationDate = date.toISOString();
    }

    mutation.mutate({
      ...data,
      expirationDate,
    } as CreateClientStatusPayload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nuevo Cliente</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear registro de cliente</DialogTitle>
          <DialogDescription>
            Llena el formulario para crear un nuevo registro de estado de
            cliente.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-3"
        >
          <div className="col-span-2">
            <Label>Nombre del cliente</Label>
            <Input {...register("clientName")} placeholder="Ej: John Doe" />
            {errors.clientName && (
              <p className="text-destructive text-sm">
                {errors.clientName.message}
              </p>
            )}
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label>Número de teléfono</Label>
              <Input
                {...register("phoneNumber")}
                placeholder="Ej: 0424XXXXXXX"
              />
              {errors.phoneNumber && (
                <p className="text-destructive text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <Label>Cuenta activa</Label>
              <Select onValueChange={(val) => setValue("activeAccountId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cuentas activas</SelectLabel>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.activeAccountId && (
                <p className="text-destructive text-sm">
                  {errors.activeAccountId.message}
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label>Servicio</Label>
              <Select onValueChange={(val) => setValue("serviceId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Servicios</SelectLabel>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.serviceName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.serviceId && (
                <p className="text-destructive text-sm">
                  {errors.serviceId.message}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <Label>Pantalla / Perfil</Label>
              <Select
                onValueChange={(val) => setValue("screenId", val)}
                disabled={!selectedAccountId || screens.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedAccountId
                        ? "Selecciona una cuenta primero"
                        : screens.length === 0
                          ? "No hay pantallas"
                          : "Seleccionar perfil"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pantallas de la cuenta</SelectLabel>
                    {screens.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.profileName} (PIN: {s.profilePIN})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.screenId && (
                <p className="text-destructive text-sm">
                  {errors.screenId.message}
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2 flex flex-col">
            <Label>Fecha de expiración</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: es })
                  ) : (
                    <span>Elige una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}

          <DialogFooter className="col-span-2 flex-row justify-end">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
