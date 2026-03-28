"use client";

import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useBinancePrice } from "@/context/BinancePriceContext";
import { updateClientStatus } from "@/services/clientStatus";
import {
  renewClientStatusSchema,
  RenewClientStatusValues,
} from "@/lib/schemas";
import { ClientStatus } from "@/types/clientStatus";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientStatusRenewDialogProps {
  clientStatus: ClientStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClientStatusRenewDialog({
  clientStatus,
  open,
  onOpenChange,
}: ClientStatusRenewDialogProps) {
  const clientName = clientStatus.client?.clientName ?? clientStatus.clientName;
  const queryClient = useQueryClient();

  // default to current date when opened
  const [date, setDate] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RenewClientStatusValues>({
    resolver: zodResolver(renewClientStatusSchema),
    defaultValues: {
      expirationDate: new Date().toISOString(),
      priceSource: "BINANCE",
      customUsdtRate: null,
      supplierPrice: 0,
    },
  });

  const selectedPriceSource = watch("priceSource");
  const customUsdtRate = watch("customUsdtRate");
  const supplierPrice = watch("supplierPrice");

  const { price: binancePrice } = useBinancePrice();

  // Calculate price dynamically if a service object and price exist
  const calculatedAmount = useMemo(() => {
    const serviceWithPrice = clientStatus.service as { price?: number } | null;
    if (
      !date ||
      !serviceWithPrice ||
      typeof serviceWithPrice.price !== "number"
    )
      return null;
    const servicePriceCents = serviceWithPrice.price;

    const days = differenceInDays(date, new Date());
    if (days <= 0)
      return { cents: 0, usdFormatted: "0.00", bsFormatted: "0.00 Bs" };

    const usdPriceCents = (servicePriceCents / 30) * days;
    const usdPriceFormatted = (usdPriceCents / 100).toFixed(2);

    const rate =
      selectedPriceSource === "CUSTOM"
        ? typeof customUsdtRate === "number" && customUsdtRate >= 0
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
    clientStatus.service,
    binancePrice,
    selectedPriceSource,
    customUsdtRate,
    supplierPrice,
  ]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Force ACTIVE status and the newly selected date
      return await updateClientStatus(clientStatus.id, {
        status: "ACTIVE",
        amount: calculatedAmount?.cents ?? null,
        expirationDate: date ? date.toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["bankEarnings"] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to renew client status:", error);
    },
  });

  const onSubmit = async () => {
    if (!date) return;
    await mutation.mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renovar Cliente</DialogTitle>
          <DialogDescription>
            Renueva la suscripción de &quot;{clientName}&quot;. Establece la
            nueva fecha de expiración.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Nueva fecha de expiración</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "text-muted-foreground mt-2 w-full justify-start text-left font-normal",
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

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label>Modo de tasa USDT</Label>
                <Select
                  defaultValue="BINANCE"
                  onValueChange={(val) =>
                    setValue("priceSource", val as "BINANCE" | "CUSTOM")
                  }
                >
                  <SelectTrigger className="mt-2 w-full">
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
                <div>
                  <Label>Tasa USDT manual</Label>
                  <Input
                    className="mt-2"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 105.25"
                    {...register("customUsdtRate", { valueAsNumber: true })}
                  />
                  {errors.customUsdtRate && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.customUsdtRate.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Label>Precio proveedor (Bs)</Label>
              <Input
                className="mt-2"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 250.00"
                {...register("supplierPrice", { valueAsNumber: true })}
              />
              {errors.supplierPrice && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.supplierPrice.message}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {calculatedAmount && (
              <div className="space-y-1 rounded-md p-0 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">
                    Servicio calculado:
                  </span>
                  <span>{calculatedAmount.usdFormatted} USD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">
                    Monto bruto (Bs):
                  </span>
                  <span>{calculatedAmount.grossBsFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">
                    Precio proveedor (Bs):
                  </span>
                  <span>- {calculatedAmount.supplierBsFormatted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-700">
                    Monto neto a guardar:
                  </span>
                  <span className="text-md font-bold">
                    {calculatedAmount.netBsFormatted}
                  </span>
                </div>
              </div>
            )}

            {!date && (
              <p className="text-destructive mt-1 text-sm">
                La fecha de expiración es requerida
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending || !date}>
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Renovando
                </>
              ) : (
                "Renovar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
