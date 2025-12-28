"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createActiveAccount } from "@/services/activeAccount";
import { CalendarIcon } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import type { AxiosError } from "axios";

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
  expirationDate: string; // datetime-local value
};

export default function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expirationText, setExpirationText] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: "", password: "", expirationDate: "" },
  });

  const selectedDate = useMemo(() => {
    const trimmed = expirationText.trim();
    if (!trimmed) return undefined;

    // Primary display format: "May 31, 2025"
    const parsedShort = parse(trimmed, "MMM d, yyyy", new Date());
    if (isValid(parsedShort)) return parsedShort;

    // Allow full month names too: "May" vs "May" (e.g. "September 1, 2025")
    const parsedLong = parse(trimmed, "MMMM d, yyyy", new Date());
    if (isValid(parsedLong)) return parsedLong;

    // Back-compat: allow manual numeric entry if someone types it.
    const parsedNumeric = parse(trimmed, "dd-MM-yyyy", new Date());
    if (trimmed.length === 10 && isValid(parsedNumeric)) return parsedNumeric;

    return undefined;
  }, [expirationText]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // convert datetime-local to ISO
      const iso = new Date(data.expirationDate).toISOString();
      return await createActiveAccount({
        email: data.email,
        password: data.password,
        expirationDate: iso,
      });
    },
    onSuccess: () => {
      reset();
      setServerError(null);
      setExpirationText("");
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
            />
            {errors.password && (
              <p className="text-destructive">
                {String(errors.password.message)}
              </p>
            )}
          </div>

          <div>
            <Label>Fecha de Expiración</Label>

            <input
              type="hidden"
              {...register("expirationDate", {
                required: "La fecha de expiración es obligatoria",
              })}
            />

            <div className="relative">
              <Input
                placeholder="May 31, 2025"
                value={expirationText}
                onChange={(e) => {
                  const nextText = e.target.value;
                  setExpirationText(nextText);

                  const parsed = (() => {
                    const trimmed = nextText.trim();
                    if (!trimmed) return undefined;
                    const short = parse(trimmed, "MMM d, yyyy", new Date());
                    if (isValid(short)) return short;
                    const long = parse(trimmed, "MMMM d, yyyy", new Date());
                    if (isValid(long)) return long;
                    const numeric = parse(trimmed, "dd-MM-yyyy", new Date());
                    if (trimmed.length === 10 && isValid(numeric))
                      return numeric;
                    return undefined;
                  })();

                  if (parsed) {
                    setValue("expirationDate", parsed.toISOString(), {
                      shouldValidate: true,
                    });
                  }
                }}
                onBlur={() => {
                  if (!expirationText) {
                    setValue("expirationDate", "", { shouldValidate: true });
                    return;
                  }

                  const trimmed = expirationText.trim();
                  const parsed = (() => {
                    const short = parse(trimmed, "MMM d, yyyy", new Date());
                    if (isValid(short)) return short;
                    const long = parse(trimmed, "MMMM d, yyyy", new Date());
                    if (isValid(long)) return long;
                    const numeric = parse(trimmed, "dd-MM-yyyy", new Date());
                    if (trimmed.length === 10 && isValid(numeric))
                      return numeric;
                    return undefined;
                  })();

                  if (!parsed) {
                    setValue("expirationDate", "", { shouldValidate: true });
                    return;
                  }

                  setExpirationText(format(parsed, "MMM d, yyyy"));
                  setValue("expirationDate", parsed.toISOString(), {
                    shouldValidate: true,
                  });
                }}
              />

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    aria-label="Abrir calendario"
                  >
                    <CalendarIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        if (!d) return;
                        setExpirationText(format(d, "MMM d, yyyy"));
                        setValue("expirationDate", d.toISOString(), {
                          shouldValidate: true,
                        });
                        setCalendarOpen(false);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {errors.expirationDate && (
              <p className="text-destructive">
                {String(errors.expirationDate.message)}
              </p>
            )}
          </div>

          {serverError && <p className="text-destructive">{serverError}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
