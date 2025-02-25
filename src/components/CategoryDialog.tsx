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
import { PositionSelector } from "./PositionSelector";
import { toast } from "react-toastify";

export function CategoryDialog({
  departmentId,
  departmentName,
  company,
  setIsLoading,
  isLoading,
}: {
  departmentId: string;
  departmentName: string;
  company: any;
  setIsLoading: any;
  isLoading: boolean;
}) {
  const [newCategory, setNewCategory] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [categoriesCounter, setCategoriesCounter] = useState<number>(0);
  const handleSubmit = async () => {
    console.log(selectedPosition);
    if (selectedPosition === null) {
      console.log("position cannot be null");
      return;
    }
    //Insert the new category into the categories table
    const { data: categoryData, error: errorCategory } = await supabase
      .from("categories")
      .insert({
        name: newCategory,
        department_id: departmentId,
        company_id: company.id,
      })
      .select();

    if (errorCategory) {
      console.log(errorCategory.message);
      return;
    }

    //Insert the new relationship between the new category and the selected position into the position_categories table
    const { error: errorPositionCategories } = await supabase
      .from("positions_categories")
      .insert({
        position_id: selectedPosition,
        category_id: categoryData[0].id,
      });

    if (errorPositionCategories) {
      console.log(errorPositionCategories.message);
      return;
    }

    setNewCategory("");
    toast.success("Categoría agregada con éxito", {
      position: "bottom-right",
      autoClose: 1500,
    });
    setCategoriesCounter(categoriesCounter + 1);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (categoriesCounter > 0) setIsLoading(true);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [isLoading]);

  return (
    <Dialog
      onOpenChange={() => {
        setNewCategory("");
        setSelectedPosition(null);
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} variant="outline">
          Agregar categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogClose asChild={true}>
          <XIcon
            className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
            onClick={handleClose}
          />
        </DialogClose>
        <div className="flex flex-row items-start">
          <DialogHeader>
            <DialogTitle>
              Agregar nueva categoría en {departmentName}
            </DialogTitle>
            <DialogDescription>
              Selecciona el cargo e ingresa el nombre de la nueva categoría. Haz
              click en guardar una vez que termines.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-4 py-4>">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Cargo
            </Label>

            <PositionSelector
              companyId={company.id}
              departmentId={departmentId}
              setSelectedPosition={setSelectedPosition}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Categoría
          </Label>
          <Input
            onChange={(e) => setNewCategory(e.target.value)}
            id="name"
            value={newCategory}
            className={`col-span-3 ${
              selectedPosition === null ? "bg-gray-200" : ""
            }`}
            disabled={selectedPosition === null}
          />
        </div>
        <DialogFooter className="flex flex-row justify-end items-end">
          <Button onClick={handleSubmit} type="submit">
            Agregar
          </Button>
          <Button
            onClick={handleClose}
            className="bg-darkText hover:bg-darkText-darker"
          >
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
