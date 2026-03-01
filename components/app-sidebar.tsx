"use client"

import * as React from "react"
import {
  Boxes,
  Building2,
  Calculator,
  LayoutDashboard,
  Tag,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
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
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-sidebar-foreground/70 text-xs">Sistema</p>
          <p className="text-sm font-semibold">Activos Fijos</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Backend" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
