"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DepreciationRecord } from "./types";

type ResultsTableProps = {
  records: DepreciationRecord[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalRecords: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
};

const MONTH_NAMES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDate(date: string) {
  // Parsear manualmente para evitar el offset UTC que correría la fecha un día
  // en zonas horarias negativas (ej. República Dominicana, UTC-4).
  const raw = date.split("T")[0];
  const [year, month, day] = raw.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "RD$ 0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "RD$ 0.00";
  return num.toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 2,
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

export function ResultsTable({
  records,
  isLoading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalRecords,
  onPreviousPage,
  onNextPage,
  onPageChange,
}: ResultsTableProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="overflow-hidden rounded-xl border border-gray-100 bg-white"
    >
      {/* Header */}
      <div className="border-b border-gray-50 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            Resultados de depreciación
          </p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {totalRecords} registros
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex h-52 flex-col items-center justify-center">
          <Loader2 className="mb-2 h-5 w-5 animate-spin text-gray-300" />
          <p className="text-[11px] text-gray-400">Cargando registros...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-medium text-gray-400">Sin resultados</p>
          <p className="mt-1 text-[11px] text-gray-300">
            Ajusta los filtros para obtener datos.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden w-full overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/40">
                  {[
                    "Año",
                    "Mes Proceso",
                    "Activo Fijo",
                    "Fecha Proceso",
                    "Monto Depreciado",
                    "Dep. Acumulada",
                    "Cuenta Compra",
                    "Cuenta Dep.",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.015 }}
                      className="group border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-gray-700">
                        {r.processYear}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">
                        {MONTH_NAMES[r.processMonth] ?? r.processMonth}
                      </td>
                      <td className="max-w-40 truncate px-3 py-1.5 text-xs font-medium text-gray-700">
                        {r.fixedAsset?.name ?? `Activo #${r.fixedAssetId}`}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-500">
                        {formatDate(r.processDate)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs font-medium text-emerald-700">
                        {formatCurrency(r.amountDepreciation)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs text-rose-600">
                        {formatCurrency(r.accumulatedDepreciation)}
                      </td>
                      <td className="max-w-32 truncate px-3 py-1.5 text-xs text-gray-500">
                        {r.purchaseAccount}
                      </td>
                      <td className="max-w-32 truncate px-3 py-1.5 text-xs text-gray-500">
                        {r.depreciationAccount}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-px bg-gray-50 md:hidden">
            <AnimatePresence>
              {records.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {r.fixedAsset?.name ?? `Activo #${r.fixedAssetId}`}
                    </p>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {r.processYear}/{String(r.processMonth).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                    <span className="font-mono font-medium text-emerald-700">
                      {formatCurrency(r.amountDepreciation)}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="font-mono text-rose-500">
                      Acum: {formatCurrency(r.accumulatedDepreciation)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{formatDate(r.processDate)}</span>
                    <span>•</span>
                    <span className="truncate">{r.purchaseAccount}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Pagination */}
      {!isLoading && totalRecords > 0 && (
        <div className="flex flex-col gap-2 border-t border-gray-50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-gray-400">
            <span className="text-gray-600">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            {" – "}
            <span className="text-gray-600">
              {Math.min(currentPage * itemsPerPage, totalRecords)}
            </span>
            {" de "}
            <span className="text-gray-600">{totalRecords}</span>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={currentPage === n ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 min-w-7 px-2 text-[11px]",
                  currentPage === n
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-400 hover:text-gray-600",
                )}
                onClick={() => onPageChange(n)}
              >
                {n}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={onNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
