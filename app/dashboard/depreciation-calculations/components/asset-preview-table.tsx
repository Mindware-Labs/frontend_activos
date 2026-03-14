"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AssetPreview } from "./types";
import { formatCurrency, MONTH_NAMES } from "./types";

type AssetPreviewTableProps = {
  previews: AssetPreview[];
  isLoading: boolean;
  onCalculate?: () => void;
  currentPeriod?: string;
  processYear: number;
  processMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
};

const STATUS_CONFIG = {
  deprecated: {
    label: "Depreciado",
    icon: Check,
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pendiente",
    icon: Clock,
    badge:
      "bg-amber-100 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
  ineligible: {
    label: "No elegible",
    icon: XCircle,
    badge:
      "bg-gray-100 text-gray-600 border-gray-200/60 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/40",
    dot: "bg-gray-400",
  },
} as const;

function getPageNumbers(currentPage: number, totalPages: number) {
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });
}

export function AssetPreviewTable({
  previews,
  isLoading,
  onCalculate,
  currentPeriod,
  processYear,
  processMonth,
  onYearChange,
  onMonthChange,
}: AssetPreviewTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "deprecated" | "ineligible"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    let result = previews;

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.asset.name.toLowerCase().includes(q) ||
          (p.asset.description ?? "").toLowerCase().includes(q) ||
          (p.asset.assetType?.name ?? "").toLowerCase().includes(q) ||
          (p.asset.department?.name ?? "").toLowerCase().includes(q) ||
          p.asset.id.toString().includes(q),
      );
    }

    return result;
  }, [previews, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const counts = useMemo(() => {
    const deprecated = previews.filter((p) => p.status === "deprecated").length;
    const pending = previews.filter((p) => p.status === "pending").length;
    const ineligible = previews.filter((p) => p.status === "ineligible").length;
    return { deprecated, pending, ineligible, total: previews.length };
  }, [previews]);

  return (
    <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
      {/* Summary bar */}
      <div className="border-b border-border/30 bg-linear-to-r from-primary/5 to-primary/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">
              Activos Fijos
            </span>
            <Badge variant="secondary" className="text-xs font-medium">
              {counts.total}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className={`rounded-full px-2.5 py-1 transition-colors ${statusFilter === "all" ? "bg-foreground/10 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pending");
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${statusFilter === "pending" ? "bg-amber-100 font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pendientes ({counts.pending})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("deprecated");
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${statusFilter === "deprecated" ? "bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Depreciados ({counts.deprecated})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ineligible");
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${statusFilter === "ineligible" ? "bg-gray-100 font-semibold text-gray-600 dark:bg-gray-800/30 dark:text-gray-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              No elegibles ({counts.ineligible})
            </button>
          </div>
        </div>
      </div>

      {/* Search + Period filter + Actions */}
      <div className="border-b border-border/40 bg-linear-to-r from-muted/30 to-muted/10 px-3 py-2.5 sm:px-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Row 1 (mobile) / Left group (desktop): Search + Period */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-0 sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70" />
              <Input
                type="search"
                placeholder="Buscar por activo, tipo, departamento..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 bg-background pl-7 text-xs shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            {/* Period filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-2 py-1 shrink-0">
              <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
              <Select
                value={processMonth.toString()}
                onValueChange={(v) => onMonthChange(parseInt(v))}
              >
                <SelectTrigger className="h-7 w-28 border-0 bg-transparent px-1.5 text-xs shadow-none focus:ring-0">
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
              <div className="h-4 w-px bg-border/60" />
              <Select
                value={processYear.toString()}
                onValueChange={(v) => onYearChange(parseInt(v))}
              >
                <SelectTrigger className="h-7 w-20 border-0 bg-transparent px-1.5 text-xs shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const y = new Date().getFullYear() - 5 + i;
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

          {/* Row 2 (mobile) / Right group (desktop): Actions */}
          <div className="flex items-center gap-2 lg:ml-auto">
            {onCalculate && (
              <Button
                size="sm"
                onClick={onCalculate}
                className="h-7 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                <Calculator className="h-3 w-3" />
                <span className="hidden sm:inline">
                  Calcular Depreciaciones
                </span>
                <span className="sm:hidden">Calcular</span>
                {currentPeriod && (
                  <span className="ml-1 rounded bg-emerald-800/30 px-1 py-0.5 text-[10px] font-normal">
                    {currentPeriod}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            <span className="text-xs text-muted-foreground">
              Cargando activos...
            </span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16">
            <Search className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Sin resultados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {paginated.map((preview, index) => {
                const cfg = STATUS_CONFIG[preview.status];
                const StatusIcon = cfg.icon;

                return (
                  <motion.div
                    key={preview.asset.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <div className="group relative rounded-xl border border-border/50 bg-card transition-all duration-200 hover:border-border hover:shadow-md">
                      {/* Top: Status badge */}
                      <div className="flex items-center justify-end px-3 pt-3 pb-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </TooltipTrigger>
                          {preview.reason && (
                            <TooltipContent side="top" className="text-xs">
                              {preview.reason}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>

                      {/* Name + Department */}
                      <div className="px-3 pb-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {preview.asset.name}
                        </p>
                        {preview.asset.department && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {preview.asset.department.name}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                          {preview.asset.assetType?.name ?? "Sin tipo"}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="mx-3 border-t border-border/40" />

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3 py-2.5 text-[11px]">
                        <div>
                          <p className="text-muted-foreground/70">
                            Valor Compra
                          </p>
                          <p className="font-medium text-foreground">
                            {formatCurrency(preview.asset.purchaseValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/70">Residual</p>
                          <p className="font-medium text-muted-foreground">
                            {formatCurrency(preview.asset.residualValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/70">Vida Útil</p>
                          <p className="font-medium text-muted-foreground">
                            {preview.asset.usefulLifeMonths
                              ? `${preview.asset.usefulLifeMonths} meses`
                              : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground/70">
                            Dep. Mensual
                          </p>
                          {preview.monthlyDepreciation > 0 ? (
                            <p className="font-bold text-blue-700 dark:text-blue-400">
                              {formatCurrency(preview.monthlyDepreciation)}
                            </p>
                          ) : (
                            <p className="text-muted-foreground/50">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/30 pt-3 mt-3">
            <p className="text-[11px] text-muted-foreground">
              Mostrando {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
              {filtered.length} activo{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
