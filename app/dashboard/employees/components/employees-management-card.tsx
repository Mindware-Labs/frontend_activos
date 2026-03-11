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
  Employee,
  EmployeeStatusFilter,
  SortableEmployeeKey,
} from "./types";

const STATUS_OPTIONS: { value: EmployeeStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

type EmployeesManagementCardProps = {
  statusFilter: EmployeeStatusFilter;
  onStatusFilterChange: (value: EmployeeStatusFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  departments: Department[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedRows: Set<number>;
  isSaving: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  paginatedEmployees: Employee[];
  isLoading: boolean;
  onCreate: () => void;
  onSort: (key: SortableEmployeeKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalEmployees: number;
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

function getPageNumbers(currentPage: number, totalPages: number) {
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });
}

export function EmployeesManagementCard({
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  searchQuery,
  onSearchQueryChange,
  selectedRows,
  isSaving,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  onClearSelection,
  paginatedEmployees,
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
  totalEmployees,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: EmployeesManagementCardProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const selectedInPageCount = paginatedEmployees.filter((employee) =>
    selectedRows.has(employee.id),
  ).length;
  const allSelectedInPage =
    paginatedEmployees.length > 0 &&
    selectedInPageCount === paginatedEmployees.length;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <Card className="overflow-hidden border-border/50 bg-card shadow-lg backdrop-blur-sm">
        {/* Título compacto */}
        <div className="border-b border-border/30 bg-linear-to-r from-primary/5 to-primary/10 px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-xs font-semibold text-foreground sm:text-sm">
              Listado de Empleados
            </h3>
            <Badge
              variant="secondary"
              className="ml-auto h-5 px-1.5 text-[10px] font-medium"
            >
              {totalEmployees} {totalEmployees === 1 ? "empleado" : "empleados"}
            </Badge>
          </div>
        </div>

        {/* Panel de Filtros — Compacto */}
        <div className="border-b border-border/40 bg-linear-to-r from-muted/30 to-muted/10 px-3 py-2 sm:px-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            {/* Segmented Control - Status Filter */}
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
                      layoutId="employee-status-pill"
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

            <div className="flex w-full flex-col gap-1.5 sm:flex-row lg:w-auto lg:justify-end">
              {/* Filtro de departamento */}
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
              >
                <SelectTrigger className="h-8 w-full bg-background/80 text-xs shadow-sm sm:w-40">
                  <Building2 className="mr-1.5 h-3 w-3 text-muted-foreground" />
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

              {/* Buscador Minimalista */}
              <div className="relative w-full sm:w-50">
                <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  className="h-8 bg-background/80 pl-7 pr-2 text-xs shadow-sm transition-shadow focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:shadow-md"
                />
              </div>

              {/* Botón Principal Moderno */}
              <Button
                onClick={onCreate}
                disabled={!departments.length}
                className="h-8 w-full px-3.5 text-xs font-semibold sm:w-auto rounded-lg shadow-md drop-shadow-sm transition-all duration-200 active:scale-[0.97] hover:shadow-lg hover:brightness-110 bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Nuevo Empleado
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Panel de Acciones Masivas */}
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-border bg-emerald-500/5 dark:bg-emerald-500/10"
              >
                <div className="flex flex-col gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedRows.size} seleccionada(s)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkActivate}
                      disabled={isSaving}
                      className="h-6 px-2 border-emerald-200/50 bg-background/50 text-[10px] text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Activar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkDeactivate}
                      disabled={isSaving}
                      className="h-6 px-2 border-amber-200/50 bg-background/50 text-[10px] text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:text-amber-400"
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Desactivar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkDelete}
                      disabled={isSaving}
                      className="h-6 px-2 border-rose-200/50 bg-background/50 text-[10px] text-rose-700 hover:bg-rose-100 dark:border-rose-800/50 dark:text-rose-400"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Eliminar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearSelection}
                      className="h-6 px-2 text-[10px]"
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
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="mb-2 h-5 w-5 animate-spin text-primary/60" />
              <p className="text-[11px] font-medium tracking-wide">
                Cargando registros...
              </p>
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center border-b border-border bg-muted/5 text-center px-4">
              <div className="mb-2 rounded-full bg-muted/30 p-2.5 ring-1 ring-border">
                <Users className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No hay empleados
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground max-w-55">
                Ajusta los filtros o crea un nuevo empleado.
              </p>
            </div>
          ) : (
            <>
              {/* Controles Mobile Selección */}
              <div className="flex items-center justify-between border-b border-border bg-muted/10 px-3 py-1.5 md:hidden">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Sel: {selectedInPageCount}/{paginatedEmployees.length}
                </span>
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                  Seleccionar página
                  <Checkbox
                    checked={allSelectedInPage}
                    onCheckedChange={onToggleSelectAll}
                    className="h-3.5 w-3.5 rounded-[3px]"
                  />
                </label>
              </div>

              {/* TABLA ESCRITORIO — Dense */}
              <div className="hidden w-full overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-border/50 bg-linear-to-r from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30">
                      <TableHead className="w-8 pl-3 pr-1">
                        <Checkbox
                          checked={allSelectedInPage}
                          onCheckedChange={onToggleSelectAll}
                          className="h-3.5 w-3.5 rounded-[3px] border-muted-foreground/40 data-[state=checked]:border-primary"
                        />
                      </TableHead>
                      <TableHead className="h-8 px-2">
                        <button
                          onClick={() => onSort("name")}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Empleado
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-8 px-2">
                        <button
                          onClick={() => onSort("cedula")}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cédula
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-8 px-2">
                        <button
                          onClick={() => onSort("hireDate")}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Ingreso
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-8 px-2">
                        <button
                          onClick={() => onSort("departmentId")}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Depto.
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-8 px-2">
                        <button
                          onClick={() => onSort("status")}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Estado
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        </button>
                      </TableHead>
                      <TableHead className="h-8 w-24 px-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {paginatedEmployees.map((employee, index) => {
                        const isChecked = selectedRows.has(employee.id);

                        return (
                          <motion.tr
                            key={employee.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.15,
                              delay: index * 0.015,
                            }}
                            className={cn(
                              "group border-b-border/40 transition-all hover:bg-muted/50",
                              isChecked && "bg-primary/8 hover:bg-primary/12",
                            )}
                          >
                            <TableCell className="w-8 pl-3 pr-1 py-1.5">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  onToggleSelectRow(employee.id)
                                }
                                className="h-3.5 w-3.5 rounded-[3px] border-muted-foreground/40 data-[state=checked]:border-primary"
                              />
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7 rounded-md border border-border/50 bg-linear-to-br from-background to-muted/20 shadow-sm">
                                  <AvatarFallback className="rounded-md bg-transparent text-[10px] font-semibold text-muted-foreground">
                                    {getInitials(employee.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col leading-none">
                                  <span className="text-xs font-semibold text-foreground">
                                    {employee.name}
                                  </span>
                                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                                    {employee.personType}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1.5 font-mono text-[11px] font-medium text-muted-foreground">
                              {employee.cedula}
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-3 w-3 shrink-0 opacity-50" />
                                <span className="text-[11px] font-medium">
                                  {formatDate(employee.hireDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border-border/60"
                              >
                                {employee.department?.name ??
                                  `Dpto #${employee.departmentId}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    employee.status
                                      ? "bg-emerald-500 ring-1 ring-emerald-500/20"
                                      : "bg-amber-500 ring-1 ring-amber-500/20",
                                  )}
                                />
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {employee.status ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="w-24 px-2 py-1.5 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => onView(employee)}
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
                                      onClick={() => onEdit(employee)}
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
                                      onClick={() => onDelete(employee)}
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
                                    className="w-40"
                                  >
                                    <DropdownMenuItem className="text-[11px]">
                                      <FileText className="mr-2 h-3.5 w-3.5 opacity-70" />
                                      Ver contrato
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-[11px]">
                                      <Printer className="mr-2 h-3.5 w-3.5 opacity-70" />
                                      Imprimir ficha
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-[11px]">
                                      <Download className="mr-2 h-3.5 w-3.5 opacity-70" />
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

              {/* LISTA MÓVIL — Cards compactas */}
              <div className="flex flex-col gap-px bg-border/30 md:hidden">
                <AnimatePresence>
                  {paginatedEmployees.map((employee, index) => {
                    const isChecked = selectedRows.has(employee.id);

                    return (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.015 }}
                        className={cn(
                          "bg-card px-3 py-2.5 transition-all active:bg-muted/40",
                          isChecked &&
                            "bg-primary/8 border-l-2 border-l-primary",
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() =>
                              onToggleSelectRow(employee.id)
                            }
                            className="h-4 w-4 rounded-[3px] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {employee.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {employee.personType} · {employee.cedula}
                                </p>
                              </div>

                              {/* Acciones con touch target adecuado */}
                              <div className="flex items-center -mr-1.5 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onView(employee)}
                                  className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onEdit(employee)}
                                  className="h-8 w-8 text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onDelete(employee)}
                                  disabled={isSaving}
                                  className="h-8 w-8 text-muted-foreground hover:bg-rose-100 hover:text-rose-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground bg-background border-border/60"
                              >
                                {employee.department?.name ??
                                  `Dpto #${employee.departmentId}`}
                              </Badge>
                              <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                <div
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    employee.status
                                      ? "bg-emerald-500 ring-1 ring-emerald-500/20"
                                      : "bg-amber-500 ring-1 ring-amber-500/20",
                                  )}
                                />
                                {employee.status ? "Activo" : "Inactivo"}
                              </div>
                              <span className="text-[10px] text-muted-foreground/70">
                                · {formatDate(employee.hireDate)}
                              </span>
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

          {/* Paginación Compacta */}
          {!isLoading && totalEmployees > 0 && (
            <div className="flex flex-col gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <p className="text-[10px] font-medium text-muted-foreground text-center sm:text-left">
                <span className="text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                {" - "}
                <span className="text-foreground">
                  {Math.min(currentPage * itemsPerPage, totalEmployees)}
                </span>
                {" de "}
                <span className="text-foreground">{totalEmployees}</span>
              </p>

              <div className="flex items-center justify-center gap-0.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-background shadow-sm"
                  onClick={onPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>

                <div className="flex items-center gap-0.5 px-0.5">
                  {pageNumbers.map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-6 min-w-6 px-1.5 text-[10px]",
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
                  className="h-6 w-6 bg-background shadow-sm"
                  onClick={onNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
