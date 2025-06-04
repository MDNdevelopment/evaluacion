import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export const DeleteEmployeeDialog = ({
  employeeName,
  employeeId,
  handleDeleteEmployee,
  isDeleteEmployeeDialogOpen,
  setIsDeleteEmployeeDialogOpen,
}: {
  employeeName: string;
  employeeId: string | null;
  handleDeleteEmployee: (id: string) => void;
  isDeleteEmployeeDialogOpen: boolean;
  setIsDeleteEmployeeDialogOpen: (val: boolean) => void;
}) => {
  const handleCloseDialog = () => {
    setIsDeleteEmployeeDialogOpen(false);
  };
  return (
    <Dialog
      open={isDeleteEmployeeDialogOpen}
      onOpenChange={setIsDeleteEmployeeDialogOpen}
    >
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
              if (!employeeId) return;
              await handleDeleteEmployee(employeeId);
              handleCloseDialog();
            }}
            type="button"
            className="bg-red-600 hover:bg-red-700"
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
