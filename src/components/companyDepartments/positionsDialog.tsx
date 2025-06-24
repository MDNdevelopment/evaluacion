import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface PositionsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mode: "edit" | "employees" | "positions";
}

export default function PositionsDialog({
  isOpen,
  setIsOpen,
  mode,
}: PositionsDialogProps) {
  function getDialogContent(mode: "edit" | "employees" | "positions") {
    switch (mode) {
      case "edit":
        return <></>;
      default:
        return null;
    }
  }
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[800px] [&>button]:hidden max-h-[50rem] overflow-y-auto ">
        <DialogClose asChild={true}>
          <XIcon
            className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Editar departamento</DialogTitle>
          <DialogDescription>
            Aquí puedes modificar el nombre del departmento junto con sus cargos
            asociados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Nombre del departamento</Label>
            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="username-1">Cargos</Label>
            <Input id="username-1" name="username" defaultValue="@peduarte" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
