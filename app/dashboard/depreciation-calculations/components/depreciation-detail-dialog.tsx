"use client";

import { Calendar, DollarSign, Hash, TrendingDown } from "lucide-react";
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
import type { DepreciationCalculation } from "./types";

type DepreciationDetailDialogProps = {
  depreciation: DepreciationCalculation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  });
}

export function DepreciationDetailDialog({
  depreciation,
  open,
  onOpenChange,
}: DepreciationDetailDialogProps) {
  if (!depreciation) return null;

  const monthName = MONTH_NAMES[depreciation.processMonth - 1] ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Detalle de Depreciación #{depreciation.id}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Registro del cálculo de depreciación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header con período */}
          <div className="flex items-start gap-4 rounded-xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-transparent p-4 dark:border-emerald-800/30 dark:from-emerald-950/20">
            <Avatar className="h-14 w-14 rounded-xl border-2 border-emerald-200/60 shadow-sm dark:border-emerald-800/40">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-base font-bold text-emerald-700 dark:from-emerald-900/60 dark:to-emerald-900/30 dark:text-emerald-300">
                {String(depreciation.processMonth).padStart(2, "0")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {monthName} {depreciation.processYear}
                </h3>
                {depreciation.fixedAsset && (
                  <p className="text-sm text-muted-foreground">
                    Activo: {depreciation.fixedAsset.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  ID: {depreciation.id}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Activo #{depreciation.fixedAssetId}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Info general */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Información del Proceso
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Fecha del Proceso
                </p>
                <p className="text-sm font-semibold">
                  {formatDate(depreciation.processDate)}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  ID del Activo Fijo
                </p>
                <p className="text-sm font-semibold">
                  {depreciation.fixedAssetId}
                  {depreciation.fixedAsset && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      — {depreciation.fixedAsset.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Montos */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Montos de Depreciación
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-blue-200/50 bg-blue-50/40 p-3 dark:border-blue-800/30 dark:bg-blue-950/20">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 dark:text-blue-400">
                  <DollarSign className="h-3 w-3" />
                  Monto del Período
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(depreciation.amountDepreciation)}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-amber-200/50 bg-amber-50/40 p-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <TrendingDown className="h-3 w-3" />
                  Depreciación Acumulada
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(depreciation.accumulatedDepreciation)}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Cuentas contables */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cuentas Contables
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Cuenta de Compra
                </p>
                <p className="text-sm font-semibold font-mono">
                  {depreciation.purchaseAccount}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Cuenta de Depreciación
                </p>
                <p className="text-sm font-semibold font-mono">
                  {depreciation.depreciationAccount}
                </p>
              </div>
            </div>
          </section>

          {depreciation.createdAt && (
            <>
              <Separator />
              <p className="text-[11px] text-muted-foreground">
                Creado:{" "}
                {new Date(depreciation.createdAt).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
