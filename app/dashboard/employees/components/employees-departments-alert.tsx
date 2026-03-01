"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "./animations";

type EmployeesDepartmentsAlertProps = {
  show: boolean;
};

export function EmployeesDepartmentsAlert({
  show,
}: EmployeesDepartmentsAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mb-4" // Margen inferior para separarlo de la tabla
        >
          <Alert className="relative overflow-hidden border-amber-200/60 bg-gradient-to-r from-amber-50 via-amber-50/50 to-transparent p-4 shadow-sm dark:border-amber-900/50 dark:from-amber-950/40 dark:via-amber-900/10">
            {/* Elemento decorativo de fondo */}
            <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-amber-500/10 blur-xl dark:bg-amber-500/5" />

            <AlertCircle className="absolute left-4 top-4 h-5 w-5 text-amber-600/80 dark:text-amber-400/80" />

            <AlertDescription className="ml-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[13px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
                No hay departamentos registrados. Debes crear al menos uno para
                poder registrar empleados en el sistema.
              </span>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="group h-8 shrink-0 border-amber-300/50 bg-amber-100/50 px-3 text-xs font-semibold text-amber-800 transition-all hover:bg-amber-200/60 hover:text-amber-900 active:scale-[0.98] dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/50 dark:hover:text-amber-100 sm:w-auto"
              >
                <Link href="/dashboard/departments">
                  Ir a departamentos
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
