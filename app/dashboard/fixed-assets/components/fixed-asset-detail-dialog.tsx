"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FixedAsset } from "./types";

type FixedAssetDetailDialogProps = {
  asset: FixedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FixedAssetDetailDialog({
  asset,
  open,
  onOpenChange,
}: FixedAssetDetailDialogProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Información del Activo Fijo
          </DialogTitle>
          <DialogDescription>
            Detalles completos del registro del activo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Perfil */}
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-4">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                {getInitials(asset.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {asset.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={asset.status ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    asset.status
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  {asset.status ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Inactivo
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="font-medium">
                  <Building2 className="mr-1.5 h-3 w-3" />
                  {asset.department?.name ?? `Dpto #${asset.departmentId}`}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* datos generales */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Información general
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Fecha de registro
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(asset.registrationDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-green-500/10 p-2">
                  <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Departamento
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {asset.department?.name ?? `#${asset.departmentId}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-blue-500/10 p-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tipo de activo
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {asset.assetType?.name ?? `#${asset.assetTypeId}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Valor compra
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {asset.purchaseValue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
                <div className="rounded-md bg-emerald-500/10 p-2">
                  <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Valor residual
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {asset.residualValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
