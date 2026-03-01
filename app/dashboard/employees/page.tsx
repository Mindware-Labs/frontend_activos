"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { sileo } from "sileo";

import { TooltipProvider } from "@/components/ui/tooltip";
import { EmployeeFormSheet } from "./components/employee-form-sheet";
import { EmployeesManagementCard } from "./components/employees-management-card";
import { EmployeeDetailDialog } from "./components/employee-detail-dialog";
import type {
  Department,
  Employee,
  EmployeeFormState,
  EmployeeStatusFilter,
  SortDirection,
  SortableEmployeeKey,
} from "./components/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

const EMPTY_FORM: EmployeeFormState = {
  name: "",
  cedula: "",
  personType: "Fisica",
  hireDate: "",
  departmentId: "",
  status: true,
};

function normalizeDateForInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operacion.";
}

async function parseApiError(response: Response) {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  if (!payload) {
    return `Error ${response.status}: ${response.statusText || "Solicitud fallida"}`;
  }

  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_FORM);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<EmployeeStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableEmployeeKey;
    direction: SortDirection;
  } | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [employeesResponse, departmentsResponse] = await Promise.all([
        apiRequest<PaginatedResponse<Employee>>("/employees"),
        apiRequest<PaginatedResponse<Department>>("/departments?take=100"),
      ]);

      setEmployees(employeesResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function getSortableValue(
    employee: Employee,
    key: SortableEmployeeKey,
  ): string | number {
    switch (key) {
      case "name":
        return employee.name.toLowerCase();
      case "cedula":
        return employee.cedula;
      case "personType":
        return employee.personType;
      case "hireDate":
        return Date.parse(employee.hireDate) || 0;
      case "departmentId":
        return employee.departmentId;
      case "status":
        return employee.status ? 1 : 0;
      default:
        return "";
    }
  }

  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.cedula.includes(searchQuery);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? employee.status
            : !employee.status;

      const matchesDepartment =
        departmentFilter === "all"
          ? true
          : employee.departmentId === Number(departmentFilter);

      return matchesSearch && matchesStatus && matchesDepartment;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = getSortableValue(a, sortConfig.key);
        const bValue = getSortableValue(b, sortConfig.key);

        if (typeof aValue === "number" && typeof bValue === "number") {
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        const comparison = String(aValue).localeCompare(String(bValue), "es", {
          numeric: true,
          sensitivity: "base",
        });

        if (comparison < 0) return sortConfig.direction === "asc" ? -1 : 1;
        if (comparison > 0) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [employees, searchQuery, statusFilter, departmentFilter, sortConfig]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedEmployees.length / itemsPerPage,
  );

  function setFormField<K extends keyof EmployeeFormState>(
    field: K,
    value: EmployeeFormState[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function openCreateSheet() {
    setEditingEmployee(null);
    setForm({
      ...EMPTY_FORM,
      departmentId: departments[0] ? String(departments[0].id) : "",
    });
    setIsSheetOpen(true);
  }

  function openEditSheet(employee: Employee) {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      cedula: employee.cedula,
      personType: employee.personType,
      hireDate: normalizeDateForInput(employee.hireDate),
      departmentId: String(
        employee.departmentId ?? employee.department?.id ?? "",
      ),
      status: employee.status,
    });
    setIsSheetOpen(true);
  }

  function openViewDialog(employee: Employee) {
    setViewingEmployee(employee);
    setIsDetailDialogOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setIsSheetOpen(open);
    if (!open) {
      setEditingEmployee(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const departmentId = Number(form.departmentId);
    const name = form.name.trim();
    const cedula = form.cedula.trim();

    if (!name || !cedula || !form.hireDate || !departmentId) {
      sileo.warning({
        title: "Campos incompletos",
        description: "Completa todos los campos requeridos.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name,
        cedula,
        personType: form.personType,
        hireDate: form.hireDate,
        departmentId,
      };

      if (editingEmployee) {
        await apiRequest<Employee>(`/employees/${editingEmployee.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, status: form.status }),
        });
        sileo.success({
          title: "Empleado actualizado",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        await apiRequest<Employee>("/employees", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        sileo.success({
          title: "Empleado creado",
          description: "El empleado fue registrado correctamente.",
        });
      }

      await loadData(true);
      setIsSheetOpen(false);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(employee: Employee) {
    const confirmed = window.confirm(`Eliminar empleado ${employee.name}?`);
    if (!confirmed) return;

    setIsSaving(true);

    try {
      await apiRequest<{ message: string }>(`/employees/${employee.id}`, {
        method: "DELETE",
      });
      sileo.success({
        title: "Empleado eliminado",
        description: `${employee.name} fue eliminado correctamente.`,
      });
      await loadData(true);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkStatusChange(status: boolean) {
    if (selectedRows.size === 0) {
      sileo.warning({
        title: "Selecciona empleados",
        description: "Debes seleccionar al menos un empleado.",
      });
      return;
    }

    const confirmed = window.confirm(
      `${status ? "Activar" : "Desactivar"} ${selectedRows.size} empleado(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/employees/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }),
        ),
      );

      sileo.success({
        title: "Estado actualizado",
        description: `${selectedRows.size} empleado(s) ${status ? "activados" : "desactivados"}.`,
      });

      setSelectedRows(new Set());
      await loadData(true);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedRows.size === 0) {
      sileo.warning({
        title: "Selecciona empleados",
        description: "Debes seleccionar al menos un empleado.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Eliminar permanentemente ${selectedRows.size} empleado(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/employees/${id}`, {
            method: "DELETE",
          }),
        ),
      );

      sileo.success({
        title: "Empleados eliminados",
        description: `${selectedRows.size} empleado(s) eliminados correctamente.`,
      });

      setSelectedRows(new Set());
      await loadData(true);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSort(key: SortableEmployeeKey) {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  }

  function toggleSelectAll() {
    if (selectedRows.size === paginatedEmployees.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(paginatedEmployees.map((employee) => employee.id)),
      );
    }
  }

  function toggleSelectRow(id: number) {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  }

  return (
    <TooltipProvider>
      <motion.div
        className="container relative mx-auto max-w-[1400px] bg-gradient-to-br from-emerald-50/60 via-white to-green-50/60 px-3 py-4 sm:px-4 sm:py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <EmployeesManagementCard
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={(value) => {
            setDepartmentFilter(value);
            setCurrentPage(1);
          }}
          departments={departments}
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          selectedRows={selectedRows}
          isSaving={isSaving}
          onBulkActivate={() => void handleBulkStatusChange(true)}
          onBulkDeactivate={() => void handleBulkStatusChange(false)}
          onBulkDelete={() => void handleBulkDelete()}
          onClearSelection={() => setSelectedRows(new Set())}
          paginatedEmployees={paginatedEmployees}
          isLoading={isLoading}
          onCreate={openCreateSheet}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          onEdit={openEditSheet}
          onView={openViewDialog}
          onDelete={(employee) => void handleDelete(employee)}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalEmployees={filteredAndSortedEmployees.length}
          onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNextPage={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          onPageChange={setCurrentPage}
        />

        <EmployeeFormSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          editingEmployee={editingEmployee}
          form={form}
          departments={departments}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFormFieldChange={setFormField}
          onCancel={() => setIsSheetOpen(false)}
        />

        <EmployeeDetailDialog
          employee={viewingEmployee}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}
