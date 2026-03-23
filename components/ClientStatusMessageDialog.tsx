"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ClientStatusMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  phoneNumber: string;
};

export default function ClientStatusMessageDialog({
  open,
  onOpenChange,
  clientName,
  phoneNumber,
}: ClientStatusMessageDialogProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const defaultMessage = useMemo(
    () =>
      `Hola ${clientName}, esperamos que te encuentres bien. Te escribimos por el estado de tu suscripcion.`,
    [clientName],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setMessage("");
      setError(null);
      return;
    }

    setMessage(defaultMessage);
    setError(null);
  };

  const handleSendMessage = () => {
    setError(null);

    const cleanPhone = phoneNumber.trim();
    const cleanMessage = message.trim();

    if (!cleanPhone) {
      setError("El cliente no tiene número de teléfono registrado");
      return;
    }

    if (!cleanMessage) {
      setError("El mensaje es requerido");
      return;
    }

    const chatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(cleanMessage)}`;
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar mensaje</DialogTitle>
          <DialogDescription>
            Escribe el mensaje para abrir el chat del cliente en WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Número de teléfono</Label>
            <Input value={phoneNumber} disabled />
          </div>

          <div>
            <Label>Mensaje</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe el mensaje a enviar"
              rows={6}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSendMessage}>
              Enviar Mensaje
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
