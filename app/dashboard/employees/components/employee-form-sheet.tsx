"use client";

import type { FormEvent } from "react";
import {
  Building2,
  IdCard,
  Loader2,
  UserRound,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { EmployeeDatePicker } from "./employee-date-picker";
import type {
  Department,
  Employee,
  EmployeeFormState,
  PersonType,
  SetEmployeeFormField,
} from "./types";

type EmployeeFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: Employee | null;
  form: EmployeeFormState;
  departments: Department[];
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormFieldChange: SetEmployeeFormField;
  onCancel: () => void;
};

export function EmployeeFormSheet({
  open,
  onOpenChange,
  editingEmployee,
  form,
  departments,
  isSaving,
  onSubmit,
  onFormFieldChange,
  onCancel,
}: EmployeeFormSheetProps) {
  const isEditMode = Boolean(editingEmployee);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px] border-l-0 sm:border-l shadow-2xl">
        {/* Header Compacto y Premium */}
        <SheetHeader className="relative overflow-hidden border-b bg-gradient-to-br from-emerald-500/10 via-background to-background px-5 py-5 text-left z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="relative mb-2 flex items-center gap-2">
           
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight">
            {isEditMode ? "Editar Empleado" : "Registrar Empleado"}
          </SheetTitle>
          <SheetDescription className="text-xs mt-1">
            {isEditMode
              ? "Actualiza la información principal del empleado en el sistema."
              : "Completa los campos para añadir un nuevo empleado a la nómina."}
          </SheetDescription>
        </SheetHeader>

        {/* Formulario (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-muted/10">
          <form
            id="employee-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 p-5"
          >
            {/* Sección: Información General */}
            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Información General
              </h3>

              <div className="space-y-1.5">
                <Label
                  htmlFor="employee-name"
                  className="text-xs font-semibold"
                >
                  Nombre completo
                </Label>
                <div className="relative group">
                  <UserRound className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="employee-name"
                    value={form.name}
                    onChange={(event) =>
                      onFormFieldChange("name", event.target.value)
                    }
                    placeholder="Ej. Juan Pérez"
                    className="h-9 pl-9 text-sm transition-all bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="employee-cedula"
                  className="text-xs font-semibold"
                >
                  Cédula
                </Label>
                <div className="relative group">
                  <IdCard className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="employee-cedula"
                    value={form.cedula}
                    onChange={(event) =>
                      onFormFieldChange("cedula", event.target.value)
                    }
                    placeholder="000-0000000-0"
                    className="h-9 pl-9 font-mono text-sm transition-all bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Sección: Datos Laborales */}
            <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Datos Laborales
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Tipo</Label>
                  <Select
                    value={form.personType}
                    onValueChange={(value) =>
                      onFormFieldChange("personType", value as PersonType)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm bg-background focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fisica">Física</SelectItem>
                      <SelectItem value="Juridica">Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="employee-hire-date"
                    className="text-xs font-semibold"
                  >
                    Ingreso
                  </Label>
                  <EmployeeDatePicker
                    id="employee-hire-date"
                    value={form.hireDate}
                    disabled={isSaving}
                    onChange={(value) => onFormFieldChange("hireDate", value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Departamento</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(value) =>
                    onFormFieldChange("departmentId", value)
                  }
                  required
                >
                  <SelectTrigger className="h-9 text-sm bg-background focus:ring-1 focus:ring-primary/30">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Selecciona un departamento" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={String(department.id)}
                      >
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Sección Opcional: Estado */}
            {isEditMode && (
              <section className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20 p-4 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">
                      Estado en el sistema
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Activa o inactiva el acceso y visibilidad.
                    </p>
                  </div>
                  <Switch
                    checked={form.status}
                    onCheckedChange={(checked) =>
                      onFormFieldChange("status", checked)
                    }
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </section>
            )}
          </form>
        </div>

        {/* Footer Adherido */}
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
              form="employee-form"
              disabled={isSaving}
              className="h-10 flex-1 sm:flex-none px-6 shadow-md transition-all active:scale-[0.98] font-medium"
            >
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Guardar cambios" : "Crear"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
