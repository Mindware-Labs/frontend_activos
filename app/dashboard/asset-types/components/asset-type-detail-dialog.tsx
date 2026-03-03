"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AssetType } from "./types";

type AssetTypeDetailDialogProps = {
  assetType: AssetType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AssetTypeDetailDialog({ assetType, open, onOpenChange }: AssetTypeDetailDialogProps) {
  if (!assetType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalle Tipo de Activo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium">Nombre</Label>
            <p className="mt-1 text-sm text-foreground">{assetType.name}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Descripción</Label>
            <p className="mt-1 text-sm text-foreground">
              {assetType.description || "-"}
            </p>
          </div>
          <div>
            <Label className="text-xs font-medium">Cuenta compra</Label>
            <p className="mt-1 text-sm text-foreground">
              {assetType.purchaseAccount}
            </p>
          </div>
          <div>
            <Label className="text-xs font-medium">Cuenta depreciación</Label>
            <p className="mt-1 text-sm text-foreground">
              {assetType.depreciationAccount}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                assetType.status ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <p className="text-sm font-medium text-muted-foreground">
              {assetType.status ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}