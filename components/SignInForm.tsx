"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  email: z.email("Correo no valido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useMutation<unknown, Error, FormValues>({
    mutationFn: (data: FormValues) =>
      authClient.signIn.email({
        email: data.email,
        password: data.password,
      }),
    onSuccess: (ctx) => {
      if (ctx?.error?.status === 403) {
        router.push("/verify-email");
        return;
      }
      // Optionally invalidate or refetch session/user queries
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/dashboard");
    },
    onError: (err: any) => {
      if (err?.status === 403 || err?.code === "API_ERROR") {
        router.push("/verify-email");
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
    signInMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldLegend>Formulario de inicio de sesion</FieldLegend>
            <FieldDescription>
              Por favor ingrese su correo y contraseña para iniciar sesión.
            </FieldDescription>

            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="email">Correo</FieldLabel>
                    <Input
                      id="email"
                      {...field}
                      type="email"
                      placeholder="correo@ejemplo.com"
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
                      {...field}
                      type="password"
                      placeholder="Ingrese su contraseña"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="flex items-center justify-between">
                <div />
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Olvido su contraseña?
                </Link>
              </div>
              <Button type="submit" className="w-full font-bold">
                {signInMutation.isPending ? "Cargando..." : "Iniciar Sesion"}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          No tiene una cuenta?{" "}
          <Link href="/signup" className="text-primary underline">
            Cree una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
