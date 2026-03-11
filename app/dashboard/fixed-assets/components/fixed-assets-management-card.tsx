"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { fadeInUp } from "./animations";
import type {
  Department,
  FixedAsset,
  FixedAssetStatusFilter,
  SortableFixedAssetKey,
  AssetType,
} from "./types";

type FixedAssetsManagementCardProps = {
  statusFilter: FixedAssetStatusFilter;
  onStatusFilterChange: (value: FixedAssetStatusFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  assetTypeFilter: string;
  onAssetTypeFilterChange: (value: string) => void;
  departments: Department[];
  assetTypes: AssetType[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedRows: Set<number>;
  isSaving: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  paginatedAssets: FixedAsset[];
  isLoading: boolean;
  onCreate: () => void;
  onSort: (key: SortableFixedAssetKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (asset: FixedAsset) => void;
  onView: (asset: FixedAsset) => void;
  onDelete: (asset: FixedAsset) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalAssets: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number) {
  return value.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
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

const STATUS_OPTIONS: { value: FixedAssetStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export function FixedAssetsManagementCard({
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  assetTypeFilter,
  onAssetTypeFilterChange,
  departments,
  assetTypes,
  searchQuery,
  onSearchQueryChange,
  selectedRows,
  isSaving,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onClearSelection,
  paginatedAssets,
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
  totalAssets,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: FixedAssetsManagementCardProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const selectedInPageCount = paginatedAssets.filter((asset) =>
    selectedRows.has(asset.id),
  ).length;
  const allSelectedInPage =
    paginatedAssets.length > 0 &&
    selectedInPageCount === paginatedAssets.length;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <Card className="overflow-hidden border-border/50 bg-card shadow-lg backdrop-blur-sm">
        {/* Título de la Sección */}
        <div className="border-b border-border/30 bg-linear-to-r from-primary/5 to-primary/10 px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">
              Listado de Activos Fijos
            </h3>
            <Badge variant="secondary" className="ml-auto text-xs font-medium">
              {totalAssets} {totalAssets === 1 ? "activo" : "activos"}
            </Badge>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="border-b border-border/40 bg-linear-to-r from-muted/30 to-muted/10 px-3 py-2 sm:px-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* Segmented control */}
            <div className="relative flex h-8 w-full rounded-lg bg-muted/60 p-0.5 shadow-inner ring-1 ring-border/50 lg:w-auto shrink-0">
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
                      layoutId="fixed-asset-status-pill"
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
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
              >
                <SelectTrigger className="h-8 w-full text-xs bg-background shadow-sm sm:w-36">
                  <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los dptos.</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={assetTypeFilter}
                onValueChange={onAssetTypeFilterChange}
              >
                <SelectTrigger className="h-8 w-full text-xs bg-background shadow-sm sm:w-36">
                  <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Tipo de Activo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar activo..."
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  className="h-8 bg-background pl-8 text-xs shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>

              <Button
                onClick={onCreate}
                disabled={!departments.length || !assetTypes.length}
                className="h-8 w-full shrink-0 rounded-lg px-3 text-xs sm:w-auto shadow-sm active:scale-[0.98] transition-transform bg-primary hover:bg-primary/90 font-medium"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Añadir Activo
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

          {/* Estado de Carga / Vacio */}
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="mb-3 h-6 w-6 animate-spin text-primary/60" />
              <p className="text-xs font-medium tracking-wide">
                Cargando registros...
              </p>
            </div>
          ) : paginatedAssets.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center border-b border-border bg-muted/5 text-center px-4">
              <div className="mb-3 rounded-full bg-muted/30 p-3 ring-1 ring-border">
                <Users className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No hay activos fijos
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-62.5">
                Ajusta los filtros de búsqueda o crea un nuevo activo para
                comenzar.
              </p>
            </div>
          ) : (
            <>
              {/* Controles Mobile Selección */}
              <div className="flex items-center justify-between border-b border-border bg-muted/10 px-4 py-2.5 md:hidden">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Sel: {selectedInPageCount}/{paginatedAssets.length}
                </span>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                  Seleccionar página
                  <Checkbox
                    checked={allSelectedInPage}
                    onCheckedChange={onToggleSelectAll}
                    className="h-4 w-4 rounded-lg"
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
                          className="rounded-lg border-muted-foreground/40 data-[state=checked]:border-primary"
                        />
                      </TableHead>
                      {/* Cabeceras de Tabla Ordenables */}
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
                          onClick={() => onSort("registrationDate")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Fecha Reg.{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("purchaseValue")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Valor Compra{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("departmentId")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Departamento{" "}
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-10 px-2">
                        <button
                          onClick={() => onSort("assetTypeId")}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Tipo{" "}
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
                      {paginatedAssets.map((asset, index) => {
                        const isChecked = selectedRows.has(asset.id);

                        return (
                          <motion.tr
                            key={asset.id}
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
                                onCheckedChange={() =>
                                  onToggleSelectRow(asset.id)
                                }
                                className="rounded-lg border-muted-foreground/40 data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-7 w-7 rounded-md border border-border/50 bg-linear-to-br from-background to-muted/20 shadow-sm shrink-0">
                                  <AvatarFallback className="rounded-md bg-transparent text-[10px] font-semibold text-muted-foreground">
                                    {getInitials(asset.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold leading-tight text-foreground">
                                  {asset.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                <span className="text-xs font-medium">
                                  {formatDate(asset.registrationDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1.5 font-mono text-xs font-medium text-muted-foreground">
                              {formatCurrency(asset.purchaseValue)}
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border-border/60"
                              >
                                {asset.department?.name ??
                                  `Dpto #${asset.departmentId}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border-border/60"
                              >
                                {asset.assetType?.name ??
                                  `Tipo #${asset.assetTypeId}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full shadow-sm",
                                    asset.status
                                      ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                                      : "bg-amber-500 ring-2 ring-amber-500/20",
                                  )}
                                />
                                <span className="text-xs font-medium text-muted-foreground">
                                  {asset.status ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onView(asset)}
                                      className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                                      onClick={() => onEdit(asset)}
                                      disabled={isSaving}
                                      className="h-7 w-7 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-colors"
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
                                      onClick={() => onDelete(asset)}
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

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-44"
                                  >
                                    <DropdownMenuItem className="text-xs">
                                      <FileText className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      Ver documento
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs">
                                      <Printer className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      Imprimir ficha
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs">
                                      <Download className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      Exportar datos
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                  {paginatedAssets.map((asset, index) => {
                    const isChecked = selectedRows.has(asset.id);

                    return (
                      <motion.div
                        key={asset.id}
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
                            onCheckedChange={() => onToggleSelectRow(asset.id)}
                            className="h-4 w-4 rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {asset.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {asset.assetType?.name ??
                                    `Tipo #${asset.assetTypeId}`}{" "}
                                  • {formatCurrency(asset.purchaseValue)}
                                </p>
                              </div>
                              <div className="flex items-center -mr-1.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onView(asset)}
                                  className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit(asset)}
                                  disabled={isSaving}
                                  className="h-8 w-8 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDelete(asset)}
                                  disabled={isSaving}
                                  className="h-8 w-8 text-muted-foreground hover:bg-rose-100 hover:text-rose-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border-border/60"
                              >
                                {asset.department?.name ??
                                  `Dpto #${asset.departmentId}`}
                              </Badge>
                              <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    asset.status
                                      ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                                      : "bg-amber-500 ring-2 ring-amber-500/20",
                                  )}
                                />
                                {asset.status ? "Activo" : "Inactivo"}
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
          {!isLoading && totalAssets > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[11px] font-medium text-muted-foreground text-center sm:text-left">
                Mostrando{" "}
                <span className="text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="text-foreground">
                  {Math.min(currentPage * itemsPerPage, totalAssets)}
                </span>{" "}
                de <span className="text-foreground">{totalAssets}</span>
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
