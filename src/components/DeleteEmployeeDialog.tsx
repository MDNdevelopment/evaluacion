import { useState } from "react";
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
import { FaTrash } from "react-icons/fa";

export const DeleteEmployeeDialog = ({
  employeeName,
  employeeId,
  handleDeleteEmployee,
}: {
  employeeName: string;
  employeeId: string;
  handleDeleteEmployee: (id: string) => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger onClick={handleOpenDialog} asChild>
        <Button variant="outline" className="text-red-700 hover:text-red-800">
          <FaTrash size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Eliminar empleado</DialogTitle>
          <DialogDescription>
            Estás seguro de que deseas eliminar al empleado:{" "}
            <span className="font-bold text-darkText">{employeeName}</span>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={async () => {
              await handleDeleteEmployee(employeeId);
              handleCloseDialog();
            }}
            type="button"
          >
            Eliminar
          </Button>
          <Button
            onClick={() => handleCloseDialog()}
            type="submit"
            variant={"outline"}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
