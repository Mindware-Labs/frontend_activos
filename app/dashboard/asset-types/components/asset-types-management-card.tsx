"use client";

import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { fadeInUp } from "./animations";
import type {
  AssetType,
  AssetTypeStatusFilter,
  SortableAssetTypeKey,
} from "./types";

function getPageNumbers(currentPage: number, totalPages: number) {
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });
}

const STATUS_OPTIONS: { value: AssetTypeStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

type AssetTypesManagementCardProps = {
  statusFilter: AssetTypeStatusFilter;
  onStatusFilterChange: (value: AssetTypeStatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedRows: Set<number>;
  isSaving: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  paginatedAssetTypes: AssetType[];
  isLoading: boolean;
  onCreate: () => void;
  onSort: (key: SortableAssetTypeKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (assetType: AssetType) => void;
  onView: (assetType: AssetType) => void;
  onDelete: (assetType: AssetType) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalAssetTypes: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

export function AssetTypesManagementCard({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  selectedRows,
  isSaving,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onClearSelection,
  paginatedAssetTypes,
  isLoading,
  onCreate,
  onSort,
  onToggleSelectAll,
  onToggleSelectRow,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  itemsPerPage,
  totalAssetTypes,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: AssetTypesManagementCardProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const selectedInPageCount = paginatedAssetTypes.filter((at) =>
    selectedRows.has(at.id),
  ).length;
  const allSelectedInPage =
    paginatedAssetTypes.length > 0 &&
    selectedInPageCount === paginatedAssetTypes.length;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <Card className="overflow-hidden border-border/50 bg-card shadow-lg backdrop-blur-sm">
        {/* Título de la Sección */}
        <div className="border-b border-border/30 bg-linear-to-r from-primary/5 to-primary/10 px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              Listado de Tipos de Activo
            </h3>
            <Badge variant="secondary" className="ml-auto text-xs font-medium">
              {totalAssetTypes} {totalAssetTypes === 1 ? "tipo" : "tipos"}
            </Badge>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="border-b border-border/40 bg-linear-to-r from-muted/30 to-muted/10 px-3 py-2 sm:px-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex h-8 w-full rounded-lg bg-muted/60 p-0.5 shadow-inner ring-1 ring-border/50 lg:w-auto">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusFilterChange(opt.value)}
                  className={cn(
                    "relative z-10 flex-1 rounded-md px-3.5 text-[11px] font-semibold transition-all duration-200 lg:flex-initial",
                    statusFilter === opt.value
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {statusFilter === opt.value && (
                    <motion.div
                      layoutId="asset-type-status-pill"
                      className="absolute inset-0 rounded-md bg-primary shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:justify-end">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/70" />
                <Input
                  type="search"
                  placeholder="Buscar tipo..."
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  className="h-8 bg-background pl-7 text-xs shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary/30"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={onCreate}
                disabled={isSaving}
                size="sm"
                className="h-8 w-full rounded-lg sm:w-auto shadow-sm active:scale-[0.98] transition-transform font-semibold"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Nuevo Tipo
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Panel de Acciones Masivas (Flotante) */}
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-border bg-emerald-500/5 dark:bg-emerald-500/10"
              >
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedRows.size} fila(s) seleccionadas
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkActivate}
                      disabled={isSaving}
                      className="h-8 border-emerald-200/50 bg-background/50 text-[11px] text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Activar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkDeactivate}
                      disabled={isSaving}
                      className="h-8 border-amber-200/50 bg-background/50 text-[11px] text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-950/50"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Desactivar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkDelete}
                      disabled={isSaving}
                      className="h-8 border-rose-200/50 bg-background/50 text-[11px] text-rose-700 hover:bg-rose-100 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/50"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearSelection}
                      className="h-8 text-[11px]"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estado de Carga / Vacío */}
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary/60" />
              <p className="text-xs font-medium tracking-wide">
                Cargando registros...
              </p>
            </div>
          ) : paginatedAssetTypes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center border-b border-border bg-muted/5 text-center px-4">
              <div className="mb-3 rounded-full bg-muted/30 p-3 ring-1 ring-border">
                <Tag className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No hay tipos de activos
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-62.5">
                Ajusta los filtros de búsqueda o crea un nuevo tipo para
                comenzar.
              </p>
            </div>
          ) : (
            <>
              {/* Controles Mobile Selección */}
              <div className="flex items-center justify-between border-b border-border bg-muted/10 px-4 py-2.5 md:hidden">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Sel: {selectedInPageCount}/{paginatedAssetTypes.length}
                </span>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                  Seleccionar página
                  <Checkbox
                    checked={allSelectedInPage}
                    onCheckedChange={onToggleSelectAll}
                    className="h-4 w-4 rounded-[4px]"
                  />
                </label>
              </div>

              {/* TABLA ESCRITORIO */}
              <div className="hidden w-full overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-border/50 bg-linear-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30">
                      <TableHead className="w-10 pl-5 pr-2">
                        <Checkbox
                          checked={allSelectedInPage}
                          onCheckedChange={onToggleSelectAll}
                          className="rounded-[4px] border-muted-foreground/40 data-[state=checked]:border-primary"
                        />
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("name")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Nombre{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("purchaseAccount")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cta. Compra{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("depreciationAccount")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cta. Depreciación{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("status")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Estado{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {paginatedAssetTypes.map((at, index) => {
                        const isChecked = selectedRows.has(at.id);

                        return (
                          <motion.tr
                            key={at.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className={cn(
                              "group border-b-border/40 transition-all hover:bg-muted/60 hover:shadow-sm",
                              isChecked && "bg-primary/8 hover:bg-primary/12",
                            )}
                          >
                            <TableCell className="w-10 pl-5 pr-2 py-1.5">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => onToggleSelectRow(at.id)}
                                className="rounded-[4px] border-muted-foreground/40 data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <span className="text-sm font-semibold leading-tight text-foreground">
                                {at.name}
                              </span>
                            </TableCell>
                            <TableCell className="px-2 py-1.5 font-mono text-xs font-medium text-muted-foreground">
                              {at.purchaseAccount || "-"}
                            </TableCell>
                            <TableCell className="px-2 py-1.5 font-mono text-xs font-medium text-muted-foreground">
                              {at.depreciationAccount || "-"}
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "h-2 w-2 rounded-full shadow-sm",
                                    at.status
                                      ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                                      : "bg-amber-500 ring-2 ring-amber-500/20",
                                  )}
                                />
                                <span className="text-xs font-medium text-muted-foreground">
                                  {at.status ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onView(at)}
                                      className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">
                                    Ver detalle
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onEdit(at)}
                                      disabled={isSaving}
                                      className="h-7 w-7 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-all"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">
                                    Editar
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onDelete(at)}
                                      disabled={isSaving}
                                      className="h-7 w-7 text-muted-foreground hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">
                                    Eliminar
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* LISTA MÓVIL */}
              <div className="flex flex-col gap-px bg-border/40 md:hidden">
                <AnimatePresence>
                  {paginatedAssetTypes.map((at, index) => {
                    const isChecked = selectedRows.has(at.id);

                    return (
                      <motion.div
                        key={at.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className={cn(
                          "bg-card px-3 py-2.5 transition-all hover:bg-muted/30",
                          isChecked &&
                            "bg-primary/8 border-l-2 border-l-primary",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => onToggleSelectRow(at.id)}
                            className="h-4 w-4 rounded-[3px] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {at.name}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                                  C.C: {at.purchaseAccount || "-"} | C.D:{" "}
                                  {at.depreciationAccount || "-"}
                                </p>
                              </div>
                              <div className="flex items-center -mr-1.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onView(at)}
                                  className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit(at)}
                                  disabled={isSaving}
                                  className="h-8 w-8 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDelete(at)}
                                  disabled={isSaving}
                                  className="h-8 w-8 text-muted-foreground hover:bg-rose-100 hover:text-rose-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    at.status
                                      ? "bg-emerald-500 ring-1 ring-emerald-500/20"
                                      : "bg-amber-500 ring-1 ring-amber-500/20",
                                  )}
                                />
                                {at.status ? "Activo" : "Inactivo"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Paginación Minimalista */}
          {!isLoading && totalAssetTypes > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[11px] font-medium text-muted-foreground text-center sm:text-left">
                Mostrando{" "}
                <span className="text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="text-foreground">
                  {Math.min(currentPage * itemsPerPage, totalAssetTypes)}
                </span>{" "}
                de <span className="text-foreground">{totalAssetTypes}</span>
              </p>

              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-background shadow-sm"
                  onClick={onPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {pageNumbers.map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-7 min-w-7 px-2 text-[11px]",
                        currentPage !== pageNum &&
                          "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-background shadow-sm"
                  onClick={onNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
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
