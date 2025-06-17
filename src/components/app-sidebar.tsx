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
import { NavUser } from "./Navigation/nav-user";
import { NavCompany } from "./Navigation/nav-company";
import { useCompanyStore } from "@/stores";

export function AppSidebar() {
  const user = useUserStore((state) => state.user);
  const company = useCompanyStore((state) => state.company);

  // Menu items.
  const navMain = [
    {
      title: "Mi perfil",
      url: "/empleado/" + user?.id,
      icon: User,
      role: "employee",
      access_level: 1,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      role: "employee",
      access_level: 2,
    },
    {
      title: "Evaluar",
      url: "/empleados",
      icon: FileCheck,
      role: "employee",
      access_level: 2,
    },
    {
      title: "Resumen",
      url: "/resumen",
      icon: ChartColumn,
      role: "employee",
      access_level: 2,
    },

    {
      title: "Mi organización",
      url: "/organizacion",
      icon: Building2,
      role: "employee",
      access_level: 1,
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
      <SidebarContent className="gap-0 flex flex-col justify-between p-3">
        <div>
          <NavCompany
            teams={[
              {
                name: company?.name || "Cargando...",
                logo: company?.logo_url || "",
              },
            ]}
          />
          <NavMain items={navMain} />
        </div>
        <NavUser
          user={{
            name: user?.full_name || "Usuario",
            email: user?.email || "",
            avatar: user?.avatar_url || "",
            position: user?.position_name || "",
            department: user?.department_name || "",
          }}
        />
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
