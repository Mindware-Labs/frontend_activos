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
  Department,
  DepartmentFormState,
  SetDepartmentFormField,
} from "./types";

type DepartmentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDepartment: Department | null;
  form: DepartmentFormState;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetDepartmentFormField;
  onCancel: () => void;
};

export function DepartmentFormSheet({
  open,
  onOpenChange,
  editingDepartment,
  form,
  isSaving,
  onSubmit,
  onFormFieldChange,
  onCancel,
}: DepartmentFormSheetProps) {
  const isEditMode = Boolean(editingDepartment);

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
            {isEditMode ? "Editar Departamento" : "Registrar Departamento"}
          </SheetTitle>
          <SheetDescription className="text-xs mt-1">
            {isEditMode
              ? "Actualiza la información del departamento."
              : "Completa los campos para añadir un nuevo departamento."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/10">
          <form
            id="department-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 p-5"
          >
            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Información básica
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="dept-name" className="text-xs font-semibold">
                  Nombre
                </Label>
                <Input
                  id="dept-name"
                  value={form.name}
                  onChange={(e) => onFormFieldChange("name", e.target.value)}
                  placeholder="Recursos Humanos..."
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dept-desc" className="text-xs font-semibold">
                  Descripción
                </Label>
                <Input
                  id="dept-desc"
                  value={form.description}
                  onChange={(e) => onFormFieldChange("description", e.target.value)}
                  placeholder="10 caracteres"
                  className="h-9 text-sm"
                />
              </div>

              {isEditMode && (
                <div className="space-y-1.5 flex items-center">
                  <Label className="text-xs font-semibold">
                    Activo
                  </Label>
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
          <Button type="submit" form="department-form" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditMode ? "Guardar" : "Crear"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
