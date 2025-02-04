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

export function PositionDialog({
  departmentId,
  departmentName,
  company,
  setIsLoading,
}: {
  departmentId: string;
  departmentName: string;
  company: any;
  setIsLoading: any;
}) {
  const [newPosition, setNewPosition] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    const { error } = await supabase.from("positions").insert({
      name: newPosition,
      department_id: departmentId,
      company_id: company.id,
    });

    if (error) {
      console.log(error.message);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);
  };

  return (
    <Dialog
      onOpenChange={() => {
        setNewPosition("");
      }}
      open={isOpen}
    >
      <DialogTrigger className="mr-3" asChild>
        <Button onClick={() => setIsOpen(true)} variant="outline">
          Agregar Cargo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogClose asChild={true}>
          <XIcon
            className="flex flex-row justify-self-end cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Agregar nuevo cargo en {departmentName}</DialogTitle>
          <DialogDescription>
            Ingresa el nombre del nuevo cargo. Haz click en guardar una vez que
            termines.
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
        <DialogFooter>
          <Button onClick={handleSubmit} type="submit">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
