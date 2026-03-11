"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { sileo } from "sileo";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DepartmentsManagementCard } from "./components/departments-management-card";
import { DepartmentFormSheet } from "./components/department-form-sheet";
import { DepartmentDetailDialog } from "./components/department-detail-dialog";
import { DepartmentsAlert } from "./components/departments-alert";
import type {
  Department,
  DepartmentFormState,
  DepartmentStatusFilter,
  SortDirection,
  SortableDepartmentKey,
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

const EMPTY_FORM: DepartmentFormState = {
  name: "",
  description: "",
  status: true,
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la operación.";
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [form, setForm] = useState<DepartmentFormState>(EMPTY_FORM);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] =
    useState<DepartmentStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableDepartmentKey;
    direction: SortDirection;
  } | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res =
        await apiRequest<PaginatedResponse<Department>>("/departments");
      setDepartments(res.data);
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
    department: Department,
    key: SortableDepartmentKey,
  ): string | number {
    switch (key) {
      case "name":
        return department.name.toLowerCase();
      case "description":
        return department.description?.toLowerCase() ?? "";
      case "status":
        return department.status ? 1 : 0;
      default:
        return "";
    }
  }

  const filteredAndSortedDepartments = useMemo(() => {
    const filtered = departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? dept.status
            : !dept.status;

      return matchesSearch && matchesStatus;
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
  }, [departments, searchQuery, statusFilter, sortConfig]);

  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDepartments.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDepartments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedDepartments.length / itemsPerPage,
  );

  function setFormField<K extends keyof DepartmentFormState>(
    field: K,
    value: DepartmentFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateSheet() {
    setEditingDepartment(null);
    setForm({ ...EMPTY_FORM });
    setIsSheetOpen(true);
  }

  function openEditSheet(department: Department) {
    setEditingDepartment(department);
    setForm({
      name: department.name,
      description: department.description || "",
      status: department.status,
    });
    setIsSheetOpen(true);
  }

  function openViewDialog(department: Department) {
    setViewingDepartment(department);
    setIsDetailDialogOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setIsSheetOpen(open);
    if (!open) {
      setEditingDepartment(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      const url = editingDepartment
        ? `/departments/${editingDepartment.id}`
        : "/departments";
      const method = editingDepartment ? "PATCH" : "POST";
      if (editingDepartment) payload.status = form.status;

      const res = await apiRequest<Department>(url, {
        method,
        body: JSON.stringify(payload),
      });

      sileo.success({
        title: editingDepartment
          ? "Departamento actualizado"
          : "Departamento creado",
        description: editingDepartment
          ? "Los cambios se guardaron correctamente."
          : "El departamento fue registrado correctamente.",
      });

      await loadData(true);
      setIsSheetOpen(false);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(department: Department) {
    const confirmed = window.confirm(
      `Eliminar departamento ${department.name}?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await apiRequest(`/departments/${department.id}`, {
        method: "DELETE",
      });
      sileo.success({
        title: "Departamento eliminado",
        description: `${department.name} fue desactivado correctamente.`,
      });
      await loadData(true);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkStatusChange(status: boolean) {
    if (selectedRows.size === 0) {
      sileo.warning({
        title: "Selecciona departamentos",
        description: "Debes seleccionar al menos uno.",
      });
      return;
    }

    const confirmed = window.confirm(
      `${status ? "Activar" : "Desactivar"} ${selectedRows.size} departamento(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/departments/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }),
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${selectedRows.size} departamento(s) ${status ? "activados" : "desactivados"}.`,
      });
      setSelectedRows(new Set());
      await loadData(true);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedRows.size === 0) {
      sileo.warning({
        title: "Selecciona departamentos",
        description: "Debes seleccionar al menos uno.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Eliminar permanentemente ${selectedRows.size} departamento(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/departments/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      sileo.success({
        title: "Departamentos eliminados",
        description: `${selectedRows.size} departamento(s) eliminados correctamente.`,
      });
      setSelectedRows(new Set());
      await loadData(true);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSort(key: SortableDepartmentKey) {
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
    if (selectedRows.size === paginatedDepartments.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedDepartments.map((d) => d.id)));
    }
  }

  function toggleSelectRow(id: number) {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  }

  return (
    <TooltipProvider>
      <motion.div
        className="container relative mx-auto max-w-350 bg-linear-to-br from-emerald-50/60 via-white to-green-50/60 p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DepartmentsAlert show={departments.length === 0 && !isLoading} />

        <DepartmentsManagementCard
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={(v) => {
            setSearchQuery(v);
            setCurrentPage(1);
          }}
          selectedRows={selectedRows}
          isSaving={isSaving}
          onBulkActivate={() => void handleBulkStatusChange(true)}
          onBulkDeactivate={() => void handleBulkStatusChange(false)}
          onBulkDelete={() => void handleBulkDelete()}
          onClearSelection={() => setSelectedRows(new Set())}
          paginatedDepartments={paginatedDepartments}
          isLoading={isLoading}
          onCreate={openCreateSheet}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          onEdit={openEditSheet}
          onView={openViewDialog}
          onDelete={(dept) => void handleDelete(dept)}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalDepartments={filteredAndSortedDepartments.length}
          onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={setCurrentPage}
        />

        <DepartmentFormSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          editingDepartment={editingDepartment}
          form={form}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFormFieldChange={setFormField}
          onCancel={() => setIsSheetOpen(false)}
        />

        <DepartmentDetailDialog
          department={viewingDepartment}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}
