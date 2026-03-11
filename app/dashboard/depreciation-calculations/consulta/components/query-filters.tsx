"use client";

import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetType, ConsultaFilters } from "./types";

type QueryFiltersProps = {
  filters: ConsultaFilters;
  assetTypes: AssetType[];
  onFiltersChange: (filters: ConsultaFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

export function QueryFilters({
  filters,
  assetTypes,
  onFiltersChange,
  onApply,
  onReset,
}: QueryFiltersProps) {
  function setField<K extends keyof ConsultaFilters>(
    key: K,
    value: ConsultaFilters[K],
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl border border-gray-100 bg-white p-4"
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">
        Filtros de consulta
      </p>

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end">
        {/* Rango de Activos */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              Activo desde
            </label>
            <Input
              type="number"
              placeholder="ID Desde"
              value={filters.assetIdFrom}
              onChange={(e) => setField("assetIdFrom", e.target.value)}
              className="h-9 rounded-2xl border-gray-200 bg-gray-50/50 px-4 text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-emerald-400/50"
            />
          </div>
          <span className="mt-5 text-[10px] text-gray-300">—</span>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              Activo hasta
            </label>
            <Input
              type="number"
              placeholder="ID Hasta"
              value={filters.assetIdTo}
              onChange={(e) => setField("assetIdTo", e.target.value)}
              className="h-9 rounded-2xl border-gray-200 bg-gray-50/50 px-4 text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-emerald-400/50"
            />
          </div>
        </div>

        {/* Rango de Fechas */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              Fecha desde
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setField("dateFrom", e.target.value)}
              className="h-9 rounded-2xl border-gray-200 bg-gray-50/50 px-4 text-xs text-gray-600 focus-visible:ring-1 focus-visible:ring-emerald-400/50"
            />
          </div>
          <span className="mt-5 text-[10px] text-gray-300">—</span>
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-medium text-gray-500">
              Fecha hasta
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setField("dateTo", e.target.value)}
              className="h-9 rounded-2xl border-gray-200 bg-gray-50/50 px-4 text-xs text-gray-600 focus-visible:ring-1 focus-visible:ring-emerald-400/50"
            />
          </div>
        </div>

        {/* Tipo de Activo */}
        <div className="flex-1 lg:max-w-48">
          <label className="mb-1 block text-[10px] font-medium text-gray-500">
            Tipo de Activo
          </label>
          <Select
            value={filters.assetTypeId}
            onValueChange={(v) => setField("assetTypeId", v)}
          >
            <SelectTrigger className="h-9 rounded-2xl border-gray-200 bg-gray-50/50 px-4 text-xs focus:ring-1 focus:ring-emerald-400/50">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {assetTypes.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Acciones */}
        <div className="flex items-end gap-2">
          <Button
            onClick={onApply}
            className="h-9 rounded-2xl bg-gray-900 px-5 text-xs font-medium text-white shadow-sm hover:bg-gray-800 active:scale-[0.97] transition-transform"
          >
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Buscar
          </Button>
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-9 rounded-2xl px-3 text-xs text-gray-400 hover:text-gray-600"
          >
            Limpiar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
