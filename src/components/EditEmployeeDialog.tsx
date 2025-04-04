import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPencil } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";

interface Department {
  department_name: string;
  department_id: number;
}

interface Position {
  position_name: string;
  position_id: number;
  department_id: number;
}

export function EditEmployeeDialog({
  employeeId,
  departments,
  positions,
  fetchEmployees,
}: {
  employeeId: string;
  departments: Department[];
  positions: Position[];
  fetchEmployees: () => void;
}) {
  const { register, setValue, handleSubmit } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      department_name: "",
      department_id: 0,
      position_id: 0,
      access_level: 1,
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [_selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

  const onSubmit = handleSubmit(async (data: any) => {
    console.log(employeeId);
    console.log(data);
    const { data: _updateData, error } = await supabase
      .from("users")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        department_id: data.department_id,
        position_id: data.position_id,
        access_level: data.access_level,
      })
      .eq("user_id", employeeId);
    if (error) {
      console.log(error.message);
      return;
    }

    toast.success("Empleado actualizado correctamente", {
      position: "top-right",
      autoClose: 2000,
    });

    setIsDialogOpen(false);
    fetchEmployees();
  });
  const getEmployeeData = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*, departments(department_name)")
      .eq("user_id", id)
      .single();
    if (error) {
      console.log(error.message);
      return;
    }
    if (data) {
      console.log(data);
      setValue("first_name", data.first_name);
      setValue("last_name", data.last_name);
      setValue("email", data.email);
      setValue("department_id", data.department_id);
      setValue("department_name", data.departments.department_name);
      setValue("access_level", data.access_level);
      setSelectedDepartment({
        department_id: data.department_id,
        department_name: data.name,
      });
      setValue("position_id", data.position_id);
      console.log({ dbb: data.department_id });
      setSelectedPositions(
        positions.filter(
          (position) => position.department_id === data.department_id
        )
      );
    }
  };

  const handleDepartmentChange = async (id: number) => {
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("department_id", id);
    if (error) {
      console.log(error.message);
      return;
    }
    setSelectedPositions(
      positions.filter((position) => position.department_id === id)
    );
    setValue("position_id", data[0]?.id || 0);
  };
  //   const handleEditEmployee = async (id: string) => {
  //     return;
  //   };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  //   const handleCloseDialog = () => {
  //     setIsDialogOpen(false);
  //   };

  useEffect(() => {
    if (!employeeId) return;
    if (isDialogOpen) {
      getEmployeeData(employeeId);
    }
  }, [employeeId, isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger onClick={handleOpenDialog} asChild>
        <Button variant="outline" className="text-gray-800 hover:text-gray-900">
          <FaPencil size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
          <DialogDescription>
            Haz cambios a los datos del empleado aquí. Asegúrate de que la
            información sea correcta antes de guardar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="first_name" className="text-right w-2/4">
              Nombre
            </Label>
            <Input
              id="first_name"
              {...register("first_name")}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="last_name" className="text-right w-2/4">
              Apellido
            </Label>
            <Input
              id="last_name"
              {...register("last_name")}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="email" className="text-right w-2/4">
              Email
            </Label>
            <Input
              id="email"
              disabled
              {...register("email")}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="department_id" className="text-right w-2/4">
              Departamento
            </Label>
            <select
              id="department_id"
              {...register("department_id")}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setValue("department_id", selectedId);
                const selectedDepartment = departments.find(
                  (department) => department.department_id === selectedId
                );
                setSelectedDepartment(selectedDepartment || null);
                handleDepartmentChange(selectedId);
                setValue(
                  "department_name",
                  selectedDepartment?.department_name || ""
                );
                setValue("position_id", positions[0]?.position_id || 0);
              }}
              className="border p-1 rounded-md shadow-sm w-full "
            >
              {departments &&
                isDialogOpen &&
                departments.map((department) => (
                  <option
                    key={`${department.department_id}-`}
                    value={department.department_id}
                  >
                    {department.department_name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="username" className="text-right w-2/4">
              Cargo
            </Label>
            <select
              {...register("position_id")}
              className="border p-1 rounded-md shadow-sm w-full "
            >
              {selectedPositions.map((position) => (
                <option key={position.position_id} value={position.position_id}>
                  {position.position_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="username" className="text-right w-2/4">
              Nivel de acceso
            </Label>
            <select
              {...register("access_level")}
              className="border p-1 rounded-md shadow-sm w-full "
            >
              {[...Array(4)].map((_, accessLevel) => {
                const accessLevelValue = accessLevel + 1;
                return (
                  <option
                    key={`access_level-${accessLevel}`}
                    value={accessLevelValue}
                  >
                    {accessLevelValue}
                  </option>
                );
              })}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
