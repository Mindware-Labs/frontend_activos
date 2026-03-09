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
                      Activa o inactiva el acceso y visibilidad del departamento.
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
              form="department-form"
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