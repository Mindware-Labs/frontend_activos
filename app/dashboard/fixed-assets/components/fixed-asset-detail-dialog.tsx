"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Hash,
  Tag,
  Timer,
  TrendingDown,
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
import type { FixedAsset } from "./types";

type FixedAssetDetailDialogProps = {
  asset: FixedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Obtener iniciales (ej. "Laptop Dell" -> "LD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Formateo de fecha simple (Día, Mes, Año)
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Formateo de fecha y hora para el sistema
function formatDateTime(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formateo de moneda profesional
function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
  });
}

// Formateo de vida útil con manejo de null
function formatUsefulLife(months: number | null | undefined): string {
  if (months === null || months === undefined) return "No especificada";
  
  const years = months / 12;
  const yearsFormatted = years.toFixed(1);
  
  return `${months} meses ${years >= 1 ? `(${yearsFormatted} años)` : ''}`;
}

export function FixedAssetDetailDialog({
  asset,
  open,
  onOpenChange,
}: FixedAssetDetailDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Ficha del Activo Fijo
          </DialogTitle>
          <DialogDescription>
            Detalles técnicos, financieros y de asignación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabecera / Perfil */}
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                {getInitials(asset.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {asset.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {asset.description || "Sin descripción proporcionada."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant={asset.status ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    asset.status
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  {asset.status ? (
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
                  <Hash className="mr-1.5 h-3 w-3 text-muted-foreground" />
                  ID: #{asset.id}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles Generales */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Detalles Generales
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Fecha de Registro
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(asset.registrationDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-blue-500/10 p-2">
                  <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tipo de Activo
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                    {asset.assetType?.name ?? `Tipo #${asset.assetTypeId}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50 sm:col-span-2">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Departamento Asignado
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {asset.department?.name ?? `Dpto #${asset.departmentId}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Financiera */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información Financiera
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Valor de Compra
                  </p>
                  <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(asset.purchaseValue)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-amber-500/10 p-2">
                  <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Valor Residual
                  </p>
                  <p className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatCurrency(asset.residualValue)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-indigo-500/10 p-2">
                  <Timer className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Vida Útil
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {asset.usefulLifeMonths ? (
                      <>
                        {asset.usefulLifeMonths} meses{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({(asset.usefulLifeMonths / 12).toFixed(1)} años)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-normal text-muted-foreground">
                        No especificada
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-rose-500/10 p-2">
                  <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Depreciación Acumulada
                  </p>
                  <p className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatCurrency(asset.accumulatedDepreciation ?? 0)}
                  </p>
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
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" /> ID Interno del Activo:
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    #{asset.id}
                  </span>
                </div>
                
                {asset.createdAt && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Registrado en sistema:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(asset.createdAt)}
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