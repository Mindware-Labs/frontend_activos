"use client";

import {
  Calendar,
  DollarSign,
  Hash,
  TrendingDown,
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
import type { DepreciationCalculation } from "./types";

type DepreciationDetailDialogProps = {
  depreciation: DepreciationCalculation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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
  });
}

export function DepreciationDetailDialog({
  depreciation,
  open,
  onOpenChange,
}: DepreciationDetailDialogProps) {
  if (!depreciation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Cálculo de Depreciación #{depreciation.id}
          </DialogTitle>
          <DialogDescription>
            Detalles del registro de depreciación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sección de Encabezado */}
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-lg font-bold text-primary">
                {String(depreciation.processMonth).padStart(2, "0")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {depreciation.processYear} / Mes {depreciation.processMonth}
                </h3>
                {depreciation.fixedAsset && (
                  <p className="text-sm text-muted-foreground">
                    Activo: {depreciation.fixedAsset.name}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="w-fit">
                ID: {depreciation.id}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* información General */}
          <section className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Información General
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Fecha del Proceso
                </p>
                <p className="text-sm font-semibold">
                  {formatDate(depreciation.processDate)}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  Activo ID
                </p>
                <p className="text-sm font-semibold">
                  {depreciation.fixedAssetId}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Montos */}
          <section className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Montos de Depreciación
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/40 bg-blue-50/50 dark:bg-blue-950/20 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400">
                  <DollarSign className="h-3.5 w-3.5" />
                  Monto Período
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(depreciation.amountDepreciation)}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/40 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Acumulado
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(depreciation.accumulatedDepreciation)}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Cuentas Contables */}
          <section className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Cuentas Contables
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Cuenta de Compra
                </p>
                <p className="text-sm font-semibold font-mono">
                  {depreciation.purchaseAccount}
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
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
              <section className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Creado:{" "}
                  {new Date(depreciation.createdAt).toLocaleDateString(
                    "es-DO",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
