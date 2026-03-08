"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActiveAccount } from "@/services/activeAccount";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";

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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

type FormValues = {
  email: string;
  password: string;
};

export default function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      let expirationDate = new Date().toISOString();
      if (date) {
        expirationDate = date.toISOString();
      }
      return await createActiveAccount({
        email: data.email,
        password: data.password,
        expirationDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeAccounts"] });
      reset();
      setServerError(null);
      setDate(undefined);
      setOpen(false);
    },
    onError: (err: unknown) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message =
        axiosErr?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to create account");
      setServerError(message);
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!date) {
      setServerError("La fecha de expiración es obligatoria");
      return;
    }
    setServerError(null);
    await mutation.mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Crear Cuenta</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Cuenta Activa</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una cuenta activa.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Correo Electrónico</Label>
            <Input
              type="email"
              {...register("email", {
                required: "El correo electrónico es obligatorio",
              })}
              placeholder="Ej: cuentanetflix@gmail.com"
            />
            {errors.email && (
              <p className="text-destructive">{String(errors.email.message)}</p>
            )}
          </div>

          <div>
            <Label>Contraseña</Label>
            <Input
              type="text"
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
              placeholder="Ingrese una contraseña valida"
            />
            {errors.password && (
              <p className="text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <Label>Fecha de Expiración</Label>
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

          {serverError && (
            <p className="text-destructive text-sm">{serverError}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                reset();
                setDate(undefined);
                setServerError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
