"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AccountingEntriesList } from "./components/accounting-entries-list";
import { CreateAccountingSheet } from "./components/create-accounting-sheet";
import { DeleteAccountingDialog } from "./components/delete-accounting-dialog";
import { SendToAccountingDialog } from "./components/send-to-accounting-dialog";
import {
  apiRequest,
  MONTH_NAMES,
  type AccountingEntryGroup,
} from "./components/types";
import { sileo } from "sileo";

export default function DashboardPage() {
  const [groups, setGroups] = useState<AccountingEntryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sendTarget, setSendTarget] = useState<AccountingEntryGroup | null>(
    null,
  );
  const [filterMonth, setFilterMonth] = useState<number>(0);

  const filteredGroups =
    filterMonth === 0
      ? groups
      : groups.filter((g) => {
          // auxiliaryId format: AF-YYYY-MM-timestamp
          const parts = g.auxiliaryId.split("-");
          return parseInt(parts[2] ?? "0", 10) === filterMonth;
        });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AccountingEntryGroup[]>(
        "/accounting-entries",
      );
      setGroups(data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cargar los asientos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Asientos Contables
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestión de asientos contables de activos fijos.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtro por mes */}
            <Select
              value={String(filterMonth)}
              onValueChange={(v) => setFilterMonth(Number(v))}
            >
              <SelectTrigger className="h-8 w-[160px] rounded-lg text-xs shadow-sm">
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todos los meses</SelectItem>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {String(i + 1).padStart(2, "0")} &mdash; {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="h-8 rounded-lg shadow-sm active:scale-[0.98] transition-transform font-semibold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Crear Asiento
            </Button>
          </div>
        </motion.div>

        {/* Entries List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <AccountingEntriesList
            groups={filteredGroups}
            isLoading={isLoading}
            onDelete={setDeleteTarget}
            onSend={setSendTarget}
          />
        </motion.div>
      </div>

      <CreateAccountingSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => void loadData()}
        existingGroups={groups}
      />

      <DeleteAccountingDialog
        auxiliaryId={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => void loadData()}
      />

      <SendToAccountingDialog
        group={sendTarget}
        onClose={() => setSendTarget(null)}
      />
    </TooltipProvider>
  );
}
