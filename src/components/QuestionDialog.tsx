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
import { PositionSelector } from "./PositionSelector";
import { DialogClose } from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Company, Position } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";

export function QuestionDialog({
  company,
  positions,
}: {
  company: Company;
  positions: { [key: string]: Position[] };
}) {
  const methods = useForm({
    defaultValues: {
      question: "",
      positions: null,
    },
  });

  console.log(company);
  const [_selectedPosition, setSelectedPosition] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [_newQuestion, setNewQuestion] = useState("");

  var isValid = !(
    methods.watch("question") === "" || methods.watch("positions") === null
  );

  const handleClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (data: any) => {
    // insert question into the database
    const { data: questionResult, error } = await supabase
      .from("questions")
      .insert({
        text: data.question,
      })
      .select()
      .single();

    if (error) {
      console.log(error.message);
      toast.error("Error al agregar la pregunta - EP01");
      return;
    }
    //insert the question-position relation into the question_positions table
    data.positions.forEach(async (position: number) => {
      const { error: positionError } = await supabase
        .from("question_positions")
        .insert({
          question_id: questionResult.id,
          position_id: position,
        });

      if (positionError) {
        console.log(positionError.message);
        toast.error("Error al agregar la pregunta - EP02");
        return;
      }
    });

    toast.success("Pregunta agregada correctamente", {
      position: "bottom-right",
    });
    methods.setValue("question", "");
    console.log(data);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setNewQuestion("");
        setSelectedPosition(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="bg-green-600 rounded-md py-1 px-3 text-white font-bold border-r-2 border-r-green-700 border-b-2 border-b-green-700  transition-all ease-linear text-md hover:bg-green-700 hover:text-white"
          onClick={() => setIsOpen(true)}
          variant="outline"
        >
          Agregar pregunta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1125px] [&>button]:hidden max-h-[50rem] overflow-y-scroll">
        <DialogClose asChild={true}>
          <XIcon
            className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
            onClick={handleClose}
          />
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Agregar nueva pregunta</DialogTitle>
          <DialogDescription>
            Ingresa la pregunta y escoge los cargos en los que va a aplicar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Label htmlFor="name" className="text-right">
                Pregunta
              </Label>
              <Input
                className={`col-span-3 border-2 border-gray-400`}
                {...methods.register("question")}
              />
              <div className="">
                {/* Select the positions where the question will be available */}
                <PositionSelector positions={positions} />
              </div>

              <div className="flex flex-row justify-center ">
                <button
                  className={`mx-2 ${
                    isValid
                      ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                      : "bg-gray-400 cursor-not-allowed"
                  }  text-white rounded-md py-1 px-3 hover:text-white ease-linear transition-all`}
                  type="submit"
                  disabled={!isValid}
                >
                  Agregar
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
        <DialogFooter className="flex flex-row justify-end items-end">
          <Button
            onClick={handleClose}
            className="bg-darkText hover:bg-darkText-darker"
          >
            Terminé
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
