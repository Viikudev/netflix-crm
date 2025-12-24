"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
// import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
// import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  // FieldDescription,
  FieldGroup,
  FieldSet,
  FieldError,
  FieldContent,
} from "@/components/ui/field";

const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export default function ResetPasswordForm({
  token: tokenProp,
}: {
  token?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = (tokenProp as string) ?? (searchParams.get("token") as string);

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      // toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      // toast.error(error.message);
    } else {
      // toast.success("Password reset successfully");
      router.push("/signin");
    }

    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white shadow-md">
        {/* <div className={cn("flex flex-col gap-6", className)} {...props}> */}
        <Card className="border-0 shadow-none">
          <CardHeader className="text-left">
            <CardTitle className="text-xl">Reiniciar Contraseña</CardTitle>
            <CardDescription>Ingrese su nueva contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Contraseña</FieldLabel>
                      <FieldContent>
                        <Input {...form.register("password")} type="password" />
                        <FieldError
                          errors={
                            form.formState.errors.password
                              ? [
                                  {
                                    message: String(
                                      form.formState.errors.password?.message ||
                                        "",
                                    ),
                                  },
                                ]
                              : undefined
                          }
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>Confirmar Contraseña</FieldLabel>
                      <FieldContent>
                        <Input
                          {...form.register("confirmPassword")}
                          type="password"
                        />
                        <FieldError
                          errors={
                            form.formState.errors.confirmPassword
                              ? [
                                  {
                                    message: String(
                                      form.formState.errors.confirmPassword
                                        ?.message || "",
                                    ),
                                  },
                                ]
                              : undefined
                          }
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Reiniciar Contraseña"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        {/* </div> */}
      </div>
    </div>
  );
}
