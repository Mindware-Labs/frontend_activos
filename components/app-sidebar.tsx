"use client";

import * as React from "react";
import {
  Boxes,
  Building2,
  Calculator,
  HomeIcon,
  LayoutDashboard,
  Tag,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Activos Fijos",
      url: "/dashboard/fixed-assets",
      icon: Boxes,
    },
    {
      title: "Tipos de Activo",
      url: "/dashboard/asset-types",
      icon: Tag,
    },
    {
      title: "Departamentos",
      url: "/dashboard/departments",
      icon: Building2,
    },
    {
      title: "Empleados",
      url: "/dashboard/employees",
      icon: Users,
    },
    {
      title: "Depreciaciones",
      url: "/dashboard/depreciation-calculations",
      icon: Calculator,
      items: [
        {
          title: "Gestión",
          url: "/dashboard/depreciation-calculations",
        },
        {
          title: "Consulta Mensual",
          url: "/dashboard/depreciation-calculations/consulta",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="border-r-border/50" {...props}>
      <SidebarHeader className="border-b border-border/40 pb-4 pt-5">
        <div className="flex items-center px-2">
          {/* Icono del sistema estilo "App Icon" */}
          <div className="flex h-9 w-9 shrink-0 items-center  rounded-xl bg-gradient-to-br">
            <HomeIcon className="h-6 w-6 text-black" />
          </div>

          {/* Textos del Logo */}
          <div className="flex flex-col truncate">
            <span className="truncate text-sm font-bold tracking-tight text-foreground">
              Activos Fijos
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <NavMain items={data.navMain} label="Menú Principal" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
