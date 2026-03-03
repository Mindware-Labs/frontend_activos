"use client";

import { Plus, RefreshCw, Boxes } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fadeInUp } from "./animations";
import { cn } from "@/lib/utils";

type FixedAssetsHeaderProps = {
  isRefreshing: boolean;
  canCreate: boolean;
  onRefresh: () => void;
  onCreate: () => void;
};

export function FixedAssetsHeader({
  isRefreshing,
  canCreate,
  onRefresh,
  onCreate,
}: FixedAssetsHeaderProps) {
  return (
    <motion.header
      className="relative mb-6 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/95 p-5 shadow-lg transition-all hover:shadow-xl sm:px-6 sm:py-6 z-10"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />
      <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl dark:bg-primary/5" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg ring-2 ring-emerald-200/50 dark:from-emerald-600 dark:to-emerald-700 dark:ring-emerald-800/50">
            <Boxes className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Gestión de Activos Fijos
              </h1>
              <Badge
                variant="outline"
                className="hidden px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 sm:inline-flex"
              >
                Sistema
              </Badge>
            </div>
            <p className="max-w-lg text-sm text-muted-foreground">
              Administra los activos fijos de tu organización.
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center gap-2.5 sm:w-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={cn(
                  "h-10 w-10 p-0 border-border/50 bg-background/80 backdrop-blur-sm transition-all hover:bg-muted hover:scale-105",
                  isRefreshing && "opacity-70",
                )}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 text-muted-foreground",
                    isRefreshing && "animate-spin text-primary",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Actualizar datos
            </TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            onClick={onCreate}
            disabled={!canCreate}
            className="h-10 w-full shadow-md transition-all active:scale-95 hover:shadow-lg sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Activo
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
