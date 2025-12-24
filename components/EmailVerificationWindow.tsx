"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { MailOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EmailVerificationWindowProps {
  email?: string;
  onResend?: () => void | Promise<void>;
  onClose?: () => void;
  className?: string;
}

export default function EmailVerificationWindow({
  onClose,
}: EmailVerificationWindowProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <Card className="border-none shadow-none">
          <div className="w-fit self-center rounded-full bg-yellow-400 p-4">
            <MailOpen className="mx-auto h-12 w-12 text-neutral-900" />
          </div>
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Revisa tu correo
            </CardTitle>
            <CardDescription>
              Hemos enviado un correo a tu buzon de entrada. Por favor verifica
              tu dirección de correo electrónico para continuar usando tu
              cuenta.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <div className="flex w-full justify-center gap-2">
              <Button
                asChild
                variant="ghost"
                onClick={onClose}
                type="button"
                className="cursor-pointer"
              >
                <Link href="/signin" className="flex items-center gap-2">
                  <ArrowLeft />
                  Volver a inicio de sesion
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
