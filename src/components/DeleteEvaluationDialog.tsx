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
import { toast } from "react-toastify";

export function DeleteEvaluationDialog({
  setIsOpenDelete,
  isOpenDelete,
  evaluationId,
  setIsOpenEvaluation,
  setTableIsLoading,
}: {
  setIsOpenDelete: (value: boolean) => void;
  isOpenDelete: boolean;
  evaluationId: number;
  setIsOpenEvaluation: (value: boolean) => void;
  setTableIsLoading: (value: boolean) => void;
}) {
  const handleDeleteEvaluation = async () => {
    const response = await supabase
      .from("evaluation_sessions")
      .delete()
      .eq("id", evaluationId);

    console.log(response);

    if (response.error) {
      console.log(response.error.message);
      return;
    }
    setIsOpenDelete(false);
    setIsOpenEvaluation(false);
    setTableIsLoading(true);

    toast.success("Evaluación eliminada con éxito", {
      position: "bottom-right",
    });
  };
  return (
    <Dialog open={isOpenDelete}>
      <DialogTrigger asChild>
        <Button
          className="border border-red-800 text-sm text-red-800 hover:bg-red-800 hover:text-white transition-all ease-linear"
          variant="outline"
          onClick={() => setIsOpenDelete(true)}
        >
          Eliminar evaluación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogClose asChild={true}>
          <XIcon
            className="flex flex-row justify-self-end cursor-pointer absolute right-3 top-3"
            onClick={() => setIsOpenDelete(false)}
          />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Eliminar evaluación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar esta evaluación?{" "}
            <span className="italic">Esta acción no se puede deshacer.</span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-3">
          <Button
            className="bg-white hover:bg-gray-100 transition-all ease-linear text-darkText border border-gray-300"
            type="submit"
            onClick={() => {
              setIsOpenDelete(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-red-800 hover:bg-red-900 transition-all ease-linear text-white"
            type="submit"
            onClick={() => {
              handleDeleteEvaluation();
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
