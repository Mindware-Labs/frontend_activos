"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
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
import type { Department } from "./types";

type DepartmentDetailDialogProps = {
  department: Department | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Función para obtener iniciales del nombre (ej. "Recursos Humanos" -> "RH")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Función para formatear fechas del sistema
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DepartmentDetailDialog({
  department,
  open,
  onOpenChange,
}: DepartmentDetailDialogProps) {
  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Información del Departamento
          </DialogTitle>
          <DialogDescription>
            Ficha detallada del área de la empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de Cabecera (Perfil) */}
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-blue-500/10 to-transparent p-4">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                {getInitials(department.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {department.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={department.status ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    department.status
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  {department.status ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3 w-3" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1.5 h-3 w-3" />
                      Inactivo
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="font-medium bg-background">
                  <Building2 className="mr-1.5 h-3 w-3 text-muted-foreground" />
                  ID: #{department.id}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles Generales */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Detalles del Área
            </h4>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
              <div className="rounded-md bg-blue-500/10 p-2 mt-0.5">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Descripción / Funciones
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {department.description || "No hay una descripción registrada para este departamento."}
                </p>
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
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> ID Interno:
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    #{department.id}
                  </span>
                </div>
                
                {department.createdAt && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Fecha de Registro:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(department.createdAt)}
                    </span>
                  </div>
                )}
                
                {department.updatedAt && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Última Actualización:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(department.updatedAt)}
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