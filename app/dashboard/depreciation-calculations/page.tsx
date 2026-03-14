"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Calculator,
  Check,
  CheckCheck,
  CheckCircle2,
  Loader2,
  XCircle,
  FileBox,
} from "lucide-react";
import { sileo } from "sileo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssetPreviewTable } from "./components/asset-preview-table";
import { DepreciationDetailDialog } from "./components/depreciation-detail-dialog";
import type {
  AssetPreview,
  DepreciationCalculation,
  FixedAsset,
  RunResult,
} from "./components/types";
import {
  calculateAssetDepreciation,
  classifyAsset,
  formatCurrency,
  MONTH_NAMES,
  roundCurrency,
} from "./components/types";

type SheetStep = "period" | "assets" | "result";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operación.";
}

async function parseApiError(response: Response) {
  try {
    const payload = await response.json();
    if (Array.isArray(payload?.message)) return payload.message.join(", ");
    if (typeof payload?.message === "string") return payload.message;
    if (typeof payload?.error === "string") return payload.error;
  } catch {
    /* empty */
  }
  return `Error ${response.status}: ${response.statusText || "Solicitud fallida"}`;
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseApiError(response));
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export default function DepreciationsPage() {
  const now = new Date();

  // ── Process tab state ──
  const [processYear, setProcessYear] = useState(now.getFullYear());
  const [processMonth, setProcessMonth] = useState(now.getMonth() + 1);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [periodRecords, setPeriodRecords] = useState<DepreciationCalculation[]>(
    [],
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // ── Detail dialog ──
  const [viewingRecord, setViewingRecord] =
    useState<DepreciationCalculation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Sheet state ──
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetYear, setSheetYear] = useState(now.getFullYear());
  const [sheetMonth, setSheetMonth] = useState(now.getMonth() + 1);
  const [sheetStep, setSheetStep] = useState<SheetStep>("period");
  const [sheetAssets, setSheetAssets] = useState<FixedAsset[]>([]);
  const [sheetPeriodRecords, setSheetPeriodRecords] = useState<
    DepreciationCalculation[]
  >([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetSelectedIds, setSheetSelectedIds] = useState<Set<number>>(
    new Set(),
  );
  const [sheetExecResult, setSheetExecResult] = useState<RunResult | null>(
    null,
  );
  const [sheetExecError, setSheetExecError] = useState<string | null>(null);
  const [sheetExecuting, setSheetExecuting] = useState(false);
  const [sheetProcessedPreviews, setSheetProcessedPreviews] = useState<
    AssetPreview[]
  >([]);

  // ────────────────────────────────────────
  //  Load preview data (assets + period records)
  // ────────────────────────────────────────
  const loadPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    try {
      const [assetsRes, recordsRes] = await Promise.all([
        apiRequest<FixedAsset[]>("/fixed-assets/active/list"),
        apiRequest<DepreciationCalculation[]>(
          `/depreciation-calculations/period/${processYear}/${processMonth}`,
        ),
      ]);
      setAssets(assetsRes ?? []);
      setPeriodRecords(recordsRes ?? []);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [processYear, processMonth]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  // ── Build preview list ──
  const previews = useMemo<AssetPreview[]>(() => {
    const recordMap = new Map(periodRecords.map((r) => [r.fixedAssetId, r]));
    return assets.map((asset) =>
      classifyAsset(asset, recordMap, processYear, processMonth),
    );
  }, [assets, periodRecords, processYear, processMonth]);

  // ── Sheet previews ──
  const sheetPreviews = useMemo<AssetPreview[]>(() => {
    const recordMap = new Map(
      sheetPeriodRecords.map((r) => [r.fixedAssetId, r]),
    );
    return sheetAssets.map((asset) =>
      classifyAsset(asset, recordMap, sheetYear, sheetMonth),
    );
  }, [sheetAssets, sheetPeriodRecords, sheetYear, sheetMonth]);

  const sheetPendingPreviews = useMemo(
    () => sheetPreviews.filter((p) => p.status === "pending"),
    [sheetPreviews],
  );

  const sheetSelectedPreviews = useMemo(
    () => sheetPreviews.filter((p) => sheetSelectedIds.has(p.asset.id)),
    [sheetPreviews, sheetSelectedIds],
  );

  async function handleLoadSheetAssets() {
    setSheetLoading(true);
    try {
      const [assetsRes, recordsRes] = await Promise.all([
        apiRequest<FixedAsset[]>("/fixed-assets/active/list"),
        apiRequest<DepreciationCalculation[]>(
          `/depreciation-calculations/period/${sheetYear}/${sheetMonth}`,
        ),
      ]);
      setSheetAssets(assetsRes ?? []);
      setSheetPeriodRecords(recordsRes ?? []);
      setSheetSelectedIds(new Set());
      setSheetStep("assets");
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setSheetLoading(false);
    }
  }

  function handleSheetSelectAll() {
    const pendingIds = sheetPendingPreviews.map((p) => p.asset.id);
    setSheetSelectedIds(new Set(pendingIds));
  }

  function handleSheetToggle(id: number) {
    setSheetSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSheetExecute() {
    setSheetExecuting(true);
    setSheetExecError(null);
    setSheetExecResult(null);
    setSheetProcessedPreviews([...sheetSelectedPreviews]);

    const allPending = sheetPendingPreviews;
    const isAllSelected =
      sheetSelectedPreviews.length === allPending.length &&
      allPending.every((p) => sheetSelectedIds.has(p.asset.id));

    try {
      if (isAllSelected) {
        const res = await apiRequest<RunResult>(
          "/depreciation-calculations/run",
          {
            method: "POST",
            body: JSON.stringify({
              processYear: sheetYear,
              processMonth: sheetMonth,
            }),
          },
        );
        setSheetExecResult(res);
      } else {
        let created = 0;
        let totalDepreciated = 0;
        const skipped: Array<{ fixedAssetId: number; reason: string }> = [];
        const processDate = new Date(Date.UTC(sheetYear, sheetMonth, 0))
          .toISOString()
          .split("T")[0];

        for (const preview of sheetSelectedPreviews) {
          const asset = preview.asset;
          const { monthlyDepreciation, newAccumulated } =
            calculateAssetDepreciation(asset);

          if (monthlyDepreciation <= 0) {
            skipped.push({
              fixedAssetId: asset.id,
              reason: "Depreciación calculada no válida",
            });
            continue;
          }

          try {
            await apiRequest("/depreciation-calculations", {
              method: "POST",
              body: JSON.stringify({
                processYear: sheetYear,
                processMonth: sheetMonth,
                processDate,
                amountDepreciation: monthlyDepreciation,
                accumulatedDepreciation: newAccumulated,
                purchaseAccount: asset.assetType!.purchaseAccount,
                depreciationAccount: asset.assetType!.depreciationAccount,
                fixedAssetId: asset.id,
              }),
            });
            created++;
            totalDepreciated = roundCurrency(
              totalDepreciated + monthlyDepreciation,
            );
          } catch (err) {
            skipped.push({
              fixedAssetId: asset.id,
              reason: getErrorMessage(err),
            });
          }
        }

        setSheetExecResult({
          processYear: sheetYear,
          processMonth: sheetMonth,
          processDate: processDate!,
          totalAssetsEvaluated: sheetSelectedPreviews.length,
          totalCalculationsCreated: created,
          totalAssetsSkipped: skipped.length,
          totalAmountDepreciated: totalDepreciated,
          skippedAssets: skipped,
        });
      }

      setSheetStep("result");
      void loadPreview();
    } catch (error) {
      setSheetExecError(getErrorMessage(error));
      setSheetStep("result");
    } finally {
      setSheetExecuting(false);
    }
  }

  function handleOpenSheet() {
    setSheetYear(processYear);
    setSheetMonth(processMonth);
    setSheetStep("period");
    setSheetAssets([]);
    setSheetPeriodRecords([]);
    setSheetSelectedIds(new Set());
    setSheetExecResult(null);
    setSheetExecError(null);
    setSheetProcessedPreviews([]);
    setIsSheetOpen(true);
  }

  return (
    <TooltipProvider>
      <motion.div
        className="container relative mx-auto max-w-7xl min-h-screen bg-gradient-to-br from-emerald-50/40 via-background to-green-50/40 p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-4 px-2 py-4 sm:px-4">
          <AssetPreviewTable
            previews={previews}
            isLoading={isLoadingPreview}
            currentPeriod={`${MONTH_NAMES[processMonth - 1]} ${processYear}`}
            onCalculate={handleOpenSheet}
            processYear={processYear}
            processMonth={processMonth}
            onYearChange={setProcessYear}
            onMonthChange={setProcessMonth}
          />
        </div>

        {/* --- Sheet Wizard --- */}
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            if (sheetExecuting) return;
            setIsSheetOpen(open);
          }}
        >
          <SheetContent
            side="right"
            className={`flex flex-col overflow-hidden p-0 transition-all duration-300 ease-in-out w-full border-l shadow-2xl ${
              sheetStep === "period"
                ? "sm:max-w-md"
                : "sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
            }`}
          >
            {/* --- Sheet Header --- */}
            <SheetHeader className="shrink-0 border-b bg-background/95 backdrop-blur-sm px-6 py-5">
              <div className="flex items-center gap-3">
                {sheetStep !== "period" && !sheetExecuting && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
                    onClick={() => {
                      if (sheetStep === "result") {
                        setSheetExecResult(null);
                        setSheetExecError(null);
                        setSheetStep("assets");
                      } else {
                        setSheetStep("period");
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 shadow-sm">
                    <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <SheetTitle className="text-lg font-bold tracking-tight">
                      {sheetStep === "period" && "Configurar Período"}
                      {sheetStep === "assets" && "Selección de Activos"}
                      {sheetStep === "result" && "Resumen de Ejecución"}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                      {sheetStep === "period" &&
                        "Defina el mes y año contable a procesar."}
                      {sheetStep === "assets" &&
                        `${MONTH_NAMES[sheetMonth - 1]} ${sheetYear} — Revise y seleccione los activos.`}
                      {sheetStep === "result" &&
                        `Proceso finalizado para ${MONTH_NAMES[sheetMonth - 1]} ${sheetYear}.`}
                    </SheetDescription>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center gap-1.5 pt-4">
                {["period", "assets", "result"].map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                        ["period", "assets", "result"].indexOf(sheetStep) >= i
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-muted-foreground/20"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </SheetHeader>

            {/* --- Sheet Body --- */}
            <div className="flex-1 overflow-y-auto bg-muted/10 custom-scrollbar">
              <AnimatePresence mode="wait">
                {/* Paso 1: Período */}
                {sheetStep === "period" && (
                  <motion.div
                    key="period"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col p-6 sm:p-8"
                  >
                    {/* Ícono centrado fuera del card */}
                    <div className="flex justify-center mb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm dark:bg-emerald-950/30">
                        <CalendarDays className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>

                    <div className="bg-background rounded-2xl border shadow-sm p-5 w-full space-y-5">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">
                          Período Contable
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Selecciona el mes y año a procesar
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mes
                          </Label>
                          <Select
                            value={sheetMonth.toString()}
                            onValueChange={(v) => setSheetMonth(parseInt(v))}
                          >
                            <SelectTrigger className="h-10 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MONTH_NAMES.map((name, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {String(i + 1).padStart(2, "0")} — {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Año
                          </Label>
                          <Select
                            value={sheetYear.toString()}
                            onValueChange={(v) => setSheetYear(parseInt(v))}
                          >
                            <SelectTrigger className="h-10 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 11 }, (_, i) => {
                                const y = now.getFullYear() - 5 + i;
                                return (
                                  <SelectItem key={y} value={String(y)}>
                                    {y}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Preview del período seleccionado */}
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          {MONTH_NAMES[sheetMonth - 1]} {sheetYear}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Paso 2: Activos */}
                {sheetStep === "assets" && (
                  <motion.div
                    key="assets"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-4"
                  >
                    {/* Controles de Selección y Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background p-4 rounded-xl border shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-2.5 py-1 text-xs font-medium"
                        >
                          Total: {sheetPreviews.length}
                        </Badge>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80 px-2.5 py-1 text-xs dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                          Pendientes: {sheetPendingPreviews.length}
                        </Badge>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 px-2.5 py-1 text-xs dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          Listos:{" "}
                          {
                            sheetPreviews.filter(
                              (p) => p.status === "deprecated",
                            ).length
                          }
                        </Badge>
                      </div>

                      {sheetPendingPreviews.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                          {sheetSelectedIds.size > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSheetSelectedIds(new Set())}
                              className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Limpiar ({sheetSelectedIds.size})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSheetSelectAll}
                            className="h-8 gap-1.5 text-xs bg-background"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Seleccionar Todo
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Lista de Activos */}
                    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                      {sheetPreviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                          <FileBox className="h-12 w-12 text-muted-foreground/20 mb-3" />
                          <p className="text-sm font-medium text-foreground">
                            Sin activos registrados
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            No hay activos disponibles para depreciar en este
                            período.
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/50 max-h-[55vh] overflow-y-auto custom-scrollbar">
                          {sheetPreviews.map((preview, idx) => {
                            const isPending = preview.status === "pending";
                            const isSelected = sheetSelectedIds.has(
                              preview.asset.id,
                            );
                            const isDepreciated =
                              preview.status === "deprecated";

                            return (
                              <motion.div
                                key={preview.asset.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: Math.min(idx * 0.02, 0.2),
                                }}
                                className={`flex items-center gap-4 px-4 py-3 sm:px-5 transition-colors group ${
                                  isSelected
                                    ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                                    : "hover:bg-muted/40"
                                }`}
                              >
                                {/* Checkbox / Status Icon */}
                                <div className="shrink-0 pt-0.5">
                                  {isPending ? (
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() =>
                                        handleSheetToggle(preview.asset.id)
                                      }
                                      className="h-4 w-4 rounded-sm data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                  ) : isDepreciated ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                                  )}
                                </div>

                                {/* Asset Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] font-mono px-1.5 py-0 h-4 bg-background"
                                    >
                                      #{preview.asset.id}
                                    </Badge>
                                    <span className="text-sm font-semibold text-foreground truncate">
                                      {preview.asset.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                      {preview.asset.assetType?.name ||
                                        "Sin Categoría"}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                      {preview.asset.department?.name ||
                                        "Sin Dept."}
                                    </span>
                                  </div>
                                </div>

                                {/* Amount & Status text */}
                                <div className="shrink-0 text-right flex flex-col items-end">
                                  {preview.monthlyDepreciation > 0 ? (
                                    <span className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                                      {formatCurrency(
                                        preview.monthlyDepreciation,
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-sm font-medium text-muted-foreground/50">
                                      —
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] font-medium uppercase tracking-wider mt-1 ${
                                      isPending
                                        ? "text-amber-600 dark:text-amber-400"
                                        : isDepreciated
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-muted-foreground"
                                    }`}
                                  >
                                    {isPending
                                      ? "Pendiente"
                                      : isDepreciated
                                        ? "Depreciado"
                                        : (preview.reason ?? "N/A")}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Resultados */}
                {sheetStep === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-6"
                  >
                    {sheetExecError ? (
                      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                        <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                            Error en el proceso
                          </p>
                          <p className="text-xs text-red-600/90 dark:text-red-400/90 mt-1 leading-relaxed">
                            {sheetExecError}
                          </p>
                        </div>
                      </div>
                    ) : (
                      sheetExecResult && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                Depreciación Ejecutada Exitosamente
                              </p>
                              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5">
                                Período: {MONTH_NAMES[sheetMonth - 1]}{" "}
                                {sheetYear}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="flex flex-col justify-center rounded-xl border bg-background p-4 shadow-sm">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Evaluados
                              </span>
                              <span className="text-2xl font-bold text-foreground tabular-nums">
                                {sheetExecResult.totalAssetsEvaluated}
                              </span>
                            </div>
                            <div className="flex flex-col justify-center rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                                Procesados
                              </span>
                              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                                {sheetExecResult.totalCalculationsCreated}
                              </span>
                            </div>
                            <div className="flex flex-col justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/5">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                                Omitidos
                              </span>
                              <span className="text-2xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                                {sheetExecResult.totalAssetsSkipped}
                              </span>
                            </div>
                            <div className="flex flex-col justify-center rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/5">
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                                Total Depreciado
                              </span>
                              <span className="text-xl font-bold text-blue-700 dark:text-blue-300 tabular-nums tracking-tight">
                                {formatCurrency(
                                  sheetExecResult.totalAmountDepreciated,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Detalle por activo procesado */}
                          {sheetProcessedPreviews.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                Detalle por Activo (
                                {sheetProcessedPreviews.length})
                              </h4>
                              <div className="rounded-xl border bg-background overflow-hidden">
                                {/* Encabezado */}
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 bg-muted/30 border-b">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Activo
                                  </span>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                    Depreciación
                                  </span>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                    Acumulada
                                  </span>
                                </div>
                                <div className="divide-y divide-border/50 max-h-56 overflow-y-auto custom-scrollbar">
                                  {sheetProcessedPreviews.map((preview) => {
                                    const { newAccumulated } =
                                      calculateAssetDepreciation(preview.asset);
                                    return (
                                      <div
                                        key={preview.asset.id}
                                        className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-4 py-2.5"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Badge
                                            variant="outline"
                                            className="text-[9px] font-mono px-1.5 py-0 shrink-0 h-4"
                                          >
                                            #{preview.asset.id}
                                          </Badge>
                                          <span className="text-xs font-medium text-foreground truncate">
                                            {preview.asset.name}
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums text-right">
                                          {formatCurrency(
                                            preview.monthlyDepreciation,
                                          )}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground tabular-nums text-right">
                                          {formatCurrency(newAccumulated)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Total row */}
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-4 py-2.5 bg-muted/20 border-t">
                                  <span className="text-xs font-semibold text-foreground">
                                    Total
                                  </span>
                                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums text-right">
                                    {formatCurrency(
                                      sheetProcessedPreviews.reduce(
                                        (s, p) => s + p.monthlyDepreciation,
                                        0,
                                      ),
                                    )}
                                  </span>
                                  <span className="text-[11px] tabular-nums text-right" />
                                </div>
                              </div>
                            </div>
                          )}

                          {sheetExecResult.skippedAssets.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                Omitidos ({sheetExecResult.skippedAssets.length}
                                )
                              </h4>
                              <div className="rounded-xl border bg-background overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                                <div className="divide-y divide-border/50">
                                  {sheetExecResult.skippedAssets.map(
                                    (sa, i) => (
                                      <div
                                        key={i}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-4 py-2.5"
                                      >
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] font-mono w-fit"
                                        >
                                          ID {sa.fixedAssetId}
                                        </Badge>
                                        <span className="text-[11px] text-muted-foreground sm:text-right">
                                          {sa.reason}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- Sheet Footer --- */}
            <div className="shrink-0 border-t bg-background p-4 sm:px-6 sm:py-5 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
              {sheetStep === "period" && (
                <Button
                  size="lg"
                  onClick={() => void handleLoadSheetAssets()}
                  disabled={sheetLoading}
                  className="w-full text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  {sheetLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Continuar
                </Button>
              )}

              {sheetStep === "assets" && (
                <div className="space-y-3">
                  {sheetSelectedIds.size > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <p>
                        <strong>Aviso:</strong> Se crearán{" "}
                        {sheetSelectedIds.size} registros contables irrevocables
                        por{" "}
                        <strong>
                          {formatCurrency(
                            sheetSelectedPreviews.reduce(
                              (s, p) => s + p.monthlyDepreciation,
                              0,
                            ),
                          )}
                        </strong>
                        .
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSheetStep("period")}
                      className="flex-1 text-sm font-medium"
                    >
                      Volver
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => void handleSheetExecute()}
                      disabled={sheetSelectedIds.size === 0 || sheetExecuting}
                      className="flex-[2] text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
                    >
                      {sheetExecuting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Calculator className="mr-2 h-4 w-4" />
                      )}
                      Ejecutar Depreciación
                    </Button>
                  </div>
                </div>
              )}

              {sheetStep === "result" && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsSheetOpen(false)}
                  className="w-full text-sm font-semibold"
                >
                  Cerrar Panel
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Dialogs */}
        <DepreciationDetailDialog
          depreciation={viewingRecord}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}
