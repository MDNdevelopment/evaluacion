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
import { toast } from "react-toastify";

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
  const [questionsCounter, setQuestionsCounter] = useState<number>(0);

  const handleClose = () => {
    setIsOpen(false);
    if (questionsCounter > 0) setIsLoading(true);
  };

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

    setNewQuestion("");
    toast.success("Pregunta agregada con éxito", {
      position: "bottom-right",
      autoClose: 1500,
    });
    setQuestionsCounter(questionsCounter + 1);
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
            className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
            onClick={handleClose}
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
