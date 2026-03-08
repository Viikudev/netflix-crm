"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { updateClientStatus } from "@/services/clientStatus";
import {
  renewClientStatusSchema,
  RenewClientStatusValues,
} from "@/lib/schemas";
import { ClientStatus } from "@/types/clientStatus";

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
  const queryClient = useQueryClient();

  // default to current date when opened
  const [date, setDate] = useState<Date | undefined>(new Date());

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<RenewClientStatusValues>({
    resolver: zodResolver(renewClientStatusSchema),
    defaultValues: {
      expirationDate: new Date().toISOString(),
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Force ACTIVE status and the newly selected date
      return await updateClientStatus(clientStatus.id, {
        status: "ACTIVE",
        expirationDate: date ? date.toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
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
            Renueva la suscripción de &quot;{clientStatus.clientName}&quot;.
            Establece la nueva fecha de expiración.
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
                  {/* {date ? (
                    format(date, "PPP", { locale: es })
                  ) : ( */}
                  <span>Elige una fecha</span>
                  {/* )} */}
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
              {mutation.isPending ? "Renovando..." : "Renovar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
