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
import { toast } from "react-toastify";

export function PositionDialog({
  departmentId,
  departmentName,
  company,
  setFetchDepartmentInfo,
  mode = "create",
  positionId,
  positionName,
}: {
  departmentId?: string;
  departmentName?: string;
  company?: any;
  setFetchDepartmentInfo: (value: boolean) => void;
  mode?: "edit" | "create" | "delete";
  positionId?: number;
  positionName?: string;
}) {
  const [newPosition, setNewPosition] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    console.log("submitting");
    setLoading(true);
    if (mode === "create") {
      const { error } = await supabase.from("positions").insert({
        position_name: newPosition,
        department_id: departmentId,
        company_id: company,
      });

      if (error) {
        console.log(error.message);
        setLoading(false);
        toast.error("Error al agregar el cargo. Inténtalo de nuevo.", {
          position: "bottom-right",
          autoClose: 5000,
        });
        return;
      }
    } else if (mode === "edit") {
      console.log("editing");
      console.log(positionId);
      const { error: editError } = await supabase
        .from("positions")
        .update({ position_name: newPosition.trim() })
        .eq("position_id", positionId);

      if (editError) {
        console.log(editError.message);
        setLoading(false);
        toast.error("Error al editar el cargo. Inténtalo de nuevo.", {
          position: "bottom-right",
          autoClose: 5000,
        });
        return;
      }
    } else if (mode === "delete") {
      const { data: employeesData, error: employeesError } = await supabase
        .from("users")
        .select("user_id.count()")
        .eq("position_id", positionId)
        .single();

      if (employeesError) {
        console.error(employeesError.message);
        toast.error(
          "Error al verificar empleados asignados. Inténtalo de nuevo.",
          {
            position: "bottom-right",
            autoClose: 5000,
          }
        );
        setLoading(false);
        return;
      }

      if (employeesData.count > 0) {
        toast.error(
          "No se puede eliminar el cargo porque tiene empleados asignados.",
          { position: "bottom-right", autoClose: 6000 }
        );

        setLoading(false);
        return;
      }
      // Delete the position
      const responsePosition = await supabase
        .from("positions")
        .delete()
        .eq("position_id", positionId);

      if (responsePosition.error) {
        console.log(responsePosition.error.message);

        setLoading(false);
        return;
      }
    }

    setNewPosition("");
    toast.success(
      mode === "create"
        ? "Cargo agregado con éxito"
        : mode === "edit"
        ? "Cargo editado con éxito"
        : "Cargo eliminado con éxito",
      {
        position: "bottom-right",
        autoClose: 2000,
      }
    );
    setFetchDepartmentInfo(true);
    console.log("im here");

    setIsOpen(false);
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
            <DialogTitle>Agregar nuevo cargo en {departmentName}</DialogTitle>
            <DialogDescription>
              Ingresa el nombre del nuevo cargo. Haz click en guardar una vez
              que termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Cargo:
              </Label>
              <Input
                onChange={(e) => setNewPosition(e.target.value)}
                id="name"
                value={newPosition}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4"></div>
          </div>
          <DialogFooter className="flex flex-row justify-end items-end">
            <Button
              className="bg-neutral-600 hover:bg-neutral-700"
              onClick={handleSubmit}
              type="submit"
              disabled={!newPosition || loading}
            >
              Agregar
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (mode === "edit") {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Editar cargo: {positionName}</DialogTitle>
            <DialogDescription>
              Ingresa el nuevo nombre del cargo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-5 items-center gap-4 ">
              <Label htmlFor="name" className="text-right col-span-2">
                Nuevo nombre:
              </Label>
              <Input
                onChange={(e) => setNewPosition(e.target.value)}
                id="name"
                value={newPosition}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4"></div>
          </div>
          <DialogFooter className="flex flex-row justify-end items-end">
            <Button
              className="bg-neutral-600 hover:bg-neutral-700"
              onClick={handleSubmit}
              type="submit"
              disabled={!newPosition || loading}
            >
              Editar
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
              Eliminar cargo: {positionName}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este cargo?
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
        setNewPosition("");
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button
          className={`${
            mode === "create" &&
            "bg-neutral-600 hover:bg-neutral-700 text-white hover:text-white"
          }
            ${mode === "edit" && "bg-transparent text-neutral-800 text-sm"}
            ${mode === "delete" && "text-red-600 hover:text-red-600"}`}
          onClick={() => setIsOpen(true)}
          variant={`${
            mode === "edit" || mode === "delete" ? "ghost" : "outline"
          }`}
          disabled={
            mode === "create" && (!departmentId || !departmentName || !company)
          }
        >
          {mode === "edit" && "Editar"}
          {mode === "create" && "Agregar cargo"}
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
