"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { AssetPreview, RunResult } from "./types";
import { formatCurrency, MONTH_NAMES } from "./types";

type ConfirmDepreciationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssets: AssetPreview[];
  year: number;
  month: number;
  isExecuting: boolean;
  result: RunResult | null;
  error: string | null;
  onConfirm: () => void;
};

export function ConfirmDepreciationDialog({
  open,
  onOpenChange,
  selectedAssets,
  year,
  month,
  isExecuting,
  result,
  error,
  onConfirm,
}: ConfirmDepreciationDialogProps) {
  const totalAmount = selectedAssets.reduce(
    (sum, p) => sum + p.monthlyDepreciation,
    0,
  );
  const monthName = MONTH_NAMES[month - 1] ?? "";

  function handleOpenChange(val: boolean) {
    if (isExecuting) return;
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Confirmar Depreciación
          </DialogTitle>
          <DialogDescription className="text-xs">
            {monthName} {year} — Revise los activos antes de ejecutar
          </DialogDescription>
        </DialogHeader>

        {!result && !error && (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Activos a depreciar
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {selectedAssets.length}
                </p>
              </div>
              <div className="rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 text-center dark:border-blue-800/30 dark:bg-blue-950/10">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Monto total
                </p>
                <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            {/* Asset list */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Activos seleccionados:
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-muted/10">
                {selectedAssets.map((preview) => (
                  <div
                    key={preview.asset.id}
                    className="flex items-center justify-between border-b border-border/30 px-3 py-2 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                        {preview.asset.id}
                      </div>
                      <span className="text-xs font-medium text-foreground truncate">
                        {preview.asset.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0 ml-2">
                      {formatCurrency(preview.monthlyDepreciation)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-600/90 dark:text-amber-400/80">
                  Esta acción creará registros de depreciación y actualizará la
                  depreciación acumulada de cada activo. Esta operación no se
                  puede deshacer automáticamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Proceso completado exitosamente
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  {monthName} {year}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Evaluados</p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {result.totalAssetsEvaluated}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/30 p-3 text-center dark:border-emerald-800/30 dark:bg-emerald-950/10">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Creados
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {result.totalCalculationsCreated}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200/50 bg-amber-50/30 p-3 text-center dark:border-amber-800/30 dark:bg-amber-950/10">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Omitidos
                </p>
                <p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">
                  {result.totalAssetsSkipped}
                </p>
              </div>
              <div className="rounded-lg border border-blue-200/50 bg-blue-50/30 p-3 text-center dark:border-blue-800/30 dark:bg-blue-950/10">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Total Depreciado
                </p>
                <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(result.totalAmountDepreciated)}
                </p>
              </div>
            </div>

            {result.skippedAssets.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Omitidos ({result.skippedAssets.length})
                  </p>
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-border/50 bg-muted/20">
                    {result.skippedAssets.map((sa, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-border/30 px-3 py-2 last:border-b-0"
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          ID {sa.fixedAssetId}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {sa.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200/60 bg-red-50/50 p-3 dark:border-red-800/40 dark:bg-red-950/20">
            <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isExecuting}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isExecuting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-xs dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                {isExecuting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isExecuting ? "Procesando..." : "Confirmar y Ejecutar"}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)} className="text-xs">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
