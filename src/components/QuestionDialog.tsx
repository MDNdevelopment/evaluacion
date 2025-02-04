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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CategorySelector } from "./CategorySelector";
import { supabase } from "@/services/supabaseClient";
import { PositionSelector } from "./PositionSelector";
import { DialogClose } from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

export function QuestionDialog({
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");

  const handleSubmit = async () => {
    const { error } = await supabase.from("questions").insert({
      text: newQuestion,
      position: selectedPosition,

      category_id: selectedCategory,
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
      open={isOpen}
      onOpenChange={() => {
        setNewQuestion("");
        setSelectedCategory(null);
        setSelectedPosition(null);
      }}
    >
      <DialogTrigger className="ml-3" asChild>
        <Button onClick={() => setIsOpen(true)} variant="outline">
          Agregar pregunta
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
          <DialogTitle>
            Agregar nueva pregunta en {departmentName} categoría{" "}
          </DialogTitle>
          <DialogDescription>
            Selecciona la categoría e ingresa la pregunta. Haz click en guardar
            una vez que termines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <div className="grid gap-4 py-4>">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Categoría
              </Label>
              <CategorySelector
                companyId={company.id}
                departmentId={departmentId}
                setSelectedCategory={setSelectedCategory}
                selectedPosition={selectedPosition}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Pregunta
            </Label>
            <Input
              onChange={(e) => setNewQuestion(e.target.value)}
              id="name"
              value={newQuestion}
              className={`col-span-3 ${
                selectedCategory === null || selectedPosition === null
                  ? "bg-gray-200"
                  : ""
              }`}
              disabled={selectedCategory === null || selectedPosition === null}
            />
          </div>
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
