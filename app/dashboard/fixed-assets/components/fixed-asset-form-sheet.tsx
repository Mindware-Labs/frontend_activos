"use client";

import type { FormEvent } from "react";
import { Building2, Loader2, Shapes } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { EmployeeDatePicker } from "../../employees/components/employee-date-picker";
import type {
  AssetType,
  Department,
  FixedAsset,
  FixedAssetFormState,
  SetFixedAssetFormField,
} from "./types";

type FixedAssetFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAsset: FixedAsset | null;
  form: FixedAssetFormState;
  departments: Department[];
  assetTypes: AssetType[];
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetFixedAssetFormField;
  onCancel: () => void;
};

export function FixedAssetFormSheet({
  open,
  onOpenChange,
  editingAsset,
  form,
  departments,
  assetTypes,
  isSaving,
  onSubmit,
  onFormFieldChange,
  onCancel,
}: FixedAssetFormSheetProps) {
  const isEditMode = Boolean(editingAsset);
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
            {isEditMode ? "Editar Activo Fijo" : "Registrar Activo Fijo"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug text-gray-500">
            {isEditMode
              ? "Actualiza los datos del activo fijo."
              : "Completa los campos para registrar un nuevo activo fijo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          <form id="fixed-asset-form" onSubmit={onSubmit} className="space-y-3 p-4">
            <section className="space-y-2.5">
              <h3 className={sectionTitleClass}>Informacion General</h3>

              <div className="space-y-0.5">
                <Label htmlFor="asset-name" className={fieldLabelClass}>
                  Nombre
                </Label>
                <Input
                  id="asset-name"
                  value={form.name}
                  onChange={(event) => onFormFieldChange("name", event.target.value)}
                  placeholder="Ej. Impresora laser"
                  className={controlClass}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="asset-desc" className={fieldLabelClass}>
                  Descripcion
                </Label>
                <Input
                  id="asset-desc"
                  value={form.description}
                  onChange={(event) =>
                    onFormFieldChange("description", event.target.value)
                  }
                  placeholder="Descripcion corta"
                  className={controlClass}
                />
              </div>
            </section>

            <section className="space-y-2.5 border-t border-gray-100 pt-3">
              <h3 className={sectionTitleClass}>Datos de Registro</h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label htmlFor="asset-registration" className={fieldLabelClass}>
                    Fecha de registro
                  </Label>
                  <EmployeeDatePicker
                    id="asset-registration"
                    value={form.registrationDate}
                    disabled={isSaving}
                    onChange={(value) => onFormFieldChange("registrationDate", value)}
                    className={controlClass}
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="asset-purchase" className={fieldLabelClass}>
                    Valor compra
                  </Label>
                  <Input
                    id="asset-purchase"
                    type="number"
                    min="0"
                    step="100"
                    value={form.purchaseValue}
                    onChange={(event) =>
                      onFormFieldChange("purchaseValue", event.target.value)
                    }
                    className={controlClass}
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="asset-residual" className={fieldLabelClass}>
                    Valor residual
                  </Label>
                  <Input
                    id="asset-residual"
                    type="number"
                    min="0"
                    step="100"
                    value={form.residualValue}
                    onChange={(event) =>
                      onFormFieldChange("residualValue", event.target.value)
                    }
                    className={controlClass}
                    required
                  />
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="asset-life" className={fieldLabelClass}>
                    Vida util (meses)
                  </Label>
                  <Input
                    id="asset-life"
                    type="number"
                    min="0"
                    step="1"
                    value={form.usefulLifeMonths}
                    onChange={(event) =>
                      onFormFieldChange("usefulLifeMonths", event.target.value)
                    }
                    className={controlClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-2.5 border-t border-gray-100 pt-3">
              <h3 className={sectionTitleClass}>Clasificacion</h3>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <Label className={fieldLabelClass}>Departamento</Label>
                  <Select
                    value={form.departmentId}
                    onValueChange={(value) => onFormFieldChange("departmentId", value)}
                    required
                  >
                    <div className="group relative">
                      <Building2
                        className={`${iconClass} z-10 group-focus-within:text-emerald-500/80`}
                      />
                      <SelectTrigger className={`${controlClass} pl-10`}>
                        <SelectValue placeholder="Selecciona un departamento" />
                      </SelectTrigger>
                    </div>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={String(department.id)}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-0.5">
                  <Label className={fieldLabelClass}>Tipo de activo</Label>
                  <Select
                    value={form.assetTypeId}
                    onValueChange={(value) => onFormFieldChange("assetTypeId", value)}
                    required
                  >
                    <div className="group relative">
                      <Shapes
                        className={`${iconClass} z-10 group-focus-within:text-emerald-500/80`}
                      />
                      <SelectTrigger className={`${controlClass} pl-10`}>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </div>
                    <SelectContent>
                      {assetTypes
                        .filter((assetType) => assetType.status)
                        .map((assetType) => (
                          <SelectItem key={assetType.id} value={String(assetType.id)}>
                            {assetType.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                      Activa o inactiva el activo fijo.
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
              form="fixed-asset-form"
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
