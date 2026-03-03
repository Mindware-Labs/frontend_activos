"use client";

import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { fadeInUp } from "./animations";

type AssetTypesAlertProps = {
  show: boolean;
};

export function AssetTypesAlert({ show }: AssetTypesAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mb-4"
        >
          <Alert className="relative overflow-hidden border-amber-200/60 bg-gradient-to-r from-amber-50 via-amber-50/50 to-transparent p-4 shadow-sm dark:border-amber-900/50 dark:from-amber-950/40 dark:via-amber-900/10">
            <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-amber-500/10 blur-xl dark:bg-amber-500/5" />
            <AlertCircle className="absolute left-4 top-4 h-5 w-5 text-amber-600/80 dark:text-amber-400/80" />
            <AlertDescription className="ml-7 flex flex-col gap-3">
              <span className="text-[13px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
                No hay tipos de activos registrados. Crea uno desde el formulario.
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}