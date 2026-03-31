"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldError,
} from "@/shared/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
// import { signUpAction } from "@/app/actions/auth";
import { authClient } from "@/shared/lib/auth-client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  signUpFormSchema,
  type SignUpFormValues,
} from "@/features/auth/schemas";
import { type SignUpError, type SignUpResult } from "../types/signUp";

export default function SignUpForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  const signUpMutation = useMutation<
    SignUpResult,
    SignUpError,
    SignUpFormValues
  >({
    mutationFn: (data: SignUpFormValues) =>
      authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    onMutate: () => {
      setGeneralError(null);
    },
    onSuccess: (data: SignUpResult) => {
      if (data?.error?.status === 422) {
        setGeneralError("El correo ingresado ya esta en uso");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/verify-email");
    },
    onError: (err: SignUpError) => {
      if (err?.status === 422 || err?.code === "API_ERROR") {
        setGeneralError("El correo ingresado ya esta en uso");
        return;
      }
      const message = err?.message || "Error durante el registro";
      if (message.toLowerCase().includes("email")) {
        form.setError("email", { type: "server", message });
      } else {
        form.setError("email", { type: "server", message });
      }
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6 max-sm:items-start max-sm:pt-[15vh]">
      <div className="h-fit w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Formulario de creacion de cuenta</FieldLegend>
            <FieldDescription>
              Complete el formulario para crear una nueva cuenta.
            </FieldDescription>

            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="name">Nombre Completo</FieldLabel>
                    <Input id="name" placeholder="Su nombre" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Correo</FieldLabel>
                    <Input
                      id="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingrese una contraseña"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="submit"
                className="w-full font-bold"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? (
                  <>
                    <Spinner />
                    Creando Cuenta
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>

        {generalError && (
          <Dialog defaultOpen={true}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{generalError}</DialogTitle>
                <DialogDescription>
                  Por favor intente nuevamente con otro correo o compruebe que
                  haya introducido correctamente su correo.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Ya tiene una cuenta?{" "}
          <Link href="/signin" className="text-primary underline">
            Inicie Sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
