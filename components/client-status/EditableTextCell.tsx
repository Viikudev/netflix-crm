"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { updateClientStatus } from "@/services/clientStatus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EditableField = "clientName" | "phoneNumber";

type EditableTextCellProps = {
  clientStatusId: string;
  field: EditableField;
  value: string;
};

export default function EditableTextCell({
  clientStatusId,
  field,
  value,
}: EditableTextCellProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const editContainerRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: async (nextValue: string) => {
      return updateClientStatus(clientStatusId, {
        [field]: nextValue,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientStatuses"] });
      setIsEditing(false);
      setError(null);
    },
    onError: (err: unknown) => {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        "No se pudo actualizar";
      setError(message);
    },
  });

  const startEdit = () => {
    if (mutation.isPending) return;
    setDraft(value);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (mutation.isPending) return;
    setDraft(value);
    setError(null);
    setIsEditing(false);
  };

  const confirmEdit = () => {
    if (mutation.isPending) return;

    const nextValue = draft.trim();
    if (!nextValue) {
      setError("Este campo es requerido");
      return;
    }

    if (field === "clientName" && nextValue.length > 40) {
      setError("El nombre debe tener como máximo 40 caracteres");
      return;
    }

    if (nextValue === value.trim()) {
      setIsEditing(false);
      setError(null);
      return;
    }

    mutation.mutate(nextValue);
  };

  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        className="w-full cursor-pointer justify-start px-0 text-left hover:bg-transparent"
        onClick={startEdit}
      >
        {value}
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <div
        ref={editContainerRef}
        className="relative items-center gap-1"
        onBlur={(e) => {
          const nextFocused = e.relatedTarget as Node | null;
          if (
            editContainerRef.current &&
            nextFocused &&
            editContainerRef.current.contains(nextFocused)
          ) {
            return;
          }

          cancelEdit();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmEdit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          }}
          autoFocus
          disabled={mutation.isPending}
          className="h-7"
        />

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={confirmEdit}
          disabled={mutation.isPending}
          aria-label="Confirmar cambios"
          className="absolute top-1/2 right-8 bottom-1/2 -translate-y-1/2 transform hover:bg-transparent hover:text-green-500"
        >
          <Check className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={cancelEdit}
          disabled={mutation.isPending}
          aria-label="Omitir cambios"
          className="absolute top-1/2 right-1 bottom-1/2 -translate-y-1/2 transform hover:bg-transparent hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
