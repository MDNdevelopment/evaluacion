import { Home, FileCheck, ChartColumn, User, Building2 } from "lucide-react";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/useUserStore";
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
      admin: false,
      access_level: 1,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      admin: false,
      access_level: 2,
    },
    {
      title: "Evaluar",
      url: "/empleados",
      icon: FileCheck,
      admin: false,
      access_level: 2,
    },
    {
      title: "Resumen",
      url: "/resumen",
      icon: ChartColumn,
      admin: false,
      access_level: 2,
    },

    {
      title: "Mi organización",
      url: "/organizacion",
      icon: Building2,
      admin: false,
      access_level: 1,
      items: [
        {
          title: "Configuración",
          url: "/organizacion/configuracion",
          admin: true,
        },
        {
          title: "Empleados",
          url: "/organizacion/empleados",
          admin: true,
        },
        {
          title: "Departamentos",
          url: "/organizacion/departamentos",
          admin: true,
        },
        {
          title: "Preguntas",
          url: "/organizacion/preguntas",
          admin: true,
        },

        {
          title: "Descargas",
          url: "/organizacion/descargas",
          admin: false,
        },
        {
          title: "Agregar empleado",
          url: "/dashboard/nuevo",
          admin: true,
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
