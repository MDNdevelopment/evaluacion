import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import SingleDatePicker from "./SingleDatePicker";
import parseLocalDate from "@/utils/parseLocalDate";

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
  isEditEmployeeDialogOpen,
  setIsEditEmployeeDialogOpen,
}: {
  employeeId: string | null;
  departments: Department[];
  positions: Position[];
  fetchEmployees: () => void;
  isEditEmployeeDialogOpen: boolean;
  setIsEditEmployeeDialogOpen: (val: boolean) => void;
}) {
  const [birthDate, setBirthDate] = useState<null | Date>(null);
  const [sendingData, setSendingData] = useState<boolean>(false);
  const [hireDate, setHireDate] = useState<null | Date>(null);
  const [employeePosition, setEmployeePosition] = useState<number | null>(null);
  const { register, setValue, handleSubmit } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      department_name: "",
      department_id: 0,
      position_id: 0,
      access_level: 1,
      birth_date: "",
      hire_date: "",
    },
  });
  const [_selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

  const onSubmit = handleSubmit(async (data: any) => {
    setSendingData(true);
    const { data: _updateData, error } = await supabase
      .from("users")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        department_id: data.department_id,
        position_id: data.position_id,
        access_level: data.access_level,
        phone_number: data.phone_number,
        birth_date: data.birth_date,
        hire_date: data.hire_date,
      })
      .eq("user_id", employeeId);
    if (error) {
      console.log(error.message);
      setSendingData(false);
      toast.error("Error al actualizar el empleado", {
        position: "bottom-right",
        autoClose: 2000,
      });
      return;
    }

    toast.success("Empleado actualizado correctamente", {
      position: "bottom-right",
      autoClose: 2000,
    });

    setIsEditEmployeeDialogOpen(false);
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
      setValue("first_name", data.first_name);
      setValue("last_name", data.last_name);
      setValue("email", data.email);
      setValue("phone_number", data.phone_number);
      setValue("department_id", data.department_id);
      setValue("department_name", data.departments.department_name);
      setValue("access_level", data.access_level);
      setValue("birth_date", data.birth_date);
      setValue("hire_date", data.hire_date);

      setBirthDate(data.birth_date);
      setHireDate(data.hire_date);
      setSelectedDepartment({
        department_id: data.department_id,
        department_name: data.name,
      });
      setSelectedPositions(
        positions.filter(
          (position) => position.department_id === data.department_id
        )
      );
      setValue("position_id", data.position_id);
      setEmployeePosition(data.position_id);
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

  useEffect(() => {
    setSendingData(false);
    if (!employeeId) return;
    if (isEditEmployeeDialogOpen) {
      getEmployeeData(employeeId);
    }
  }, [employeeId, isEditEmployeeDialogOpen]);

  useEffect(() => {
    setValue("position_id", employeePosition || 0);
  }, [employeePosition]);

  return (
    <Dialog
      open={isEditEmployeeDialogOpen}
      onOpenChange={setIsEditEmployeeDialogOpen}
    >
      <DialogContent className="sm:max-w-[625px] ">
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
          <DialogDescription>
            Haz cambios a los datos del empleado aquí. Asegúrate de que la
            información sea correcta antes de guardar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-y-3 py-4">
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
            <Label htmlFor="phone_number" className="text-right w-2/4">
              Teléfono
            </Label>
            <Input
              id="phone_number"
              {...register("phone_number")}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="birth_date" className="text-right w-2/4">
              Fecha de nacimiento
            </Label>
            <div className="w-full">
              <SingleDatePicker
                identifier="birth_date"
                setValue={setValue}
                date={
                  typeof birthDate === "string"
                    ? parseLocalDate(birthDate) ?? new Date()
                    : birthDate || new Date()
                }
                setDate={setBirthDate}
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Label htmlFor="hire_date" className="text-right w-2/4">
              Fecha de ingreso
            </Label>
            <div className="w-full">
              <SingleDatePicker
                identifier="hire_date"
                setValue={setValue}
                date={
                  typeof hireDate === "string"
                    ? parseLocalDate(hireDate) ?? new Date()
                    : hireDate || new Date()
                }
                setDate={setHireDate}
              />
            </div>
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
                isEditEmployeeDialogOpen &&
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
            <Label htmlFor="position" className="text-right w-2/4">
              Cargo
            </Label>
            <select
              {...register("position_id")}
              className="border p-1 rounded-md shadow-sm w-full "
            >
              {employeePosition &&
                selectedPositions &&
                selectedPositions.map((currPosition) => (
                  <option
                    key={currPosition.position_id}
                    value={currPosition.position_id}
                  >
                    {currPosition.position_name}
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
            <Button disabled={sendingData} type="submit">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
