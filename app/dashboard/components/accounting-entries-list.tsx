import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { AccountingEntryCard } from "./accounting-entry-card";
import type { AccountingEntryGroup } from "./types";

type Props = {
  groups: AccountingEntryGroup[];
  isLoading: boolean;
  onDelete: (auxiliaryId: string) => void;
  onSend: (group: AccountingEntryGroup) => void;
};

export function AccountingEntriesList({
  groups,
  isLoading,
  onDelete,
  onSend,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl border shadow-sm">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No hay asientos contables registrados
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Crea un asiento contable seleccionando un periodo con
            depreciaciones.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {groups.map((group, idx) => (
          <motion.div
            key={group.auxiliaryId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: idx * 0.03 }}
          >
            <AccountingEntryCard
              group={group}
              onDelete={onDelete}
              onSend={onSend}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
