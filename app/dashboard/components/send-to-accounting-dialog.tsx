"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Hash,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency, type AccountingEntryGroup } from "./types";

// TODO: Reemplazar con la URL real de la app de contabilidad cuando esté disponible
const ACCOUNTING_APP_URL: string | null = null;

type SendStatus = "idle" | "sending" | "success" | "error";

type Props = {
  group: AccountingEntryGroup | null;
  onClose: () => void;
};

export function SendToAccountingDialog({ group, onClose }: Props) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOpen = group !== null;
  const totalDB =
    group?.entries
      .filter((e) => e.movementType === "DB")
      .reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const totalCR =
    group?.entries
      .filter((e) => e.movementType === "CR")
      .reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  function handleOpenChange(val: boolean) {
    if (status === "sending") return;
    if (!val) {
      setStatus("idle");
      setErrorMsg(null);
      onClose();
    }
  }

  async function handleSend() {
    if (!group) return;
    setStatus("sending");
    setErrorMsg(null);

    try {
      if (ACCOUNTING_APP_URL) {
        // Una vez disponible la URL, se realizará la petición real
        const response = await fetch(ACCOUNTING_APP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auxiliaryId: group.auxiliaryId,
            description: group.description,
            inventoryTypeId: group.inventoryTypeId,
            date: group.date,
            entries: group.entries.map((e) => ({
              accountId: e.accountId,
              accountName: e.accountName,
              movementType: e.movementType,
              amount: e.amount,
            })),
          }),
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } else {
        // Simulación: espera 1.5 s
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Enviar a Contabilidad
          </DialogTitle>
          <DialogDescription className="text-xs">
            Revise los detalles del asiento antes de enviarlo al sistema
            contable.
          </DialogDescription>
        </DialogHeader>

        {group && status !== "success" && (
          <div className="space-y-4 py-1">
            {/* Cabecera del asiento */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {group.description}
                  </p>
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
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground/60 pt-0.5">
                    {group.auxiliaryId}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tabla de líneas */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Líneas del asiento
              </p>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/30">
                      <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3">
                        Cta.
                      </TableHead>
                      <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3">
                        Cuenta
                      </TableHead>
                      <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[56px] px-2">
                        Mov.
                      </TableHead>
                      <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right px-3 w-[110px]">
                        Monto
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.entries.map((entry, idx) => (
                      <TableRow
                        key={entry.id}
                        className={`border-b-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"}`}
                      >
                        <TableCell className="px-3 py-2 text-xs text-muted-foreground font-mono">
                          {entry.accountId}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-xs font-medium text-foreground/90">
                          {entry.accountName}
                        </TableCell>
                        <TableCell className="px-2 py-2">
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
                        <TableCell className="px-3 py-2 text-xs font-semibold text-right tabular-nums">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totales */}
                <div className="grid grid-cols-2 border-t bg-muted/20 divide-x">
                  <div className="px-4 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mb-0.5">
                      Total Débito
                    </p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {formatCurrency(totalDB)}
                    </p>
                  </div>
                  <div className="px-4 py-2.5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">
                      Total Crédito
                    </p>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {formatCurrency(totalCR)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso si la URL no está configurada */}
            {!ACCOUNTING_APP_URL && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Modo simulación:</span> aún no
                  se ha configurado la URL del sistema contable. El botón
                  simulará el envío exitosamente.
                </p>
              </div>
            )}

            {/* Error */}
            {status === "error" && errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-500/20 dark:bg-red-500/10">
                <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  {errorMsg}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado de éxito */}
        {status === "success" && group && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                ¡Asiento enviado exitosamente!
              </p>
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
              <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                {group.auxiliaryId}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {status !== "success" ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={status === "sending"}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => void handleSend()}
                disabled={status === "sending"}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {status === "sending" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {status === "sending" ? "Enviando..." : "Enviar a Contabilidad"}
              </Button>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)} className="text-xs">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
