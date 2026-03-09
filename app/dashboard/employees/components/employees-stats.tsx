"use client";

import { UserCheck, UserX, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "./animations";
import type { EmployeeStats } from "./types";

type EmployeesStatsProps = {
  stats: EmployeeStats;
};

type StatCard = {
  title: string;
  value: number;
  icon: typeof Users;
  helper: string;
  progress: number;
  badge: string;
  iconClassName: string;
};

export function EmployeesStats({ stats }: EmployeesStatsProps) {
  const activePercent =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const inactivePercent =
    stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0;

  const cardsData: StatCard[] = [
    {
      title: "Total empleados",
      value: stats.total,
      icon: Users,
      helper: "Plantilla registrada",
      progress: 100,
      badge: "100%",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Empleados activos",
      value: stats.active,
      icon: UserCheck,
      helper: "Personal operativo",
      progress: activePercent,
      badge: `${activePercent}%`,
      iconClassName: "bg-green-100 text-green-700",
    },
    {
      title: "Empleados inactivos",
      value: stats.inactive,
      icon: UserX,
      helper: "Sin actividad actual",
      progress: inactivePercent,
      badge: `${inactivePercent}%`,
      iconClassName: "bg-red-100 text-red-700",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {cardsData.map((card) => {
        const Icon = card.icon;

        return (
          <motion.div key={card.title} variants={fadeInUp}>
            <Card className="overflow-hidden border-primary/15 bg-white/90 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      card.iconClassName,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{card.helper}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                      {card.badge}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-100/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-[width] duration-500"
                      style={{ width: `${Math.max(0, Math.min(card.progress, 100))}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
