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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EmployeeDatePicker } from "../../employees/components/employee-date-picker";
import type {
  Department,
  AssetType,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px] border-l-0 sm:border-l shadow-2xl">
        <SheetHeader className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-500/10 via-background to-background px-5 py-5 text-left z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
   
          <SheetTitle className="text-xl font-bold tracking-tight">
            {isEditMode ? "Editar Activo Fijo" : "Registrar Activo Fijo"}
          </SheetTitle>
          <SheetDescription className="text-xs mt-1">
            {isEditMode
              ? "Actualiza los datos del activo fijo."
              : "Completa los campos para añadir un nuevo activo fijo."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/10">
          <form
            id="fixed-asset-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 p-5"
          >
            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Información General
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="asset-name" className="text-xs font-semibold">
                  Nombre
                </Label>
                <Input
                  id="asset-name"
                  value={form.name}
                  onChange={(e) => onFormFieldChange("name", e.target.value)}
                  placeholder="Activo fijo..."
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asset-desc" className="text-xs font-semibold">
                  Descripción
                </Label>
                <Input
                  id="asset-desc"
                  value={form.description}
                  onChange={(e) => onFormFieldChange("description", e.target.value)}
                  placeholder="10 caracteres min"
                  className="h-9 text-sm"
                />
              </div>
            </section>

            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Datos de Registro
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="asset-registration" className="text-xs font-semibold">
                    Fecha de registro
                  </Label>
                  <EmployeeDatePicker
                    id="asset-registration"
                    value={form.registrationDate}
                    disabled={isSaving}
                    onChange={(value: string) => onFormFieldChange("registrationDate", value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="asset-purchase" className="text-xs font-semibold">
                    Valor compra
                  </Label>
                  <Input
                    id="asset-purchase"
                    type="number"
                    min="0"
                    step="100"
                    value={form.purchaseValue}
                    onChange={(e) => onFormFieldChange("purchaseValue", e.target.value)}
                    className="h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="asset-residual" className="text-xs font-semibold">
                    Valor residual
                  </Label>
                  <Input
                    id="asset-residual"
                    type="number"
                    min="0"
                    step="100"
                    value={form.residualValue}
                    onChange={(e) => onFormFieldChange("residualValue", e.target.value)}
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="asset-life" className="text-xs font-semibold">
                    Vida útil (meses)
                  </Label>
                  <Input
                    id="asset-life"
                    type="number"
                    min="0"
                    step="1"
                    value={form.usefulLifeMonths}
                    onChange={(e) => onFormFieldChange("usefulLifeMonths", e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Clasificación
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Departamento</Label>
                  <Select
                    value={form.departmentId}
                    onValueChange={(value) => onFormFieldChange("departmentId", value)}
                    required
                  >
                    <SelectTrigger className="h-9 text-sm bg-background focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tipo de activo</Label>
                  <Select
                    value={form.assetTypeId}
                    onValueChange={(value) => onFormFieldChange("assetTypeId", value)}
                    required
                  >
                    <SelectTrigger className="h-9 text-sm bg-background focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.filter((type) => type.status === true).map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Sección Opcional: Estado - Solo visible en edición */}
            {isEditMode && (
              <section className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20 p-4 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">
                      Estado en el sistema
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Activa o inactiva el acceso y visibilidad del activo fijo.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      form.status ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}>
                      {form.status ? "Activo" : "Inactivo"}
                    </span>
                    <Switch
                      checked={form.status}
                      onCheckedChange={(checked) =>
                        onFormFieldChange("status", checked)
                      }
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </section>
            )}
          </form>
        </div>

        <SheetFooter className="border-t bg-background/80 px-5 py-4 backdrop-blur-md z-10">
          <div className="flex w-full items-center gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="h-10 flex-1 sm:flex-none px-4 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="fixed-asset-form"
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