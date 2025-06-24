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
import { supabase } from "@/services/supabaseClient";
import { XIcon } from "lucide-react";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { useState } from "react";
import { toast } from "react-toastify";

export function DeletePosition({
  positionName,
  positionId,
  setLoading,
}: {
  positionName: string | undefined;
  positionId: number | undefined;
  setLoading: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    //Check if there are employees in this position

    toast.success("Cargo eliminado con éxito", {
      position: "bottom-right",
      autoClose: 2000,
    });
    setLoading(true);
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="mr-3" asChild>
        <Button
          className="text-red-600 hover:text-red-600"
          onClick={() => setIsOpen(true)}
          variant="ghost"
        >
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden ">
        <div className="flex flex-row items-start ">
          <DialogHeader>
            <DialogTitle className="mt-1">
              Eliminar cargo: {positionName}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este cargo?
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild={true}>
            <XIcon
              className="flex flex-row justify-self-end cursor-pointer text-sm absolute top-0 right-0 mt-2 mr-2"
              onClick={() => setIsOpen(false)}
            />
          </DialogClose>
        </div>

        <DialogFooter>
          <Button
            className="bg-red-700 hover:bg-red-800 text-white mt-5"
            onClick={handleSubmit}
            type="submit"
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
