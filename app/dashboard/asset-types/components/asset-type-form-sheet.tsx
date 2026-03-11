"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const sectionTitleClass =
    "text-xs font-medium uppercase tracking-[0.14em] text-gray-500";
  const fieldLabelClass = "text-xs font-medium text-gray-500";
  const controlClass =
    "h-9 w-full min-w-0 rounded-xl border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-none transition-all focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:w-full">
        <DialogHeader className="space-y-0.5 border-b border-gray-100 bg-white px-4 py-3 text-left">
          <DialogTitle className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
            {isEditMode ? "Editar Tipo de Activo" : "Registrar Tipo de Activo"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug text-gray-500">
            {isEditMode
              ? "Actualiza los datos del tipo de activo."
              : "Completa los campos para registrar un nuevo tipo de activo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <form id="asset-type-form" onSubmit={onSubmit} className="space-y-3 p-4">
            <section className="space-y-2.5">
              <h3 className={sectionTitleClass}>Informacion General</h3>

              <div className="space-y-0.5">
                <Label htmlFor="type-name" className={fieldLabelClass}>
                  Nombre
                </Label>
                <Input
                  id="type-name"
                  value={form.name}
                  onChange={(event) => onFormFieldChange("name", event.target.value)}
                  placeholder="Ej. Equipos de computo"
                  className={controlClass}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="type-desc" className={fieldLabelClass}>
                  Descripcion
                </Label>
                <Input
                  id="type-desc"
                  value={form.description}
                  onChange={(event) =>
                    onFormFieldChange("description", event.target.value)
                  }
                  placeholder="Descripcion corta"
                  className={controlClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label htmlFor="type-purchase" className={fieldLabelClass}>
                    Cuenta compra
                  </Label>
                  <Input
                    id="type-purchase"
                    value={form.purchaseAccount}
                    onChange={(event) =>
                      onFormFieldChange("purchaseAccount", event.target.value)
                    }
                    placeholder="Ej. 1100-001"
                    className={controlClass}
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="type-depreciation" className={fieldLabelClass}>
                    Cuenta depreciacion
                  </Label>
                  <Input
                    id="type-depreciation"
                    value={form.depreciationAccount}
                    onChange={(event) =>
                      onFormFieldChange("depreciationAccount", event.target.value)
                    }
                    placeholder="Ej. 1200-001"
                    className={controlClass}
                    required
                  />
                </div>
              </div>
            </section>

            {isEditMode && (
              <section className="space-y-1.5 border-t border-gray-100 pt-3">
                <h3 className={sectionTitleClass}>Estado</h3>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-gray-600">
                      Estado en el sistema
                    </Label>
                    <p className="text-[11px] text-gray-500">
                      Activa o inactiva el tipo de activo.
                    </p>
                  </div>
                  <Switch
                    checked={form.status}
                    onCheckedChange={(checked) => onFormFieldChange("status", checked)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </section>
            )}
          </form>
        </div>

        <DialogFooter className="border-t border-gray-100 bg-white px-4 py-2.5">
          <div className="flex w-full items-center justify-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="h-9 min-w-32 rounded-xl border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 shadow-none hover:bg-gray-50 hover:text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="asset-type-form"
              disabled={isSaving}
              className="h-9 min-w-32 rounded-xl bg-emerald-600 px-5 text-xs font-medium text-white shadow-none transition-colors hover:bg-emerald-700"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Guardar" : "Crear"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
