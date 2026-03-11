"use client";

import type { FormEvent } from "react";
import { Building2, Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeDatePicker } from "../../employees/components/employee-date-picker";
import type {
  DepreciationCalculation,
  DepreciationFormState,
  FixedAsset,
  SetDepreciationFormField,
  DepreciationFormErrors,
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
  errors: DepreciationFormErrors;
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
  errors,
}: DepreciationFormSheetProps) {
  const isEditMode = Boolean(editingDepreciation);
  const sectionTitleClass =
    "text-xs font-medium uppercase tracking-[0.14em] text-gray-500";
  const fieldLabelClass = "text-xs font-medium text-gray-500";
  const controlClass =
    "h-9 w-full min-w-0 rounded-xl border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-none transition-all focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20";
  const iconClass =
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 sm:w-full">
        <DialogHeader className="space-y-0.5 border-b border-gray-100 bg-white px-4 py-3 text-left">
          <DialogTitle className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
            {isEditMode ? "Editar Depreciacion" : "Registrar Depreciacion"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug text-gray-500">
            {isEditMode
              ? "Actualiza los datos del calculo de depreciacion."
              : "Completa los campos para registrar un nuevo calculo de depreciacion."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <form
            id="depreciation-form"
            onSubmit={onSubmit}
            className="space-y-3 p-4"
          >
            <section className="space-y-2.5">
              <h3 className={sectionTitleClass}>Proceso</h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="space-y-0.5">
                  <Label htmlFor="process-year" className={fieldLabelClass}>
                    Ano
                  </Label>
                  <Input
                    id="process-year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.processYear}
                    onChange={(event) =>
                      onFormFieldChange("processYear", event.target.value)
                    }
                    placeholder="Ej. 2026"
                    className={controlClass}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="process-month" className={fieldLabelClass}>
                    Mes
                  </Label>
                  <Select
                    value={form.processMonth}
                    onValueChange={(value) =>
                      onFormFieldChange("processMonth", value)
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger id="process-month" className={controlClass}>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, index) => index + 1).map(
                        (month) => (
                          <SelectItem key={month} value={String(month)}>
                            {new Date(2026, month - 1).toLocaleDateString(
                              "es-DO",
                              {
                                month: "long",
                              },
                            )}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="process-date" className={fieldLabelClass}>
                    Fecha
                  </Label>
                  <EmployeeDatePicker
                    id="process-date"
                    value={form.processDate}
                    disabled={isSaving}
                    onChange={(value) =>
                      onFormFieldChange("processDate", value)
                    }
                    className={controlClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2.5 border-t border-gray-100 pt-3">
              <h3 className={sectionTitleClass}>Activo</h3>

              <div className="space-y-0.5">
                <Label className={fieldLabelClass}>Activo fijo</Label>
                <Select
                  value={form.fixedAssetId}
                  onValueChange={(value) =>
                    onFormFieldChange("fixedAssetId", value)
                  }
                  disabled={isSaving}
                >
                  <div className="group relative">
                    <Building2
                      className={`${iconClass} z-10 group-focus-within:text-emerald-500/80`}
                    />
                    <SelectTrigger className={`${controlClass} pl-10`}>
                      <SelectValue placeholder="Selecciona un activo" />
                    </SelectTrigger>
                  </div>
                  <SelectContent>
                    {fixedAssets.map((asset) => (
                      <SelectItem key={asset.id} value={String(asset.id)}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="space-y-2.5 border-t border-gray-100 pt-3">
              <h3 className={sectionTitleClass}>Valores</h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="amount-depreciation"
                    className={fieldLabelClass}
                  >
                    Monto depreciacion
                  </Label>
                  <Input
                    id="amount-depreciation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountDepreciation}
                    onChange={(event) =>
                      onFormFieldChange(
                        "amountDepreciation",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. 5000.00"
                    className={controlClass}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-0.5">
                  <Label
                    htmlFor="accumulated-depreciation"
                    className={fieldLabelClass}
                  >
                    Depreciacion acumulada
                  </Label>
                  <Input
                    id="accumulated-depreciation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.accumulatedDepreciation}
                    onChange={(event) =>
                      onFormFieldChange(
                        "accumulatedDepreciation",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. 25000.00"
                    className={controlClass}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2.5 border-t border-gray-100 pt-3">
              <h3 className={sectionTitleClass}>Cuentas</h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label htmlFor="purchase-account" className={fieldLabelClass}>
                    Cuenta compra
                  </Label>
                  <Input
                    id="purchase-account"
                    value={form.purchaseAccount}
                    onChange={(event) =>
                      onFormFieldChange("purchaseAccount", event.target.value)
                    }
                    placeholder="Ej. 1100-001"
                    className={controlClass}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-0.5">
                  <Label
                    htmlFor="depreciation-account"
                    className={fieldLabelClass}
                  >
                    Cuenta depreciacion
                  </Label>
                  <Input
                    id="depreciation-account"
                    value={form.depreciationAccount}
                    onChange={(event) =>
                      onFormFieldChange(
                        "depreciationAccount",
                        event.target.value,
                      )
                    }
                    placeholder="Ej. 1200-001"
                    className={controlClass}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </section>
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
              form="depreciation-form"
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
