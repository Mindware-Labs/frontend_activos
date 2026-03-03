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
import { FixedAssetFormSheet } from "./components/fixed-asset-form-sheet";
import { FixedAssetsManagementCard } from "./components/fixed-assets-management-card";
import { FixedAssetDetailDialog } from "./components/fixed-asset-detail-dialog";
import { FixedAssetsHeader } from "./components/fixed-assets-header";
import { FixedAssetsStats } from "./components/fixed-assets-stats";
import { FixedAssetsAlert } from "./components/fixed-assets-alert";
import type {
  Department,
  AssetType,
  FixedAsset,
  FixedAssetFormState,
  FixedAssetStatusFilter,
  SortDirection,
  SortableFixedAssetKey,
  FixedAssetStats,
  SetFixedAssetFormField,
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

const EMPTY_FORM: FixedAssetFormState = {
  name: "",
  description: "",
  registrationDate: "",
  purchaseValue: "",
  residualValue: "",
  usefulLifeMonths: "",
  status: true,
  departmentId: "",
  assetTypeId: "",
};

function normalizeDateForInput(value: string) {
  return value ? value.slice(0, 10) : "";
}

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

export default function FixedAssetsPage() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [form, setForm] = useState<FixedAssetFormState>(EMPTY_FORM);
  const [viewingAsset, setViewingAsset] = useState<FixedAsset | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<FixedAssetStatusFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFixedAssetKey;
    direction: SortDirection;
  } | null>(null);

  const [stats, setStats] = useState<FixedAssetStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalPurchaseValue: 0,
    totalResidualValue: 0,
    totalAccumulatedDepreciation: 0,
  });

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [assetsRes, deptsRes, typesRes] = await Promise.all([
        apiRequest<PaginatedResponse<FixedAsset>>("/fixed-assets"),
        apiRequest<PaginatedResponse<Department>>("/departments?take=100"),
        apiRequest<PaginatedResponse<AssetType>>("/asset-types?take=100"),
      ]);

      setAssets(assetsRes.data);
      setDepartments(deptsRes.data);
      setAssetTypes(typesRes.data);

      const total = assetsRes.total;
      const active = assetsRes.data.filter((a) => a.status).length;
      const inactive = total - active;
      const totalPurchaseValue = assetsRes.data.reduce((sum, a) => sum + a.purchaseValue, 0);
      const totalResidualValue = assetsRes.data.reduce((sum, a) => sum + a.residualValue, 0);
      const totalAccumulatedDepreciation = assetsRes.data.reduce(
        (sum, a) => sum + a.accumulatedDepreciation,
        0,
      );

      setStats({
        total,
        active,
        inactive,
        totalPurchaseValue,
        totalResidualValue,
        totalAccumulatedDepreciation,
      });
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
    asset: FixedAsset,
    key: SortableFixedAssetKey,
  ): string | number {
    switch (key) {
      case "name":
        return asset.name.toLowerCase();
      case "registrationDate":
        return Date.parse(asset.registrationDate) || 0;
      case "purchaseValue":
        return asset.purchaseValue;
      case "departmentId":
        return asset.departmentId;
      case "assetTypeId":
        return asset.assetTypeId;
      case "status":
        return asset.status ? 1 : 0;
      default:
        return "";
    }
  }

  const filteredAndSortedAssets = useMemo(() => {
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? asset.status
          : !asset.status;

      const matchesDept =
        departmentFilter === "all"
          ? true
          : asset.departmentId === Number(departmentFilter);

      const matchesType =
        assetTypeFilter === "all"
          ? true
          : asset.assetTypeId === Number(assetTypeFilter);

      return matchesSearch && matchesStatus && matchesDept && matchesType;
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
  }, [assets, searchQuery, statusFilter, departmentFilter, assetTypeFilter, sortConfig]);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAssets.slice(start, start + itemsPerPage);
  }, [filteredAndSortedAssets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedAssets.length / itemsPerPage,
  );

  function setFormField<K extends keyof FixedAssetFormState>(
    field: K,
    value: FixedAssetFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateSheet() {
    setEditingAsset(null);
    setForm({
      ...EMPTY_FORM,
      departmentId: departments[0] ? String(departments[0].id) : "",
      assetTypeId: assetTypes[0] ? String(assetTypes[0].id) : "",
    });
    setIsSheetOpen(true);
  }

  function openEditSheet(asset: FixedAsset) {
    setEditingAsset(asset);
    setForm({
      name: asset.name,
      description: asset.description,
      registrationDate: normalizeDateForInput(asset.registrationDate),
      purchaseValue: String(asset.purchaseValue),
      residualValue: String(asset.residualValue),
      usefulLifeMonths: asset.usefulLifeMonths ? String(asset.usefulLifeMonths) : "",
      status: asset.status,
      departmentId: String(asset.departmentId),
      assetTypeId: String(asset.assetTypeId),
    });
    setIsSheetOpen(true);
  }

  function openViewDialog(asset: FixedAsset) {
    setViewingAsset(asset);
    setIsDetailDialogOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setIsSheetOpen(open);
    if (!open) {
      setEditingAsset(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const deptId = Number(form.departmentId);
    const typeId = Number(form.assetTypeId);
    const name = form.name.trim();
    const desc = form.description.trim();

    if (
      !name ||
      !form.registrationDate ||
      !deptId ||
      !typeId ||
      !form.purchaseValue ||
      !form.residualValue
    ) {
      sileo.warning({
        title: "Campos incompletos",
        description: "Completa todos los campos requeridos.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        name,
        description: desc,
        registrationDate: form.registrationDate,
        purchaseValue: Number(form.purchaseValue),
        residualValue: Number(form.residualValue),
        usefulLifeMonths: form.usefulLifeMonths ? Number(form.usefulLifeMonths) : null,
        departmentId: deptId,
        assetTypeId: typeId,
      };

      if (editingAsset) payload.status = form.status;

      if (editingAsset) {
        await apiRequest<FixedAsset>(`/fixed-assets/${editingAsset.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        sileo.success({
          title: "Activo actualizado",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        await apiRequest<FixedAsset>("/fixed-assets", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        sileo.success({
          title: "Activo creado",
          description: "El activo fue registrado correctamente.",
        });
      }

      await loadData(true);
      setIsSheetOpen(false);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(asset: FixedAsset) {
    const confirmed = window.confirm(`Eliminar activo ${asset.name}?`);
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await apiRequest(`/fixed-assets/${asset.id}`, { method: "DELETE" });
      sileo.success({
        title: "Activo eliminado",
        description: `${asset.name} fue eliminado correctamente.`,
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
        title: "Selecciona activos",
        description: "Debes seleccionar al menos uno.",
      });
      return;
    }

    const confirmed = window.confirm(
      `${status ? "Activar" : "Desactivar"} ${selectedRows.size} activo(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/fixed-assets/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          }),
        ),
      );
      sileo.success({
        title: "Estado actualizado",
        description: `${selectedRows.size} activo(s) ${status ? "activados" : "desactivados"}.`,
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
        title: "Selecciona activos",
        description: "Debes seleccionar al menos uno.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Eliminar permanentemente ${selectedRows.size} activo(s)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/fixed-assets/${id}`, { method: "DELETE" }),
        ),
      );
      sileo.success({
        title: "Activos eliminados",
        description: `${selectedRows.size} activo(s) eliminados correctamente.`,
      });
      setSelectedRows(new Set());
      await loadData(true);
    } catch (error) {
      sileo.error({ title: "Error", description: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSort(key: SortableFixedAssetKey) {
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
    if (selectedRows.size === paginatedAssets.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedAssets.map((a) => a.id)));
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
      <motion.div className="container relative mx-auto max-w-350 bg-linear-to-br from-emerald-50/60 via-white to-green-50/60 px-3 py-4 sm:px-4 sm:py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <FixedAssetsHeader
          isRefreshing={isLoading}
          canCreate={Boolean(departments.length && assetTypes.length)}
          onRefresh={() => void loadData(true)}
          onCreate={openCreateSheet}
        />

        <FixedAssetsStats stats={stats} />

        <FixedAssetsAlert show={assets.length === 0 && !isLoading} />

        <FixedAssetsManagementCard
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(1);
          }}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={(v) => {
            setDepartmentFilter(v);
            setCurrentPage(1);
          }}
          assetTypeFilter={assetTypeFilter}
          onAssetTypeFilterChange={(v) => {
            setAssetTypeFilter(v);
            setCurrentPage(1);
          }}
          departments={departments}
          assetTypes={assetTypes}
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
          paginatedAssets={paginatedAssets}
          isLoading={isLoading}
          onCreate={openCreateSheet}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          onEdit={openEditSheet}
          onView={openViewDialog}
          onDelete={(a) => void handleDelete(a)}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalAssets={filteredAndSortedAssets.length}
          onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPageChange={setCurrentPage}
        />

        <FixedAssetFormSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          editingAsset={editingAsset}
          form={form}
          departments={departments}
          assetTypes={assetTypes}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFormFieldChange={setFormField}
          onCancel={() => setIsSheetOpen(false)}
        />

        <FixedAssetDetailDialog
          asset={viewingAsset}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}
