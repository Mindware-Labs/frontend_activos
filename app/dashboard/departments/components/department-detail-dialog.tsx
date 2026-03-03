"use client";

import { Building2, XCircle } from "lucide-react";
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
import type { Department } from "./types";

type DepartmentDetailDialogProps = {
  department: Department | null;
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

export function DepartmentDetailDialog({
  department,
  open,
  onOpenChange,
}: DepartmentDetailDialogProps) {
  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Información del Departamento</DialogTitle>
          <DialogDescription>Detalles completos del departamento</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10 p-4">
            <Avatar className="h-20 w-20 rounded-xl border-2 border-border shadow-md">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                {getInitials(department.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {department.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={department.status ? "default" : "secondary"}
                  className={cn(
                    "font-medium",
                    department.status
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600",
                  )}
                >
                  {department.status ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {department.description && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Descripción
              </h4>
              <p className="text-sm text-foreground">{department.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
