import { BookOpen, CalendarDays, Send, Trash2, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, type AccountingEntryGroup } from "./types";

type Props = {
  group: AccountingEntryGroup;
  onDelete: (auxiliaryId: string) => void;
  onSend: (group: AccountingEntryGroup) => void;
};

export function AccountingEntryCard({ group, onDelete, onSend }: Props) {
  return (
    <Card className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden relative">
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* --- Header Compacto --- */}
        <div className="flex items-start justify-between gap-3 bg-muted/40 p-3 border-b">
          <div className="flex items-start gap-2.5 min-w-0 pr-6">
            {/* Ícono más pequeño */}
            <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
            </div>

            <div className="space-y-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight tracking-tight line-clamp-2">
                {group.description}
              </p>

              {/* Metadatos Compactos */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 bg-background border px-1.5 py-0.5 rounded shadow-sm">
                  <Hash className="h-3 w-3 text-muted-foreground/70" />
                  <span className="font-medium text-foreground">
                    {group.inventoryTypeId}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-muted-foreground/70" />
                  {new Date(group.date).toLocaleDateString("es-DO", {
                    year: "2-digit", // Año más corto para ahorrar espacio
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Enviar a Contabilidad */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-9 top-2 h-7 w-7 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onSend(group)}
            title="Enviar a contabilidad"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>

          {/* Botón Eliminar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(group.auxiliaryId)}
            title="Eliminar asiento"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* --- Tabla de líneas Compacta --- */}
        <div className="flex-1 p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3">
                    Cuenta
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[80px] px-2">
                    Mov.
                  </TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right px-3 w-[100px]">
                    Monto
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.entries.map((entry, idx) => (
                  <TableRow
                    key={entry.id}
                    className={`hover:bg-muted/30 border-b-0 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/20"}`}
                  >
                    {/* Añadimos max-w y truncate para que no rompa el grid si el nombre es largo */}
                    <TableCell
                      className="px-3 py-1.5 text-xs font-medium text-foreground/90 max-w-[120px] truncate"
                      title={entry.accountName}
                    >
                      {entry.accountName}
                    </TableCell>
                    <TableCell className="px-2 py-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 border ${
                          entry.movementType === "DB"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        }`}
                      >
                        {entry.movementType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-1.5 text-xs font-semibold text-right tabular-nums tracking-tight">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* --- Botón pie de tarjeta --- */}
        <div className="border-t px-3 py-2 bg-muted/20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSend(group)}
            className="w-full h-7 text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:border-blue-500/30 dark:hover:bg-blue-500/10"
          >
            <Send className="h-3 w-3" />
            Enviar a Contabilidad
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
