"use client";

import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  Loader2,
  Search,
  Trash2,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DepreciationCalculation, SortableKey } from "./types";

type DepreciationTableProps = {
  records: DepreciationCalculation[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onSort: (key: SortableKey) => void;
  onView: (record: DepreciationCalculation) => void;
  onDelete: (record: DepreciationCalculation) => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onCalculate?: () => void;
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

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPageNumbers(currentPage: number, totalPages: number) {
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });
}

function SortableHeader({
  label,
  sortKey,
  onSort,
}: {
  label: string;
  sortKey: SortableKey;
  onSort: (key: SortableKey) => void;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 text-xs font-semibold hover:text-foreground transition-colors"
      >
        {label}
        <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />
      </button>
    </TableHead>
  );
}

export function DepreciationTable({
  records,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onSort,
  onView,
  onDelete,
  currentPage,
  totalPages,
  totalRecords,
  onPreviousPage,
  onNextPage,
  onPageChange,
  onCalculate,
}: DepreciationTableProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    String(currentYear - 5 + i),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
        {/* Title bar */}
        <div className="border-b border-border/30 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">
              Registro de Depreciaciones
            </h3>
            {onCalculate && (
              <Button
                size="sm"
                onClick={onCalculate}
                className="ml-auto h-7 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                <Calculator className="h-3 w-3" />
                Calcular Depreciaciones
              </Button>
            )}
            <Badge
              variant="secondary"
              className={`${onCalculate ? "" : "ml-auto"} text-xs font-medium`}
            >
              {totalRecords}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border/40 bg-gradient-to-r from-muted/30 to-muted/10 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger className="h-8 w-24 bg-background text-xs shadow-sm">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="h-8 w-32 bg-background text-xs shadow-sm">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70" />
              <Input
                type="search"
                placeholder="Buscar por activo o cuenta..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 bg-background pl-7 text-xs shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <SortableHeader
                    label="Activo"
                    sortKey="fixedAssetId"
                    onSort={onSort}
                  />
                  <TableHead className="text-xs font-semibold">
                    Período
                  </TableHead>
                  <SortableHeader
                    label="Fecha"
                    sortKey="processDate"
                    onSort={onSort}
                  />
                  <SortableHeader
                    label="Monto"
                    sortKey="amountDepreciation"
                    onSort={onSort}
                  />
                  <SortableHeader
                    label="Acumulado"
                    sortKey="accumulatedDepreciation"
                    onSort={onSort}
                  />
                  <TableHead className="text-xs font-semibold">
                    Cta. Compra
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Cta. Depreciación
                  </TableHead>
                  <TableHead className="w-[80px] text-center text-xs font-semibold">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                        <span className="text-xs text-muted-foreground">
                          Cargando registros...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Sin resultados
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          No hay depreciaciones para este período.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {records.map((record) => (
                      <motion.tr
                        key={record.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group border-b border-border/30 transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                              {record.fixedAssetId}
                            </div>
                            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                              {record.fixedAsset?.name ??
                                `Activo #${record.fixedAssetId}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium"
                          >
                            {MONTH_NAMES[record.processMonth - 1]?.slice(0, 3)}{" "}
                            {record.processYear}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-muted-foreground">
                          {formatDate(record.processDate)}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                            {formatCurrency(record.amountDepreciation)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            {formatCurrency(record.accumulatedDepreciation)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <code className="text-[11px] text-muted-foreground">
                            {record.purchaseAccount}
                          </code>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <code className="text-[11px] text-muted-foreground">
                            {record.depreciationAccount}
                          </code>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => onView(record)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-[11px]">
                                Ver detalles
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                  onClick={() => onDelete(record)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-[11px]">
                                Eliminar
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-4 py-2.5">
              <p className="text-[11px] text-muted-foreground">
                {totalRecords} registro{totalRecords !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage <= 1}
                  onClick={onPreviousPage}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 text-[11px]"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage >= totalPages}
                  onClick={onNextPage}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
