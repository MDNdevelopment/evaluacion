import { supabase } from "@/services/supabaseClient";
import { useUserStore } from "@/stores";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Department {
  department_id: number;
  department_name: string;
  company_id: number;
  positions: {
    position_id: number;
    position_name: string;
    employees: number;
  }[];
  dashboard_visible: boolean;
  users: {
    user_id: string;
    first_name: string;
    last_name: string;
    department_id: number;
    avatar_url: string;
    position_id: number;
  }[];
}

export default function useDepartment(id: string | undefined) {
  const user = useUserStore((state) => state.user);
  const [department, setDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const getDepartmentInfo = useCallback(async () => {
    const { data, error } = await supabase
      .from("departments")
      .select(
        "*, positions(position_id, position_name), users(user_id, first_name, last_name, avatar_url, access_level, department_id, position_id, position:positions!position_id(position_name))"
      )
      .eq("department_id", id)
      .eq("company_id", user?.company_id)
      .single();

    if (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    console.log({ data });
    setDepartment(data);
    setDepartmentName(data.department_name);
    setLoading(false);
  }, [id, user?.company_id]);

  useEffect(() => {
    if (!user || !id) return;

    getDepartmentInfo();
  }, [user, id, getDepartmentInfo]);

  const handleChangeDepartmentName = async () => {
    if (!department || !user) return;
    if (!department.department_name) {
      toast.error("El nombre del departamento no puede estar vacío", {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("departments")
      .update({ department_name: departmentName.trim() })
      .eq("department_id", department.department_id)
      .eq("company_id", user?.company_id);
    if (error) {
      console.log(error.message);
      toast.error("Error al actualizar el nombre del departamento", {
        position: "bottom-right",
        autoClose: 5000,
      });
      return;
    }
    toast.success("Nombre del departamento actualizado correctamente", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setDepartmentName(departmentName.trim());
    setDepartment((prev: any) => {
      if (!prev) return null;
      return { ...prev, department_name: departmentName };
    });
  };

  return {
    loading,
    department,
    departmentName,
    setDepartmentName,
    user,
    refetch: getDepartmentInfo,
    handleChangeDepartmentName,
  };
}
