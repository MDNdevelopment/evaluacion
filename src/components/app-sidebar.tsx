import {
  Home,
  Settings,
  FileCheck,
  ChartColumn,
  User,
  Building2,
  ChevronUp,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useUserStore } from "@/stores/useUserStore";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { NavMain } from "./Navigation/nav-main";

export function AppSidebar() {
  const user = useUserStore((state) => state.user);

  // Menu items.
  const navMain = [
    {
      title: "Mi perfil",
      url: "/empleado/" + user?.id,
      icon: User,
      role: "employee",
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      role: "employee",
    },
    {
      title: "Evaluar",
      url: "/empleados",
      icon: FileCheck,
      role: "admin",
    },
    {
      title: "Resumen",
      url: "/resumen",
      icon: ChartColumn,
      role: "admin",
    },

    {
      title: "Mi organización",
      url: "/organizacion",
      icon: Building2,
      admin: false,
      items: [
        {
          title: "Configuración",
          url: "/organizacion/configuracion",
          role: "admin",
        },
        {
          title: "Empleados",
          url: "/organizacion/empleados",
          role: "admin",
        },
        {
          title: "Departamentos",
          url: "/organizacion/departamentos",
          role: "admin",
        },
        {
          title: "Preguntas",
          url: "/organizacion/preguntas",
          role: "admin",
        },

        {
          title: "Descargas",
          url: "/organizacion/descargas",
          role: "employee",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent className="gap-0">
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}

{
  /* <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem> */
}
