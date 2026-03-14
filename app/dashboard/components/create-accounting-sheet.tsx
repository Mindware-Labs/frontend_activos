"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sileo } from "sileo";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  apiRequest,
  formatCurrency,
  getErrorMessage,
  MONTH_NAMES,
  type AccountingEntryGroup,
  type DepreciationSummaryItem,
} from "./types";

const controlClass =
  "h-9 w-full min-w-0 rounded-xl border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-none transition-all focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingGroups: AccountingEntryGroup[];
};

export function CreateAccountingSheet({
  open,
  onOpenChange,
  onSuccess,
  existingGroups,
}: Props) {
  const now = new Date();
  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i);

  const [formYear, setFormYear] = useState(now.getFullYear());
  const [formMonth, setFormMonth] = useState(now.getMonth() + 1);

  const [isSaving, setIsSaving] = useState(false);
  const [previewAmount, setPreviewAmount] = useState<number | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [showSummary, setShowSummary] = useState(false);
  const [assetSummary, setAssetSummary] = useState<DepreciationSummaryItem[]>(
    [],
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const hasDepreciation = previewAmount !== null && previewAmount > 0;
  const periodLabel = `${formYear}-${String(formMonth).padStart(2, "0")}`;
  const alreadyExists = existingGroups.some((g) =>
    g.description.includes(periodLabel),
  );

  const loadPreview = useCallback(async (year: number, month: number) => {
    setIsLoadingPreview(true);
    setPreviewAmount(null);
    setShowSummary(false);
    setAssetSummary([]);
    try {
      const res = await apiRequest<{ total: number }>(
        `/accounting-entries/depreciation-total/${year}/${month}`,
      );
      setPreviewAmount(res.total);
    } catch {
      setPreviewAmount(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  const loadAssetSummary = useCallback(
    async (year: number, month: number) => {
      if (showSummary) {
        setShowSummary(false);
        return;
      }
      setIsLoadingSummary(true);
      try {
        const data = await apiRequest<DepreciationSummaryItem[]>(
          `/depreciation-calculations/period/${year}/${month}`,
        );
        setAssetSummary(data ?? []);
        setShowSummary(true);
      } catch {
        sileo.error({
          title: "Error",
          description: "No se pudo cargar el resumen de activos.",
        });
      } finally {
        setIsLoadingSummary(false);
      }
    },
    [showSummary],
  );

  // Reset cuando se abre
  useEffect(() => {
    if (open) {
      setFormYear(now.getFullYear());
      setFormMonth(now.getMonth() + 1);
      setPreviewAmount(null);
      setShowSummary(false);
      setAssetSummary([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      void loadPreview(formYear, formMonth);
    }
  }, [formYear, formMonth, loadPreview, open]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await apiRequest("/accounting-entries", {
        method: "POST",
        body: JSON.stringify({ year: formYear, month: formMonth }),
      });
      sileo.success({
        title: "Asiento creado",
        description: `Asiento contable para ${MONTH_NAMES[formMonth - 1]} ${formYear} creado exitosamente.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-0.5 border-b border-gray-100 px-4 py-3 text-left">
          <SheetTitle className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
            Crear Asiento Contable
          </SheetTitle>
          <SheetDescription className="text-xs leading-snug text-gray-500">
            Selecciona el periodo para generar el asiento contable.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form
            id="accounting-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="space-y-4 p-4"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-gray-500">Año</Label>
                <Select
                  value={String(formYear)}
                  onValueChange={(v) => setFormYear(Number(v))}
                >
                  <SelectTrigger className={controlClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <Label className="text-xs font-medium text-gray-500">Mes</Label>
                <Select
                  value={String(formMonth)}
                  onValueChange={(v) => setFormMonth(Number(v))}
                >
                  <SelectTrigger className={controlClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advertencia periodo ya existe */}
            {alreadyExists && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <span className="mt-0.5 text-amber-500">⚠️</span>
                <p className="text-xs text-amber-700">
                  Ya existe un asiento contable para{" "}
                  <strong>
                    {MONTH_NAMES[formMonth - 1]} {formYear}
                  </strong>
                  . No se puede crear otro para el mismo periodo.
                </p>
              </div>
            )}

            {/* Preview del monto */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Calculando depreciación del periodo...
                </div>
              ) : hasDepreciation ? (
                <button
                  type="button"
                  onClick={() => void loadAssetSummary(formYear, formMonth)}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <p className="text-sm font-medium text-emerald-600">
                    Depreciación calculada para {MONTH_NAMES[formMonth - 1]}{" "}
                    {formYear}:{" "}
                    <span className="font-bold">
                      {formatCurrency(previewAmount)}
                    </span>
                  </p>
                  <span className="shrink-0 text-emerald-600">
                    {isLoadingSummary ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : showSummary ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  No hay depreciaciones registradas para{" "}
                  {MONTH_NAMES[formMonth - 1]} {formYear}.
                </p>
              )}
            </div>

            {/* Resumen de activos del periodo */}
            <AnimatePresence>
              {showSummary && assetSummary.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
                      Activos depreciados en el periodo
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[11px] text-gray-400 uppercase tracking-wider">
                            Activo
                          </TableHead>
                          <TableHead className="text-[11px] text-gray-400 uppercase tracking-wider text-right">
                            Monto
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assetSummary.map((item) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell className="text-xs text-gray-700">
                              {item.fixedAsset?.name ??
                                `Activo #${item.fixedAsset?.id ?? item.id}`}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-right text-gray-900">
                              {formatCurrency(item.amountDepreciation)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center justify-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-9 min-w-32 rounded-xl px-5 text-xs font-medium shadow-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="accounting-form"
              disabled={isSaving || !hasDepreciation || alreadyExists}
              className="h-9 min-w-32 rounded-xl bg-emerald-600 px-5 text-xs font-medium text-white shadow-none transition-colors hover:bg-emerald-700"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
