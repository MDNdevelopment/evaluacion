import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabaseClient";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function DepartmentDialog({
  departmentId,
  departmentName,
  company,
  mode = "create",
  setFetchDepartments,
}: {
  departmentId?: number;
  departmentName?: string;
  company?: {
    id?: string;
    name?: string;
  };
  mode?: "create" | "delete";
  setFetchDepartments?: (value: boolean) => void;
}) {
  const [newDepartment, setNewDepartment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async () => {
    console.log("submitting");
    setLoading(true);
    if (mode === "create") {
      const { data: newDepData, error: newDepError } = await supabase
        .from("departments")
        .insert({
          department_name: newDepartment,
          company_id: company?.id,
          dashboard_visible: false,
        });

      if (newDepError) {
        console.error(newDepError.message);
        setLoading(false);
        toast.error("Error al agregar el departamento. Inténtalo de nuevo.", {
          position: "bottom-right",
          autoClose: 5000,
        });
        return;
      }
    } else if (mode === "delete") {
      //Check if there are employees in this department
      console.log(departmentId);
      const { data: employeeData, error: employeeError } = await supabase
        .from("users")
        .select("user_id.count()")
        .eq("department_id", departmentId)
        .eq("company_id", company?.id)
        .single();

      if (employeeError) {
        console.error(employeeError.message);
        setLoading(false);
        return;
      }

      console.log(employeeData?.count);

      if (employeeData?.count > 0) {
        toast.error(
          "No se puede eliminar este departamento porque tiene empleados asignados.",
          {
            position: "bottom-right",
            autoClose: 5000,
          }
        );
        setLoading(false);
        return;
      } else {
        console.log(departmentId);
        const { error: deleteError } = await supabase
          .from("departments")
          .delete()
          .eq("department_id", departmentId)
          .eq("company_id", company?.id);

        if (deleteError) {
          console.error(deleteError.message);
          setLoading(false);
          toast.error(
            "Error al eliminar el departamento. Inténtalo de nuevo.",
            {
              position: "bottom-right",
              autoClose: 5000,
            }
          );
          return;
        }
      }
    }

    toast.success(
      mode === "delete"
        ? "Departamento eliminado con éxito"
        : "Departamento creado con éxito",
      {
        position: "bottom-right",
        autoClose: 2000,
      }
    );
    setFetchDepartments?.(true);

    setLoading(false);
    if (mode === "delete") {
      navigate("/organizacion/departamentos", {
        replace: true,
      });
    } else {
      setNewDepartment("");
      setIsOpen(false);
      // Refresh the departments list
      return;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  function getDialogContent() {
    if (mode === "create") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>
              Agregar nuevo departamento en{" "}
              <span className="font-bold">{company?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo departamento. Haz click en agregar una
              vez que termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="name" className="text-right col-span-2">
                Departamento:
              </Label>
              <Input
                onChange={(e) => setNewDepartment(e.target.value)}
                id="name"
                value={newDepartment}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4"></div>
          </div>
          <DialogFooter className="flex flex-row justify-end items-end">
            <Button
              className="bg-neutral-600 hover:bg-neutral-700"
              onClick={handleSubmit}
              type="submit"
              disabled={!newDepartment || loading}
            >
              Agregar
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (mode === "delete") {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="mt-1">
              Eliminar departamento: {departmentName}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este departamento?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white mt-5"
              onClick={handleSubmit}
              type="submit"
              disabled={loading}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </>
      );
    }
  }

  return (
    <Dialog
      onOpenChange={() => {
        setNewDepartment("");
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className={`${
            mode === "create" &&
            "bg-neutral-600 hover:bg-neutral-700 text-white hover:text-white"
          }
            ${
              mode === "delete" &&
              "bg-red-600 hover:bg-red-700 text-white hover:text-white"
            }`}
          onClick={() => setIsOpen(true)}
          variant={`${mode === "delete" ? "ghost" : "outline"}`}
          disabled={mode === "create" && !company}
        >
          {mode === "create" && "Agregar departamento"}
          {mode === "delete" && "Eliminar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogClose asChild={true}>
          <XIcon
            className="absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </DialogClose>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
