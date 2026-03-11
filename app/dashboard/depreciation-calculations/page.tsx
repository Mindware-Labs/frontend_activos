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
import { DepreciationFormSheet } from "./components/depreciation-form-sheet";
import { DepreciationsManagementCard } from "./components/depreciations-management-card";
import { DepreciationDetailDialog } from "./components/depreciation-detail-dialog";
import type {
  FixedAsset,
  DepreciationCalculation,
  DepreciationFormState,
  SortDirection,
  SortableDepreciationKey,
  DepreciationFormErrors,
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

const EMPTY_FORM: DepreciationFormState = {
  processYear: new Date().getFullYear().toString(),
  processMonth: (new Date().getMonth() + 1).toString(),
  processDate: new Date().toISOString().split("T")[0],
  amountDepreciation: "",
  accumulatedDepreciation: "",
  purchaseAccount: "",
  depreciationAccount: "",
  fixedAssetId: "",
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

export default function DepreciationsPage() {
  const [depreciations, setDepreciations] = useState<DepreciationCalculation[]>(
    [],
  );
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<DepreciationFormState>(EMPTY_FORM);
  const [editingDepreciation, setEditingDepreciation] =
    useState<DepreciationCalculation | null>(null);
  const [viewingDepreciation, setViewingDepreciation] =
    useState<DepreciationCalculation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: SortableDepreciationKey;
    direction: SortDirection;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [errors, setErrors] = useState<DepreciationFormErrors>({});

  const loadData = useCallback(async (showNotification = false) => {
    setIsLoading(true);
    try {
      const [depreciationsResponse, assetsResponse] = await Promise.all([
        apiRequest<
          DepreciationCalculation[] | PaginatedResponse<DepreciationCalculation>
        >("/depreciation-calculations"),
        apiRequest<FixedAsset[] | PaginatedResponse<FixedAsset>>(
          "/fixed-assets",
        ),
      ]);

      const depreciationsData = Array.isArray(depreciationsResponse)
        ? depreciationsResponse
        : (depreciationsResponse as PaginatedResponse<DepreciationCalculation>)
            ?.data || [];

      const assetsData = Array.isArray(assetsResponse)
        ? assetsResponse
        : (assetsResponse as PaginatedResponse<FixedAsset>)?.data || [];

      setDepreciations(depreciationsData);
      setFixedAssets(assetsData);

      if (showNotification) {
        sileo.success({
          title: "Datos actualizados",
          description: "Se han cargado los últimos cambios.",
        });
      }
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredAndSortedDepreciations = useMemo(() => {
    let filtered = depreciations.filter((dep) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        dep.purchaseAccount.toLowerCase().includes(searchLower) ||
        dep.depreciationAccount.toLowerCase().includes(searchLower) ||
        dep.processYear.toString().includes(searchLower)
      );
    });

    if (sortConfig) {
      const sortKey = sortConfig.key;
      const sortDirection = sortConfig.direction;

      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [depreciations, searchQuery, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedDepreciations.length / itemsPerPage,
  );
  const paginatedDepreciations = filteredAndSortedDepreciations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function setFormField<K extends keyof DepreciationFormState>(
    field: K,
    value: DepreciationFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateSheet() {
    setEditingDepreciation(null);
    setForm(EMPTY_FORM);
    setIsSheetOpen(true);
  }

  function openEditSheet(depreciation: DepreciationCalculation) {
    setEditingDepreciation(depreciation);
    setForm({
      processYear: depreciation.processYear.toString(),
      processMonth: depreciation.processMonth.toString(),
      processDate: normalizeDateForInput(depreciation.processDate),
      amountDepreciation: depreciation.amountDepreciation.toString(),
      accumulatedDepreciation: depreciation.accumulatedDepreciation.toString(),
      purchaseAccount: depreciation.purchaseAccount,
      depreciationAccount: depreciation.depreciationAccount,
      fixedAssetId: depreciation.fixedAssetId.toString(),
    });
    setIsSheetOpen(true);
  }

  function openViewDialog(depreciation: DepreciationCalculation) {
    setViewingDepreciation(depreciation);
    setIsDetailDialogOpen(true);
  }

  function handleSheetOpenChange(open: boolean) {
    setIsSheetOpen(open);
    if (!open) {
      setEditingDepreciation(null);
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }

  const validateForm = () => {
    const newErrors: DepreciationFormErrors = {};
    if (!form.processYear.trim()) newErrors.processYear = "El año del proceso es requerido.";
    if (!form.processMonth) newErrors.processMonth = "El mes del proceso es requerido.";
    if (!form.processDate) newErrors.processDate = "La fecha del proceso es requerida.";
    if (!form.amountDepreciation.trim()) {
      newErrors.amountDepreciation = "El monto de depreciación es requerido.";
    } else if (parseFloat(form.amountDepreciation) <= 0) {
      newErrors.amountDepreciation = "El monto de depreciación debe ser mayor a 0.";
    }
    if (!form.accumulatedDepreciation.trim()) {
      newErrors.accumulatedDepreciation = "La depreciación acumulada es requerida.";
    } else if (parseFloat(form.accumulatedDepreciation) <= 0) {
      newErrors.accumulatedDepreciation = "La depreciación acumulada debe ser mayor a 0.";
    }
    if (!form.purchaseAccount.trim()) newErrors.purchaseAccount = "La cuenta de compra es requerida.";
    if (!form.depreciationAccount.trim()) newErrors.depreciationAccount = "La cuenta de depreciación es requerida.";
    if (!form.fixedAssetId) newErrors.fixedAssetId = "El activo fijo es requerido.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrors({}); // Limpiar errores previos

    if (!validateForm()) {
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        processYear: parseInt(form.processYear),
        processMonth: parseInt(form.processMonth),
        processDate: form.processDate,
        amountDepreciation: parseFloat(form.amountDepreciation),
        accumulatedDepreciation: parseFloat(form.accumulatedDepreciation),
        purchaseAccount: form.purchaseAccount,
        depreciationAccount: form.depreciationAccount,
        fixedAssetId: parseInt(form.fixedAssetId),
      };

      if (editingDepreciation) {
        await apiRequest(
          `/depreciation-calculations/${editingDepreciation.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
        sileo.success({
          title: "Actualizado",
          description: "Depreciación actualizada correctamente.",
        });
      } else {
        await apiRequest("/depreciation-calculations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        sileo.success({
          title: "Creado",
          description: "Depreciación creada correctamente.",
        });
      }

      setIsSheetOpen(false);
      await loadData();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(depreciation: DepreciationCalculation) {
    const confirmed = window.confirm(
      "¿Eliminar permanentemente este cálculo de depreciación?",
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await apiRequest(`/depreciation-calculations/${depreciation.id}`, {
        method: "DELETE",
      });

      sileo.success({
        title: "Eliminado",
        description: "Depreciación eliminada correctamente.",
      });

      await loadData();
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
        title: "Selecciona depreciaciones",
        description: "Debes seleccionar al menos una.",
      });
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar permanentemente ${selectedRows.size} depreciación(es)?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          apiRequest(`/depreciation-calculations/${id}`, {
            method: "DELETE",
          }),
        ),
      );

      sileo.success({
        title: "Eliminadas",
        description: `${selectedRows.size} depreciación(es) eliminadas correctamente.`,
      });

      setSelectedRows(new Set());
      await loadData();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleSort(key: SortableDepreciationKey) {
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
    if (selectedRows.size === paginatedDepreciations.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(
        new Set(paginatedDepreciations.map((depreciation) => depreciation.id)),
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
        className="container relative mx-auto max-w-350 bg-linear-to-br from-emerald-50/60 via-white to-green-50/60 p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <DepreciationsManagementCard
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          selectedRows={selectedRows}
          isSaving={isSaving}
          onBulkDelete={() => void handleBulkDelete()}
          onClearSelection={() => setSelectedRows(new Set())}
          paginatedDepreciations={paginatedDepreciations}
          isLoading={isLoading}
          onCreate={openCreateSheet}
          onSort={handleSort}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
          onEdit={openEditSheet}
          onView={openViewDialog}
          onDelete={(depreciation) => void handleDelete(depreciation)}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalDepreciations={filteredAndSortedDepreciations.length}
          onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNextPage={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          onPageChange={setCurrentPage}
        />

        <DepreciationFormSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          editingDepreciation={editingDepreciation}
          form={form}
          fixedAssets={fixedAssets}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onFormFieldChange={setFormField}
          onCancel={() => setIsSheetOpen(false)}
          errors={errors}
        />

        <DepreciationDetailDialog
          depreciation={viewingDepreciation}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}
