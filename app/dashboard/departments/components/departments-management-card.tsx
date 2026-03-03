"use client";

import {
  Building2,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { fadeInUp } from "./animations";
import type {
  Department,
  DepartmentStatusFilter,
  SortableDepartmentKey,
} from "./types";

// reuse helper functions from employees version with minor adapt
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

type DepartmentsManagementCardProps = {
  statusFilter: DepartmentStatusFilter;
  onStatusFilterChange: (value: DepartmentStatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedRows: Set<number>;
  isSaving: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  paginatedDepartments: Department[];
  isLoading: boolean;
  onCreate: () => void;
  onSort: (key: SortableDepartmentKey) => void;
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onEdit: (department: Department) => void;
  onView: (department: Department) => void;
  onDelete: (department: Department) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalDepartments: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

export function DepartmentsManagementCard({
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
  paginatedDepartments,
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
  totalDepartments,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: DepartmentsManagementCardProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const selectedInPageCount = paginatedDepartments.filter((depart) =>
    selectedRows.has(depart.id),
  ).length;
  const allSelectedInPage =
    paginatedDepartments.length > 0 &&
    selectedInPageCount === paginatedDepartments.length;

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate">
      <Card className="overflow-hidden border-border/50 bg-card shadow-lg backdrop-blur-sm">
        <div className="border-b border-border/30 bg-linear-to-r from-primary/5 to-primary/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              Listado de Departamentos
            </h3>
            <Badge variant="secondary" className="ml-auto text-xs font-medium">
              {totalDepartments} {totalDepartments === 1 ? "departamento" : "departamentos"}
            </Badge>
          </div>
        </div>

        <CardHeader className="border-b border-border/40 bg-linear-to-r from-muted/30 to-muted/10 px-4 pt-2 pb-1 sm:px-6 sm:pt-3 sm:pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items:center lg:justify-between">
            <Tabs
              value={statusFilter}
              onValueChange={(value) =>
                onStatusFilterChange(value as DepartmentStatusFilter)
              }
              className="w-full lg:w-auto shrink-0"
            >
              <TabsList className="grid h-9 w-full grid-cols-3 bg-background/60 p-1 lg:w-auto border shadow-sm">
                <TabsTrigger className="text-xs" value="all">
                  Todos
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="active">
                  Activos
                </TabsTrigger>
                <TabsTrigger className="text-xs" value="inactive">
                  Inactivos
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative flex-1">
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="h-9 w-full pl-10 text-sm"
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

              <Button size="sm" onClick={onCreate} disabled={isSaving}>
                <Plus className="mr-1 h-4 w-4" />
                Nuevo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Bulk actions bar */}
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
                      className="h-8 border-emerald-200/50 bg-background/50 text-[11px] text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Activar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBulkDeactivate}
                      disabled={isSaving}
                      className="h-8 border-amber-200/50 bg-background/50 text-[11px] text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-900/50"
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

          {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-5">
                <Checkbox
                  checked={allSelectedInPage}
                  onCheckedChange={onToggleSelectAll}
                  disabled={paginatedDepartments.length === 0}
                />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDepartments.map((department) => {
              const isSelected = selectedRows.has(department.id);
              return (
                <TableRow key={department.id} className={isSelected ? "bg-muted/20" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelectRow(department.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {department.name}
                  </TableCell>
                  <TableCell>
                    {department.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={department.status ? "default" : "secondary"}>
                      {department.status ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon-xs" variant="ghost" onClick={() => onView(department)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" onClick={() => onEdit(department)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon-xs" variant="ghost" onClick={() => onDelete(department)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        </CardContent>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4">
          <div>
            <Button size="sm" variant="outline" onClick={onPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((num) => (
              <Button
                key={num}
                size="sm"
                variant={num === currentPage ? "default" : "outline"}
                onClick={() => onPageChange(num)}
              >
                {num}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={onNextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} ({totalDepartments} registros)
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
