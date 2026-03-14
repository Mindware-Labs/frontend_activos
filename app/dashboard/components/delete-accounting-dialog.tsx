"use client";

import { useState } from "react";
import { sileo } from "sileo";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { apiRequest, getErrorMessage } from "./types";

type Props = {
  auxiliaryId: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function DeleteAccountingDialog({
  auxiliaryId,
  onClose,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!auxiliaryId) return;
    setIsDeleting(true);
    try {
      await apiRequest(
        `/accounting-entries/${encodeURIComponent(auxiliaryId)}`,
        { method: "DELETE" },
      );
      sileo.success({
        title: "Eliminado",
        description: "El asiento contable fue eliminado exitosamente.",
      });
      onClose();
      onSuccess();
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!auxiliaryId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Asiento Contable</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este asiento contable? Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
