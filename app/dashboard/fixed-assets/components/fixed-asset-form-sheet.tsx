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
          <div className="relative mb-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
                !isEditMode &&
                  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400",
              )}
            >
              {isEditMode ? "Modo Edición" : "Nuevo Registro"}
            </Badge>
          </div>
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
                  placeholder="Ej. Computadora HP"
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
                  placeholder="Opcional"
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
                    step="0.01"
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
                    step="0.01"
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
                      {assetTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditMode && (
                <div className="space-y-1.5 flex items-center">
                  <Label className="text-xs font-semibold">Activo</Label>
                  <Switch
                    checked={form.status}
                    onCheckedChange={(val) => onFormFieldChange("status", val)}
                  />
                </div>
              )}
            </section>
          </form>
        </div>

        <SheetFooter className="flex justify-end gap-2 p-5">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" form="fixed-asset-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? "Guardar" : "Crear"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
