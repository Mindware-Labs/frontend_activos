"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DepreciationRecord, MonthlyTrend } from "./types";

type ProjectionChartProps = {
  records: DepreciationRecord[];
};

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

function buildTrendData(records: DepreciationRecord[]): MonthlyTrend[] {
  const byPeriod = new Map<string, { amount: number; accumulated: number }>();

  for (const r of records) {
    const key = `${r.processYear}-${r.processMonth}`;
    const existing = byPeriod.get(key) ?? { amount: 0, accumulated: 0 };
    const amt =
      typeof r.amountDepreciation === "number"
        ? r.amountDepreciation
        : parseFloat(String(r.amountDepreciation)) || 0;
    const acc =
      typeof r.accumulatedDepreciation === "number"
        ? r.accumulatedDepreciation
        : parseFloat(String(r.accumulatedDepreciation)) || 0;
    existing.amount += amt;
    existing.accumulated += acc;
    byPeriod.set(key, existing);
  }

  const sorted = Array.from(byPeriod.entries())
    .map(([key, val]) => {
      const [y, m] = key.split("-").map(Number);
      return { year: y, month: m, ...val };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);

  // Calculamos el acumulado real como running sum de montos mensuales.
  // Sumar accumulatedDepreciation por período es incorrecto: cuando un activo
  // termina su vida útil deja de generar registros, haciendo que el total baje.
  let runningAccumulated = 0;
  const historical: MonthlyTrend[] = sorted.map((s) => {
    runningAccumulated += s.amount;
    return {
      label: `${MONTH_LABELS[s.month - 1]} ${s.year}`,
      month: s.month,
      year: s.year,
      amount: s.amount,
      accumulated: runningAccumulated,
      projected: false,
    };
  });

  // Proyección lineal para los próximos 6 meses.
  // accDelta = monto mensual promedio de los últimos 2 períodos (siempre positivo).
  if (historical.length >= 2) {
    const last = historical[historical.length - 1];
    const prev = historical[historical.length - 2];
    const delta = last.amount - prev.amount;
    // El acumulado proyectado crece con el monto proyectado (nunca decrece).
    const accDelta = Math.max(last.amount, prev.amount);

    let projMonth = last.month;
    let projYear = last.year;

    for (let i = 1; i <= 6; i++) {
      projMonth++;
      if (projMonth > 12) {
        projMonth = 1;
        projYear++;
      }
      historical.push({
        label: `${MONTH_LABELS[projMonth - 1]} ${projYear}`,
        month: projMonth,
        year: projYear,
        amount: Math.max(0, last.amount + delta * i),
        accumulated: last.accumulated + accDelta * i,
        projected: true,
      });
    }
  }

  return historical;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">
            {entry.dataKey === "amount" ? "Depreciación" : "Acumulado"}:
          </span>
          <span className="font-medium text-gray-800">
            RD${" "}
            {entry.value.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProjectionChart({ records }: ProjectionChartProps) {
  const trendData = useMemo(() => buildTrendData(records), [records]);

  if (trendData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-xl border border-gray-100 bg-white p-4"
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-3">
          Tendencia & Proyección
        </p>
        <div className="flex h-48 items-center justify-center text-xs text-gray-400">
          No hay datos suficientes para graficar
        </div>
      </motion.div>
    );
  }

  const historicalEnd = trendData.findIndex((d) => d.projected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-xl border border-gray-100 bg-white p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          Tendencia & Proyección (6 meses)
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-gray-400">Depreciación</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-3 rounded-full bg-blue-400" />
            <span className="text-[10px] text-gray-400">Acumulado</span>
          </div>
          {historicalEnd >= 0 && (
            <div className="flex items-center gap-1.5">
              <div
                className="h-1 w-3 rounded-full bg-gray-300"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 2px, #d1d5db 2px, #d1d5db 4px)",
                }}
              />
              <span className="text-[10px] text-gray-400">Proyección</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={trendData}
          margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradAccum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompactCurrency}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#10b981"
            strokeWidth={1.5}
            fill="url(#gradAmount)"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey="accumulated"
            stroke="#60a5fa"
            strokeWidth={1.5}
            fill="url(#gradAccum)"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
