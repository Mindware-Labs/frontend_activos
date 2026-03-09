"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type {
  FixedAsset,
  DepreciationCalculation,
  DepreciationFormState,
  SetDepreciationFormField,
} from "./types";

type DepreciationFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDepreciation: DepreciationCalculation | null;
  form: DepreciationFormState;
  fixedAssets: FixedAsset[];
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetDepreciationFormField;
  onCancel: () => void;
};

export function DepreciationFormSheet({
  open,
  onOpenChange,
  editingDepreciation,
  form,
  fixedAssets,
  isSaving,
  onSubmit,
  onFormFieldChange,
  onCancel,
}: DepreciationFormSheetProps) {
  const isEditMode = Boolean(editingDepreciation);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-110 border-l-0 sm:border-l shadow-2xl overflow-y-auto">
        <SheetHeader className="relative overflow-hidden border-b bg-linear-to-br from-emerald-500/10 via-background to-background px-5 py-5 text-left z-10">
          <div className="space-y-1.5">
            <SheetTitle className="text-lg sm:text-xl">
              {isEditMode
                ? "Editar Depreciación"
                : "Crear Nueva Depreciación"}
            </SheetTitle>
            <SheetDescription className="text-xs sm:text-sm">
              {isEditMode
                ? "Actualiza los detalles del cálculo de depreciación."
                : "Ingresa los datos del nuevo cálculo de depreciación."}
            </SheetDescription>
            {isEditMode && editingDepreciation && (
              <Badge variant="secondary" className="w-fit text-xs mt-2">
                ID: {editingDepreciation.id}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="depreciation-form"
            onSubmit={onSubmit}
            className="space-y-4 border-b border-border/20 p-5"
          >
            {/* Año del Proceso */}
            <div className="space-y-2">
              <Label htmlFor="processYear" className="text-xs font-semibold">
                Año del Proceso
              </Label>
              <Input
                id="processYear"
                type="number"
                min="1900"
                max="2100"
                placeholder="Ej: 2024"
                value={form.processYear}
                onChange={(e) => onFormFieldChange("processYear", e.target.value)}
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>

            {/* Mes del Proceso */}
            <div className="space-y-2">
              <Label htmlFor="processMonth" className="text-xs font-semibold">
                Mes del Proceso
              </Label>
              <Select
                value={form.processMonth}
                onValueChange={(value) =>
                  onFormFieldChange("processMonth", value)
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar mes..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      {new Date(2024, month - 1).toLocaleDateString("es-DO", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha del Proceso */}
            <div className="space-y-2">
              <Label htmlFor="processDate" className="text-xs font-semibold">
                Fecha del Proceso
              </Label>
              <Input
                id="processDate"
                type="date"
                value={form.processDate}
                onChange={(e) => onFormFieldChange("processDate", e.target.value)}
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>

            {/* Activo Fijo */}
            <div className="space-y-2">
              <Label htmlFor="fixedAssetId" className="text-xs font-semibold">
                Activo Fijo
              </Label>
              <Select
                value={form.fixedAssetId}
                onValueChange={(value) =>
                  onFormFieldChange("fixedAssetId", value)
                }
                disabled={isSaving}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Seleccionar activo..." />
                </SelectTrigger>
                <SelectContent>
                  {fixedAssets.map((asset) => (
                    <SelectItem key={asset.id} value={String(asset.id)}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto Depreciación */}
            <div className="space-y-2">
              <Label
                htmlFor="amountDepreciation"
                className="text-xs font-semibold"
              >
                Monto Depreciación
              </Label>
              <Input
                id="amountDepreciation"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 5000.00"
                value={form.amountDepreciation}
                onChange={(e) =>
                  onFormFieldChange("amountDepreciation", e.target.value)
                }
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>

            {/* Depreciación Acumulada */}
            <div className="space-y-2">
              <Label
                htmlFor="accumulatedDepreciation"
                className="text-xs font-semibold"
              >
                Depreciación Acumulada
              </Label>
              <Input
                id="accumulatedDepreciation"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 25000.00"
                value={form.accumulatedDepreciation}
                onChange={(e) =>
                  onFormFieldChange("accumulatedDepreciation", e.target.value)
                }
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>

            {/* Cuenta de Compra */}
            <div className="space-y-2">
              <Label htmlFor="purchaseAccount" className="text-xs font-semibold">
                Cuenta de Compra
              </Label>
              <Input
                id="purchaseAccount"
                type="text"
                placeholder="Ej: 1100-001"
                value={form.purchaseAccount}
                onChange={(e) =>
                  onFormFieldChange("purchaseAccount", e.target.value)
                }
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>

            {/* Cuenta de Depreciación */}
            <div className="space-y-2">
              <Label
                htmlFor="depreciationAccount"
                className="text-xs font-semibold"
              >
                Cuenta de Depreciación
              </Label>
              <Input
                id="depreciationAccount"
                type="text"
                placeholder="Ej: 1200-001"
                value={form.depreciationAccount}
                onChange={(e) =>
                  onFormFieldChange("depreciationAccount", e.target.value)
                }
                disabled={isSaving}
                className="h-9 text-sm"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t bg-background/80 px-5 py-4 backdrop-blur-md z-10">
          <div className="flex w-full items-center gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="h-10 flex-1 sm:flex-none px-4 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="depreciation-form"
              disabled={isSaving}
              className="h-10 flex-1 sm:flex-none px-6 shadow-md transition-all active:scale-[0.98] font-medium"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Guardar" : "Crear"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
