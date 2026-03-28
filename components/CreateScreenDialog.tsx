"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { createScreenSchema, CreateScreenValues } from "@/lib/schemas";
import { createScreen } from "@/services/screens";

export default function CreateScreenDialog({
  activeAccountId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  activeAccountId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen! : setUncontrolledOpen;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createScreenSchema),
    defaultValues: {
      profileName: "",
      profilePIN: 0,
      activeAccountId,
    },
  });

  const mutation = useMutation({
    mutationFn: createScreen,
    onSuccess: () => {
      setOpen(false);
      reset();
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["screens"] });
      // Since screen belong to account, maybe we invalidate activeAccounts too to reflect screen counts later
      queryClient.invalidateQueries({ queryKey: ["activeAccounts"] });
    },
    onError: (err: unknown) => {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).response?.data?.message ||
        (err as Error).message ||
        "Failed to create screen";
      setServerError(message);
    },
  });

  const onSubmit = (data: CreateScreenValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            + Pantalla
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Pantalla / Perfil</DialogTitle>
          <DialogDescription>
            Crea una nueva pantalla para esta cuenta. (Máximo 5)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre del Perfil</Label>
            <Input {...register("profileName")} placeholder="Ej: Kids" />
            {errors.profileName && (
              <p className="text-destructive text-sm">
                {String(errors.profileName.message)}
              </p>
            )}
          </div>

          <div>
            <Label>PIN</Label>
            <Input
              type="text"
              maxLength={4}
              inputMode="numeric"
              {...register("profilePIN")}
              placeholder="1234"
            />
            {errors.profilePIN && (
              <p className="text-destructive text-sm">
                {String(errors.profilePIN.message)}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-destructive text-sm">{serverError}</p>
          )}

          <DialogFooter className="flex-row justify-end space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner />
                  Creando Pantalla
                </>
              ) : (
                "Crear Pantalla"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
