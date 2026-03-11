"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { sileo } from "sileo";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AssetTypesManagementCard } from "./components/asset-types-management-card";
import { AssetTypeFormSheet } from "./components/asset-type-form-sheet";
import { AssetTypeDetailDialog } from "./components/asset-type-detail-dialog";
import { AssetTypesAlert } from "./components/asset-types-alert";
import type {
  AssetType,
  AssetTypeFormState,
  AssetTypeStatusFilter,
  SortDirection,
  SortableAssetTypeKey,
} from "./components/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

interface ApiErrorPayload {
  message?: string | string[];
  error?: string;
}

const EMPTY_FORM: AssetTypeFormState = {
  name: "",
  description: "",
  purchaseAccount: "",
  depreciationAccount: "",
  status: true,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "No se pudo completar la operación.";
}

async function parseApiError(response: Response): Promise<string> {
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

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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

export default function AssetTypesPage() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingType, setEditingType] = useState<AssetType | null>(null);
  const [form, setForm] = useState<AssetTypeFormState>(EMPTY_FORM);
  const [viewingType, setViewingType] = useState<AssetType | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] =
    useState<AssetTypeStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableAssetTypeKey;
    direction: SortDirection;
  } | null>(null);

  const loadData = useCallback(
    async (showRefreshing = false): Promise<void> => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res =
          await apiRequest<PaginatedResponse<AssetType>>("/asset-types");
        setAssetTypes(res.data);
      } catch (error) {
        sileo.error({
          title: "Error",
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const getSortableValue = useCallback(
    (assetType: AssetType, key: SortableAssetTypeKey): string | number => {
      switch (key) {
        case "name":
          return assetType.name.toLowerCase();
        case "description":
          return (assetType.description || "").toLowerCase();
        case "purchaseAccount":
          return (assetType.purchaseAccount || "").toLowerCase();
        case "depreciationAccount":
          return (assetType.depreciationAccount || "").toLowerCase();
        case "status":
          return assetType.status ? 1 : 0;
        default:
          return 0;
      }
    },
    [],
  );

  const filteredAndSortedAssetTypes = useMemo((): AssetType[] => {
    const filtered = assetTypes.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (t.purchaseAccount || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (t.depreciationAccount || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? t.status
            : !t.status;

      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = getSortableValue(a, sortConfig.key);
        const bValue = getSortableValue(b, sortConfig.key);

        if (typeof aValue === "number" && typeof bValue === "number") {
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        const comparison = String(aValue).localeCompare(String(bValue), "es", {
          numeric: true,
          sensitivity: "base",
        });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [assetTypes, searchQuery, statusFilter, sortConfig, getSortableValue]);

  const paginatedAssetTypes = useMemo((): AssetType[] => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAssetTypes.slice(start, start + itemsPerPage);
  }, [filteredAndSortedAssetTypes, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    (): number => Math.ceil(filteredAndSortedAssetTypes.length / itemsPerPage),
    [filteredAndSortedAssetTypes.length, itemsPerPage],
  );

  const setFormField = useCallback(
    <K extends keyof AssetTypeFormState>(
      field: K,
      value: AssetTypeFormState[K],
    ): void => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const openCreateSheet = useCallback((): void => {
    setEditingType(null);
    setForm({ ...EMPTY_FORM });
    setIsSheetOpen(true);
  }, []);

  const openEditSheet = useCallback((assetType: AssetType): void => {
    setEditingType(assetType);
    setForm({
      name: assetType.name,
      description: assetType.description || "",
      purchaseAccount: assetType.purchaseAccount || "",
      depreciationAccount: assetType.depreciationAccount || "",
      status: assetType.status,
    });
    setIsSheetOpen(true);
  }, []);

  const openViewDialog = useCallback((assetType: AssetType): void => {
    setViewingType(assetType);
    setIsDetailDialogOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean): void => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingType(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();

      if (!form.name.trim()) {
        sileo.warning({
          title: "Campo requerido",
          description: "El nombre del tipo de activo es obligatorio.",
        });
        return;
      }

      setIsSaving(true);

      try {
        const payload = {
          name: form.name.trim(),
          description: form.description?.trim() || null,
          purchaseAccount: form.purchaseAccount?.trim() || null,
          depreciationAccount: form.depreciationAccount?.trim() || null,
          ...(editingType && { status: form.status }),
        };

        if (editingType) {
          await apiRequest<AssetType>(`/asset-types/${editingType.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
          sileo.success({
            title: "Tipo actualizado",
            description: "Los cambios se guardaron correctamente.",
          });
        } else {
          await apiRequest<AssetType>("/asset-types", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          sileo.success({
            title: "Tipo creado",
            description: "El tipo de activo fue registrado correctamente.",
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
    },
    [form, editingType, loadData],
  );

  const handleDelete = useCallback(
    async (assetType: AssetType): Promise<void> => {
      const confirmed = window.confirm(`¿Eliminar tipo ${assetType.name}?`);
      if (!confirmed) return;

      setIsSaving(true);
      try {
        await apiRequest(`/asset-types/${assetType.id}`, {
          method: "DELETE",
        });
        sileo.success({
          title: "Tipo eliminado",
          description: `${assetType.name} fue eliminado correctamente.`,
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
    },
    [loadData],
  );

  const handleBulkStatusChange = useCallback(
    async (status: boolean): Promise<void> => {
      if (selectedRows.size === 0) {
        sileo.warning({
          title: "Selecciona tipos",
          description: "Debes seleccionar al menos uno.",
        });
        return;
      }

      const confirmed = window.confirm(
        `${status ? "Activar" : "Desactivar"} ${selectedRows.size} tipo(s)?`,
      );
      if (!confirmed) return;

      setIsSaving(true);
      try {
        await Promise.all(
          Array.from(selectedRows).map((id) =>
            apiRequest(`/asset-types/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ status }),
            }),
          ),
        );
        sileo.success({
          title: "Estado actualizado",
          description: `${selectedRows.size} tipo(s) ${status ? "activados" : "desactivados"}.`,
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
    },
    [selectedRows, loadData],
  );

  const handleBulkDelete = useCallback(async (): Promise<void> => {
    if (selectedRows.size === 0) {
      sileo.warning({
        title: "Selecciona tipos",
        description: "Debes seleccionar al menos uno.",
      });
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar permanentemente ${selectedRows.size} tipo(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/asset-types/${id}`, {
            method: "DELETE",
          }),
        ),
      );
      sileo.success({
        title: "Tipos eliminados",
        description: `${selectedRows.size} tipo(s) eliminados correctamente.`,
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
  }, [selectedRows, loadData]);

  const handleSort = useCallback((key: SortableAssetTypeKey): void => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  }, []);

  const toggleSelectAll = useCallback((): void => {
    if (selectedRows.size === paginatedAssetTypes.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedAssetTypes.map((t) => t.id)));
    }
  }, [selectedRows.size, paginatedAssetTypes]);

  const toggleSelectRow = useCallback((id: number): void => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  return (
    <TooltipProvider>
      <motion.div
        className="container relative mx-auto max-w-350 bg-linear-to-br from-emerald-50/60 via-white to-green-50/60 p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {assetTypes.length === 0 && !isLoading && (
          <AssetTypesAlert show={true} />
        )}

        <AssetTypesManagementCard
          statusFilter={statusFilter}
          onStatusFilterChange={(v: AssetTypeStatusFilter) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={(v: string) => {
            setSearchQuery(v);
            setCurrentPage(1);
          }}
          selectedRows={selectedRows}
          isSaving={isSaving}
          onBulkActivate={() => void handleBulkStatusChange(true)}
          onBulkDeactivate={() => void handleBulkStatusChange(false)}
          onBulkDelete={() => void handleBulkDelete()}
          onClearSelection={() => setSelectedRows(new Set())}
          paginatedAssetTypes={paginatedAssetTypes}
          isLoading={isLoading}
          onCreate={openCreateSheet}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          onEdit={openEditSheet}
          onView={openViewDialog}
          onDelete={(t: AssetType) => void handleDelete(t)}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalAssetTypes={filteredAndSortedAssetTypes.length}
          onPreviousPage={() =>
            setCurrentPage((p: number) => Math.max(1, p - 1))
          }
          onNextPage={() =>
            setCurrentPage((p: number) => Math.min(totalPages, p + 1))
          }
          onPageChange={(p: number) => setCurrentPage(p)}
        />

        <AssetTypeFormSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          editingType={editingType}
          form={form}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFormFieldChange={setFormField}
          onCancel={() => setIsSheetOpen(false)}
        />

        <AssetTypeDetailDialog
          assetType={viewingType}
          open={isDetailDialogOpen}
          onOpenChange={(open: boolean) => setIsDetailDialogOpen(open)}
        />
      </motion.div>
    </TooltipProvider>
  );
}
