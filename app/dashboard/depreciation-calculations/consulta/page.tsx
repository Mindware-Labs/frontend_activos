"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown } from "lucide-react";
import Link from "next/link";
import { sileo } from "sileo";

import { Button } from "@/components/ui/button";
import { KpiCards } from "./components/kpi-cards";
import { ProjectionChart } from "./components/projection-chart";
import { QueryFilters } from "./components/query-filters";
import { ResultsTable } from "./components/results-table";
import type {
  AssetType,
  ConsultaFilters,
  DepreciationRecord,
} from "./components/types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

async function apiRequest<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

const EMPTY_FILTERS: ConsultaFilters = {
  assetIdFrom: "",
  assetIdTo: "",
  dateFrom: "",
  dateTo: "",
  assetTypeId: "all",
};

export default function ConsultaDepreciacionPage() {
  const [allRecords, setAllRecords] = useState<DepreciationRecord[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ConsultaFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ConsultaFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [depResponse, typesResponse] = await Promise.all([
        apiRequest<
          DepreciationRecord[] | PaginatedResponse<DepreciationRecord>
        >("/depreciation-calculations"),
        apiRequest<AssetType[] | PaginatedResponse<AssetType>>("/asset-types"),
      ]);

      const depData = Array.isArray(depResponse)
        ? depResponse
        : ((depResponse as PaginatedResponse<DepreciationRecord>)?.data ?? []);
      const typesData = Array.isArray(typesResponse)
        ? typesResponse
        : ((typesResponse as PaginatedResponse<AssetType>)?.data ?? []);

      setAllRecords(depData);
      setAssetTypes(typesData);
    } catch (error) {
      sileo.error({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      // Asset ID range
      if (appliedFilters.assetIdFrom) {
        const from = parseInt(appliedFilters.assetIdFrom);
        if (!isNaN(from) && r.fixedAssetId < from) return false;
      }
      if (appliedFilters.assetIdTo) {
        const to = parseInt(appliedFilters.assetIdTo);
        if (!isNaN(to) && r.fixedAssetId > to) return false;
      }

      // Date range
      if (appliedFilters.dateFrom) {
        const from = new Date(appliedFilters.dateFrom);
        const processDate = new Date(r.processDate);
        if (processDate < from) return false;
      }
      if (appliedFilters.dateTo) {
        const to = new Date(appliedFilters.dateTo);
        const processDate = new Date(r.processDate);
        if (processDate > to) return false;
      }

      // Asset type
      // La API carga fixedAsset pero no la sub-relación assetType;
      // usamos assetTypeId (columna directa en FixedAsset) para comparar.
      if (
        appliedFilters.assetTypeId &&
        appliedFilters.assetTypeId !== "all" &&
        r.fixedAsset
      ) {
        if (r.fixedAsset.assetTypeId !== parseInt(appliedFilters.assetTypeId)) {
          return false;
        }
      }

      return true;
    });
  }, [allRecords, appliedFilters]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function handleApplyFilters() {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  }

  function handleResetFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }

  return (
    <motion.div
      className="container relative mx-auto min-h-screen max-w-350 bg-white px-3 py-4 sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 shrink-0 rounded-lg text-gray-400 hover:text-gray-600"
        >
          <Link href="/dashboard/depreciation-calculations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <TrendingDown className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
              Consulta de Depreciación Mensual
            </h1>
            <p className="text-[11px] text-gray-400">
              Dashboard analítico y operativo
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Row 1: KPIs */}
        <KpiCards records={allRecords} />

        {/* Row 2: Chart */}
        <ProjectionChart records={allRecords} />

        {/* Row 3: Filters */}
        <QueryFilters
          filters={filters}
          assetTypes={assetTypes}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* Row 4: Table */}
        <ResultsTable
          records={paginatedRecords}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalRecords={filteredRecords.length}
          onPreviousPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          onPageChange={setCurrentPage}
        />
      </div>
    </motion.div>
  );
}
