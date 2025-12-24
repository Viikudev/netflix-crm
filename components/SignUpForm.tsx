"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldError,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { signUpAction } from "@/app/actions/auth";
import { authClient } from "@/lib/auth-client";
import z from "zod";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.email("Correo no valido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

type SignUpResult = {
  error?: { status?: number } | null;
  [key: string]: unknown;
} | null;
type SignUpError = { status?: number; code?: string; message?: string } & Error;

export default function SignUpForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const [generalError, setGeneralError] = useState<string | null>(null);

  const signUpMutation = useMutation<SignUpResult, SignUpError, FormValues>({
    mutationFn: (data: FormValues) =>
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
      // Optionally invalidate or refetch session/user queries
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/verify-email");
    },
    onError: (err: SignUpError) => {
      if (err?.status === 422 || err?.code === "API_ERROR") {
        setGeneralError("El correo ingresado ya esta en uso");
        return;
      }
      const message = err?.message || "Error durante el registro";
      // Try to map server response to fields
      if (message.toLowerCase().includes("email")) {
        form.setError("email", { type: "server", message });
      } else {
        // fallback: set form-level error on email field
        form.setError("email", { type: "server", message });
      }
    },
  });

  const onSubmit = async (data: FormValues) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
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

              <Button type="submit" className="w-full font-bold">
                {signUpMutation.isPending ? "Creando..." : "Crear Cuenta"}
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
