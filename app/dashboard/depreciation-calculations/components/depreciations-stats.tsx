"use client";

import { DollarSign, TrendingDown, Hash } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "./animations";
import type { DepreciationStats } from "./types";

type DepreciationsStatsProps = {
    stats: DepreciationStats;
};

type StatCard = {
    title: string;
    value: string | number;
    icon: typeof DollarSign;
    helper: string;
    progress: number;
    badge: string;
    iconClassName: string;
};

export function DepreciationsStats({ stats }: DepreciationsStatsProps) {
    // Función para extraer y sumar TODOS los números de un string concatenado
    const sumAllNumbers = (value: any): number => {
        // Si es undefined o null, retornar 0
        if (value === undefined || value === null) return 0;

        const strValue = String(value);
        console.log("Valor original:", strValue);

        // Buscar patrones como: números con punto decimal al final (ej: 5000.00, 05000.00)
        const regex = /(\d+\.\d{2})/g;
        const matches = strValue.match(regex);

        if (matches && matches.length > 0) {
            console.log("Matches encontrados:", matches);

            // Sumar todos los matches
            const total = matches.reduce((sum, match) => {
                // Eliminar ceros a la izquierda y convertir a número
                const numStr = match.replace(/^0+/, '');
                const num = parseFloat(numStr);
                return sum + (isNaN(num) ? 0 : num);
            }, 0);

            console.log("Total sumado:", total);
            return total;
        }

        // Si no encuentra el patrón, intentar con el método alternativo
        const numberPattern = /\d+\.?\d*|\d+/g;
        const allMatches = strValue.match(numberPattern);

        if (!allMatches || allMatches.length === 0) return 0;

        // Si hay múltiples números, sumarlos
        if (allMatches.length > 1) {
            const total = allMatches.reduce((sum, num) => {
                const cleanNum = num.replace(/^0+/, '');
                const parsed = parseFloat(cleanNum);
                return sum + (isNaN(parsed) ? 0 : parsed);
            }, 0);

            console.log("Total sumado (múltiples):", total);
            return total;
        }

        // Si es un solo número, devolverlo normal
        const singleNum = parseFloat(allMatches[0].replace(/^0+/, ''));
        return isNaN(singleNum) ? 0 : singleNum;
    };

    // Función para formatear moneda
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // VALIDACIONES: Asegurar que stats existe y tiene las propiedades
    const safeStats = stats || {};

    // Extraer y sumar TODOS los números con validaciones seguras
    const totalAmountSum = sumAllNumbers(safeStats.totalAmount);
    const totalAccumulatedSum = sumAllNumbers(safeStats.totalAccumulated);
    const totalCount = safeStats.total || 0;

    console.log("RESULTADO FINAL - Monto depreciado:", totalAmountSum);
    console.log("RESULTADO FINAL - Dep. acumulada:", totalAccumulatedSum);

    const cardsData: StatCard[] = [
        {
            title: "Total cálculos",
            value: totalCount,
            icon: Hash,
            helper: "Registros de depreciación",
            progress: 100,
            badge: `${totalCount}`,
            iconClassName: "bg-emerald-100 text-emerald-700",
        },
        {
            title: "Monto total depreciado",
            value: formatCurrency(totalAmountSum),
            icon: DollarSign,
            helper: "Total depreciado este período",
            progress: 100,
            badge: totalAmountSum > 0 ? formatCurrency(totalAmountSum) : "0.00",
            iconClassName: "bg-emerald-100 text-emerald-700",
        },
        {
            title: "Depreciación total acumulada",
            value: formatCurrency(totalAccumulatedSum),
            icon: TrendingDown,
            helper: "Total acumulado",
            progress: 100,
            badge: totalAccumulatedSum > 0 ? formatCurrency(totalAccumulatedSum) : "0.00",
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
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {card.title}
                                        </p>
                                        <p className="text-lg sm:text-2xl font-semibold tracking-tight text-foreground">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                                            card.iconClassName,
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span className="truncate">{card.helper}</span>
                                        <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary shrink-0">
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