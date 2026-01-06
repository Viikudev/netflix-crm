"use client";

import * as React from "react";
import { useState } from "react";
import { addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  createClientStatusSchema,
  type CreateClientStatusValues,
} from "@/lib/schemas";

import { ServiceProps } from "@/types/service";
import { ActiveAccountProps } from "@/types/activeAccount";

export type CreateClientStatusDialogProps = {
  onCreated?: (item: CreateClientStatusPayload) => void;
};

export default function CreateClientStatusDialog({
  onCreated,
}: CreateClientStatusDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClientStatusSchema),
    defaultValues: {
      clientName: "",
      phoneNumber: "",
      activeAccountId: "",
      serviceId: "",
      profileName: "",
      profilePIN: 0,
      status: "ACTIVE",
      expirationDate: undefined,
    },
  });

  const { data: services = [] } = useQuery<ServiceProps[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const { data: accounts = [] } = useQuery<ActiveAccountProps[]>({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  const mutation = useMutation({
    mutationFn: createClientStatus,
    onSuccess: (created) => {
      setOpen(false);
      reset();
      setDays("");
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
    if (days !== "" && !isNaN(Number(days))) {
      expirationDate = addDays(new Date(), Number(days)).toISOString();
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
          className="grid grid-cols-2 gap-3"
        >
          <div className="col-span-2">
            <Label>Nombre del cliente</Label>
            <Input {...register("clientName")} />
            {errors.clientName && (
              <p className="text-destructive text-sm">
                {errors.clientName.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Número de teléfono</Label>
            <Input {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-destructive text-sm">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Cuenta activa</Label>
            <Select onValueChange={(val) => setValue("activeAccountId", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select active account" />
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

          <div className="col-span-2">
            <Label>Servicio</Label>
            <Select onValueChange={(val) => setValue("serviceId", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service" />
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

          <div className="col-span-2">
            <Label>Perfil</Label>
            <Input {...register("profileName")} />
            {errors.profileName && (
              <p className="text-destructive text-sm">
                {errors.profileName.message}
              </p>
            )}
          </div>

          <div className="col-span-1">
            <Label>PIN del perfil</Label>
            <Input
              type="text"
              maxLength={4}
              inputMode="numeric"
              {...register("profilePIN")}
            />
            {errors.profilePIN && (
              <p className="text-destructive text-sm">
                {errors.profilePIN.message}
              </p>
            )}
          </div>

          <div className="col-span-1">
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
