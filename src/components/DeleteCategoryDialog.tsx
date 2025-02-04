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
import { useEffect, useState } from "react";

export function DeleteCategoryDialog({
  categoryId,
  setIsLoading,
  isLoading,
  categoryName,
}: {
  categoryId: number;
  setIsLoading: any;
  isLoading: boolean;
  categoryName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async () => {
    const responseDeleteCategory = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (responseDeleteCategory.error) {
      console.log(responseDeleteCategory.error.message);
      return;
    }

    // const responseDeleteQuestions = await supabase
    //   .from("questions")
    //   .delete()
    //   .eq("category_id", categoryId);

    // if (responseDeleteQuestions.error) {
    //   console.log(responseDeleteQuestions.error.message);
    //   return;
    // }

    setIsLoading(true);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [isLoading]);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <XIcon
          className="flex flex-row justify-self-end cursor-pointer text-red-700"
          onClick={() => setIsOpen(true)}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden ">
        <div className="flex flex-row items-start ">
          <DialogHeader>
            <DialogTitle className="mt-5">
              Eliminar categoría: {categoryName}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría?
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
