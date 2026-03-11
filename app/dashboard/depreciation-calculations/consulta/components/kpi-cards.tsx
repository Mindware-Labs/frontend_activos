"use client";

import { DollarSign, Hash, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DepreciationRecord } from "./types";

type KpiCardsProps = {
  records: DepreciationRecord[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function KpiCards({ records }: KpiCardsProps) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthRecords = records.filter(
    (r) => r.processMonth === currentMonth && r.processYear === currentYear,
  );

  const totalDepreciatedThisMonth = currentMonthRecords.reduce(
    (sum, r) =>
      sum +
      (typeof r.amountDepreciation === "number"
        ? r.amountDepreciation
        : parseFloat(String(r.amountDepreciation)) || 0),
    0,
  );

  // Suma los montos mensuales (amountDepreciation), NO los acumulados por activo.
  // accumulatedDepreciation es un running total por activo; sumarlo inflaría el resultado
  // porque contaría mes1(100) + mes2(200) + mes3(300) = 600 en vez de 300.
  const totalAccumulatedHistoric = records.reduce(
    (sum, r) =>
      sum +
      (typeof r.amountDepreciation === "number"
        ? r.amountDepreciation
        : parseFloat(String(r.amountDepreciation)) || 0),
    0,
  );

  const uniqueAssets = new Set(records.map((r) => r.fixedAssetId));

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonthRecords = records.filter(
    (r) => r.processMonth === prevMonth && r.processYear === prevYear,
  );
  const totalDepreciatedPrevMonth = prevMonthRecords.reduce(
    (sum, r) =>
      sum +
      (typeof r.amountDepreciation === "number"
        ? r.amountDepreciation
        : parseFloat(String(r.amountDepreciation)) || 0),
    0,
  );

  const variationPct =
    totalDepreciatedPrevMonth > 0
      ? ((totalDepreciatedThisMonth - totalDepreciatedPrevMonth) /
          totalDepreciatedPrevMonth) *
        100
      : 0;

  const cards = [
    {
      title: "Depreciado este mes",
      value: formatCurrency(totalDepreciatedThisMonth),
      icon: DollarSign,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Acumulado histórico",
      value: formatCurrency(totalAccumulatedHistoric),
      icon: TrendingDown,
      accent: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      title: "Activos procesados",
      value: uniqueAssets.size.toString(),
      icon: Hash,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Variación mensual",
      value: `${variationPct >= 0 ? "+" : ""}${variationPct.toFixed(1)}%`,
      icon: variationPct >= 0 ? TrendingUp : TrendingDown,
      accent: variationPct >= 0 ? "text-amber-600" : "text-emerald-600",
      bg: variationPct >= 0 ? "bg-amber-50" : "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="group relative rounded-xl border border-gray-100 bg-white p-3.5 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  {card.title}
                </p>
                <p className="mt-1 truncate text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                  {card.value}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  card.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", card.accent)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
