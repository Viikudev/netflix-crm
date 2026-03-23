"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useBinancePrice } from "@/context/BinancePriceContext";

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
import { Separator } from "@/components/ui/separator";
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
  } = useForm<CreateClientStatusValues>({
    resolver: zodResolver(createClientStatusSchema),
    defaultValues: {
      clientName: "",
      phoneNumber: "",
      activeAccountId: "",
      serviceId: "",
      screenId: "",
      status: "ACTIVE",
      expirationDate: undefined,
      priceSource: "BINANCE",
      customUsdtRate: null,
      supplierPrice: 0,
    },
  });

  const selectedAccountId = watch("activeAccountId");
  const selectedServiceId = watch("serviceId");
  const selectedPriceSource = watch("priceSource");
  const customUsdtRate = watch("customUsdtRate");
  const supplierPrice = watch("supplierPrice");

  const { data: services = [] } = useQuery<ServiceProps[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const { data: accounts = [] } = useQuery<ActiveAccountProps[]>({
    queryKey: ["activeAccounts"],
    queryFn: fetchActiveAccount,
  });

  const { price: binancePrice } = useBinancePrice();

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
      queryClient.invalidateQueries({ queryKey: ["bankEarnings"] });
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

  const calculatedAmount = useMemo(() => {
    if (!date || !selectedServiceId || !services.length) return null;
    const selectedService = services.find((s) => s.id === selectedServiceId);
    if (!selectedService) return null;

    const days = differenceInDays(date, new Date());
    if (days <= 0)
      return { cents: 0, usdFormatted: "0.00", bsFormatted: "0.00 Bs" };

    // service.price is in cents
    const usdPriceCents = (selectedService.price / 30) * days;
    const usdPriceFormatted = (usdPriceCents / 100).toFixed(2);

    const rate =
      selectedPriceSource === "CUSTOM"
        ? typeof customUsdtRate === "number" && customUsdtRate > 0
          ? customUsdtRate
          : null
        : binancePrice;

    const grossBsFloat = rate ? (usdPriceCents / 100) * rate : 0;
    const supplierBs =
      typeof supplierPrice === "number" && supplierPrice >= 0
        ? supplierPrice
        : 0;
    const netBsFloat = Math.max(grossBsFloat - supplierBs, 0);

    return {
      cents: Math.round(netBsFloat * 100),
      usdFormatted: usdPriceFormatted,
      grossBsFormatted: rate
        ? `${grossBsFloat.toFixed(2)} Bs`
        : "Calculando...",
      supplierBsFormatted: `${supplierBs.toFixed(2)} Bs`,
      netBsFormatted: `${netBsFloat.toFixed(2)} Bs`,
    };
  }, [
    date,
    selectedServiceId,
    services,
    binancePrice,
    selectedPriceSource,
    customUsdtRate,
    supplierPrice,
  ]);

  const onSubmit = (data: CreateClientStatusValues) => {
    setError(null);
    let expirationDate = data.expirationDate;

    if (date) {
      expirationDate = date.toISOString();
    }

    mutation.mutate({
      clientName: data.clientName,
      phoneNumber: data.phoneNumber,
      activeAccountId: data.activeAccountId,
      serviceId: data.serviceId,
      screenId: data.screenId,
      status: data.status,
      expirationDate,
      amount: calculatedAmount?.cents ?? null,
    });
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

          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label>Modo de tasa USDT</Label>
              <Select
                defaultValue="BINANCE"
                onValueChange={(val) =>
                  setValue("priceSource", val as "BINANCE" | "CUSTOM")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="BINANCE">Usar Binance</SelectItem>
                    <SelectItem value="CUSTOM">Tasa manual</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {selectedPriceSource === "CUSTOM" && (
              <div className="col-span-1">
                <Label>Tasa USDT manual</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ej: 105.25"
                  {...register("customUsdtRate", { valueAsNumber: true })}
                />
                {errors.customUsdtRate && (
                  <p className="text-destructive text-sm">
                    {errors.customUsdtRate.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label>Precio proveedor (Bs)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 250.00"
              {...register("supplierPrice", { valueAsNumber: true })}
            />
            {errors.supplierPrice && (
              <p className="text-destructive text-sm">
                {errors.supplierPrice.message}
              </p>
            )}
          </div>

          <Separator className="col-span-2 my-2" />

          {calculatedAmount && (
            <div className="col-span-2 space-y-1 rounded-md p-0 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">
                  Servicio calculado:
                </span>
                <span className="text-neutral-900">
                  {calculatedAmount.usdFormatted} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">
                  Monto bruto (Bs):
                </span>
                <span className="text-neutral-900">
                  {calculatedAmount.grossBsFormatted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">
                  Precio proveedor (Bs):
                </span>
                <span className="text-neutral-900">
                  - {calculatedAmount.supplierBsFormatted}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-700">
                  Monto neto a guardar:
                </span>
                <span className="text-md font-bold text-neutral-900">
                  {calculatedAmount.netBsFormatted}
                </span>
              </div>
            </div>
          )}

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
