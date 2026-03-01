"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Employee } from "./types";

type EmployeeDetailDialogProps = {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateTenure(hireDate: string) {
  const hire = new Date(hireDate);
  const now = new Date();
  const years = now.getFullYear() - hire.getFullYear();
  const months = now.getMonth() - hire.getMonth();

  if (years === 0) {
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  if (months < 0) {
    return `${years - 1} ${years - 1 === 1 ? "año" : "años"}, ${12 + months} meses`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  return `${years} ${years === 1 ? "año" : "años"}, ${months} ${months === 1 ? "mes" : "meses"}`;
}

export function EmployeeDetailDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeDetailDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Información del Empleado
          </DialogTitle>
          <DialogDescription>
            Detalles completos del registro del empleado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de Perfil */}
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-4">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {employee.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {employee.personType === "Fisica"
                    ? "Persona Física"
                    : "Persona Jurídica"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={employee.status ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    employee.status
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  {employee.status ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Inactivo
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  <Building2 className="mr-1.5 h-3 w-3" />
                  {employee.department?.name ??
                    `Departamento #${employee.departmentId}`}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Personal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información Personal
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-primary/10 p-2">
                  <Hash className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Cédula / RNC
                  </p>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {employee.cedula}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tipo de Persona
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {employee.personType === "Fisica" ? "Física" : "Jurídica"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Laboral */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información Laboral
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Fecha de Ingreso
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(employee.hireDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Antigüedad
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {calculateTenure(employee.hireDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50 sm:col-span-2">
                <div className="rounded-md bg-blue-500/10 p-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Departamento Asignado
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {employee.department?.name ??
                      `Departamento #${employee.departmentId}`}
                  </p>
                  {employee.department?.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {employee.department.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del Sistema */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información del Sistema
            </h4>
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ID del Empleado:
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    #{employee.id}
                  </span>
                </div>
                {employee.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Fecha de Registro:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(employee.createdAt)}
                    </span>
                  </div>
                )}
                {employee.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Última Actualización:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(employee.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
