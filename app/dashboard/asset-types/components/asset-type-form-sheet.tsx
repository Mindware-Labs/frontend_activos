"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  AssetType,
  AssetTypeFormState,
  SetAssetTypeFormField,
} from "./types";

type AssetTypeFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingType: AssetType | null;
  form: AssetTypeFormState;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetAssetTypeFormField;
  onCancel: () => void;
};

export function AssetTypeFormSheet({
  open,
  onOpenChange,
  editingType,
  form,
  isSaving,
  onSubmit,
  onFormFieldChange,
  onCancel,
}: AssetTypeFormSheetProps) {
  const isEditMode = Boolean(editingType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px] border-l-0 sm:border-l shadow-2xl">
        <SheetHeader className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-500/10 via-background to-background px-5 py-5 text-left z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <SheetTitle className="text-xl font-bold tracking-tight">
            {isEditMode ? "Editar Tipo de Activo" : "Registrar Tipo de Activo"}
          </SheetTitle>
          <SheetDescription className="text-xs mt-1">
            {isEditMode
              ? "Actualiza los datos del tipo de activo."
              : "Completa los campos para añadir un nuevo tipo."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/10">
          <form
            id="asset-type-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 p-5"
          >
            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Información General
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="type-name" className="text-xs font-semibold">
                  Nombre
                </Label>
                <Input
                  id="type-name"
                  value={form.name}
                  onChange={(e) => onFormFieldChange("name", e.target.value)}
                  placeholder="Electrónicos..."
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type-desc" className="text-xs font-semibold">
                  Descripción
                </Label>
                <Input
                  id="type-desc"
                  value={form.description}
                  onChange={(e) => onFormFieldChange("description", e.target.value)}
                  placeholder="10 caracteres"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type-purchase" className="text-xs font-semibold">
                  Cuenta compra
                </Label>
                <Input
                  id="type-purchase"
                  value={form.purchaseAccount}
                  onChange={(e) =>
                    onFormFieldChange("purchaseAccount", e.target.value)
                  }
                  placeholder="1000..."
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type-depreciation" className="text-xs font-semibold">
                  Cuenta depreciación
                </Label>
                <Input
                  id="type-depreciation"
                  value={form.depreciationAccount}
                  onChange={(e) =>
                    onFormFieldChange("depreciationAccount", e.target.value)
                  }
                  placeholder="2000..."
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="type-status"
                  checked={form.status}
                  onCheckedChange={(checked) =>
                    onFormFieldChange("status", Boolean(checked))
                  }
                />
                <Label htmlFor="type-status" className="select-none text-sm">
                  {form.status ? "Activo" : "Inactivo"}
                </Label>
              </div>
            </section>
          </form>
        </div>

        <SheetFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="asset-type-form"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditMode ? "Guardar" : "Crear"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}