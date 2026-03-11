"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Building2,
  Boxes,
  TrendingDown,
  ArrowRight,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"
).replace(/\/$/, "");

type ModuleStats = {
  employees: { total: number; active: number; inactive: number };
  departments: { total: number };
  fixedAssets: { total: number };
  depreciations: { 
    total: number; 
    totalAmount: number; 
    totalAccumulated: number;
    monthlyAverage?: number;
  };
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
};

// Animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Funciones auxiliares
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

  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

function extractData<T>(response: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(response) ? response : response?.data || [];
}

const sumAllNumbers = (value: any): number => {
  if (value === undefined || value === null) return 0;
  
  const strValue = String(value);
  const regex = /(\d+\.?\d*)/g;
  const matches = strValue.match(regex);
  
  if (!matches) return 0;
  
  return matches.reduce((sum, match) => {
    const cleanNum = match.replace(/^0+/, '');
    const num = parseFloat(cleanNum);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-DO").format(value);
};

// Componente de tarjeta estadística
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  color = "emerald",
  className 
}: { 
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: { value: number; positive: boolean };
  color?: "emerald" | "blue" | "amber" | "purple" | "red";
  className?: string;
}) => {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    red: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      <Card className="overflow-hidden border-border/50 bg-white/90 backdrop-blur-sm dark:bg-gray-950/90">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
                {trend && (
                  <Badge variant={trend.positive ? "default" : "destructive"} className="text-xs">
                    {trend.positive ? "+" : "-"}{trend.value}%
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={cn("rounded-xl p-3", colorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de módulo
const ModuleCard = ({ 
  title, 
  icon: Icon, 
  href, 
  stats, 
  color = "emerald",
  progress 
}: { 
  title: string;
  icon: any;
  href: string;
  stats: Array<{ label: string; value: string | number }>;
  color?: "emerald" | "blue" | "amber" | "purple";
  progress?: number;
}) => {
  const colorClasses = {
    emerald: "from-emerald-500 to-green-500",
    blue: "from-blue-500 to-cyan-500",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <motion.div variants={itemVariants}>
      <Link href={href}>
        <Card className="group relative overflow-hidden border-border/50 bg-white/90 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02] dark:bg-gray-950/90">
          <div className={cn(
            "absolute inset-x-0 top-0 h-1 bg-linear-to-r",
            colorClasses[color]
          )} />
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-lg p-2",
                  color === "emerald" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                  color === "blue" && "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                  color === "amber" && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                  color === "purple" && "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>

            <div className="space-y-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </div>

            {progress !== undefined && (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<ModuleStats>({
    employees: { total: 0, active: 0, inactive: 0 },
    departments: { total: 0 },
    fixedAssets: { total: 0 },
    depreciations: { total: 0, totalAmount: 0, totalAccumulated: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [employees, departments, fixedAssets, depreciations] =
        await Promise.all([
          apiRequest<any>("/employees"),
          apiRequest<any>("/departments"),
          apiRequest<any>("/fixed-assets"),
          apiRequest<any>("/depreciation-calculations"),
        ]);

      const empData = extractData(employees);
      const deptData = extractData(departments);
      const assetsData = extractData(fixedAssets);
      const depData = extractData(depreciations);

      const activeEmployees = empData.filter(
        (e: any) => e.active === true || e.status === true
      ).length;

      // Calcular montos de depreciación
      const totalAmount = depData.reduce((sum: number, dep: any) => {
        return sum + sumAllNumbers(dep.amountDepreciation || dep.amount || 0);
      }, 0);

      const totalAccumulated = depData.reduce((sum: number, dep: any) => {
        return sum + sumAllNumbers(dep.accumulatedDepreciation || dep.accumulated || 0);
      }, 0);

      setStats({
        employees: {
          total: empData.length,
          active: activeEmployees,
          inactive: empData.length - activeEmployees,
        },
        departments: { total: deptData.length },
        fixedAssets: { total: assetsData.length },
        depreciations: {
          total: depData.length,
          totalAmount,
          totalAccumulated,
        },
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Calcular métricas adicionales
  const activePercentage = stats.employees.total 
    ? Math.round((stats.employees.active / stats.employees.total) * 100) 
    : 0;

  const depreciationEfficiency = stats.depreciations.totalAmount && stats.fixedAssets.total
    ? Math.round((stats.depreciations.totalAmount / (stats.fixedAssets.total * 100000)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto max-w-7xl px-4 py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Empleados"
          value={formatNumber(stats.employees.total)}
          icon={Users}
          description={`${stats.employees.active} activos · ${stats.employees.inactive} inactivos`}
          trend={{ value: activePercentage, positive: true }}
          color="emerald"
        />
        <StatCard
          title="Departamentos"
          value={formatNumber(stats.departments.total)}
          icon={Building2}
          description="Unidades organizativas"
          color="blue"
        />
        <StatCard
          title="Activos Fijos"
          value={formatNumber(stats.fixedAssets.total)}
          icon={Boxes}
          description="Bienes registrados"
          color="purple"
        />
        <StatCard
          title="Depreciaciones"
          value={formatNumber(stats.depreciations.total)}
          icon={TrendingDown}
          description="Cálculos realizados"
          color="amber"
        />
      </div>

      {/* Financial Summary */}
      <motion.div variants={itemVariants} className="mt-8">
        <Card className="overflow-hidden border-border/50 bg-linear-to-br from-emerald-50/80 via-white to-blue-50/80 dark:from-emerald-950/20 dark:via-gray-950 dark:to-blue-950/20">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold">Resumen Financiero</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Monto Período</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(stats.depreciations.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Depreciación actual</p>
              </div>
              <div className="rounded-lg border border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Acumulado</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {formatCurrency(stats.depreciations.totalAccumulated)}
                </p>
                <p className="text-xs text-muted-foreground">Total histórico</p>
              </div>
              <div className="rounded-lg border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Ratio</p>
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {stats.fixedAssets.total > 0 
                      ? (stats.depreciations.total / stats.fixedAssets.total * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <Progress value={stats.fixedAssets.total > 0 ? (stats.depreciations.total / stats.fixedAssets.total * 100) : 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">Cálculos vs activos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modules Grid */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold">Módulos del Sistema</h2>
          <p className="text-muted-foreground">Accede a cada sección para gestionar tus datos</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleCard
            title="Empleados"
            icon={Users}
            href="/dashboard/employees"
            color="emerald"
            stats={[
              { label: "Activos", value: `${stats.employees.active}` },
              { label: "Inactivos", value: `${stats.employees.inactive}` },
              { label: "Total", value: `${stats.employees.total}` },
            ]}
            progress={activePercentage}
          />
          <ModuleCard
            title="Departamentos"
            icon={Building2}
            href="/dashboard/departments"
            color="blue"
            stats={[
              { label: "Total", value: `${stats.departments.total}` },
              { label: "Por empleado", value: stats.departments.total > 0 ? `${Math.round(stats.employees.total / stats.departments.total)}` : "0" },
            ]}
          />
          <ModuleCard
            title="Activos Fijos"
            icon={Boxes}
            href="/dashboard/fixed-assets"
            color="purple"
            stats={[
              { label: "Total", value: `${stats.fixedAssets.total}` },
              { label: "En depreciación", value: `${stats.depreciations.total}` },
            ]}
          />
          <ModuleCard
            title="Depreciaciones"
            icon={TrendingDown}
            href="/dashboard/depreciation-calculations"
            color="amber"
            stats={[
              { label: "Cálculos", value: `${stats.depreciations.total}` },
              { label: "Monto período", value: `RD$ ${Math.round(stats.depreciations.totalAmount).toLocaleString("es-DO")}` },
            ]}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-border/50">
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold">Acceso Rápido</h2>
          <p className="text-muted-foreground">Accede a los módulos desde aquí</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="w-full h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-medium">
              <Link href="/dashboard/employees">
                <Users className="h-5 w-5" />
                Empleados
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md font-medium">
              <Link href="/dashboard/departments">
                <Building2 className="h-5 w-5" />
                Departamentos
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="w-full h-12 gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md font-medium">
              <Link href="/dashboard/fixed-assets">
                <Boxes className="h-5 w-5" />
                Activos Fijos
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="w-full h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md font-medium">
              <Link href="/dashboard/depreciation-calculations">
                <TrendingDown className="h-5 w-5" />
                Depreciaciones
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}