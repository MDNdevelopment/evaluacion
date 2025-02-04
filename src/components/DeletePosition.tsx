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
import { useState } from "react";

export function DeletePosition({
  positionName,
  positionId,
  setIsLoading,
  setSelectedDepartment,
  department,
}: {
  positionName: string | undefined;
  positionId: number | undefined;
  company: any;
  setIsLoading: any;
  setSelectedDepartment: any;
  department: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    //Get the categories related to the position
    const { data, error } = await supabase
      .from("positions_categories")
      .select("category_id")
      .eq("position_id", positionId);

    if (error) {
      console.log(error.message);
      return;
    }
    const relatedCategories = data.map((category) => category.category_id);

    // Delete the position
    const responsePosition = await supabase
      .from("positions")
      .delete()
      .eq("id", positionId);

    if (responsePosition) {
      console.log(responsePosition);
    }
    console.log({ positionId });

    // Cleanup orphaned categories
    const responseCategories = await supabase
      .from("categories")
      .delete()
      .in("id", [...relatedCategories]);

    if (responseCategories.error) {
      console.error(
        "Error cleaning up categories:",
        responseCategories.error.message
      );
      return;
    }
    setIsLoading(true);
    setIsOpen(false);
    setSelectedDepartment(department);

    console.log("Position and unused categories deleted successfully.");
  };
  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="mr-3" asChild>
        <Button
          className="text-sm font-light py-1 px-2 bg-red-700 hover:bg-red-800 text-white hover:text-white mt-3"
          onClick={() => setIsOpen(true)}
          variant="outline"
        >
          Eliminar cargo
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
              className="flex flex-row justify-self-end cursor-pointer text-sm"
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
