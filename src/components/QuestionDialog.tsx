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
import { useEffect, useState } from "react";
import { PositionSelector } from "./PositionSelector";
import { DialogClose } from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Company, Position } from "@/types";
import { FormProvider, useForm } from "react-hook-form";
import { supabase } from "@/services/supabaseClient";
import { toast } from "react-toastify";
import { FaPencilAlt } from "react-icons/fa";

export function QuestionDialog({
  company,
  positions,
  setFetchingQuestions,
  questionId = null,
}: {
  company: Company;
  positions: { [key: string]: Position[] };
  setFetchingQuestions: React.Dispatch<React.SetStateAction<boolean>>;
  questionId?: number | null;
}) {
  const methods = useForm({
    defaultValues: {
      question: "",
      positions: [],
      tags: "",
    },
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [markedPositions, setMarkedPositions] = useState<number[]>([]);

  const [savedText, setSavedText] = useState("");
  const [savedTags, setSavedTags] = useState<string[]>([]);
  const [savedPositions, setSavedPositions] = useState<number[]>([]);
  const [uploadingData, setUploadingData] = useState(false);

  const fetchQuestion = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select(
        "*, positions:question_positions(position_id), tags:question_tags(tag)"
      )
      .eq("id", questionId)
      .single();
    if (error) {
      console.log(error.message);
      return;
    }
    methods.setValue("question", data.text);
    setSavedText(data.text);
    const tagsArray = data.tags.map((tag: any) => {
      return tag.tag;
    });

    setSavedTags(tagsArray);
    methods.setValue("tags", tagsArray.join(", "));
    const positionsArray = data.positions.map(
      (position: { position_id: number }) => position.position_id
    );

    setMarkedPositions(positionsArray);
    setSavedPositions(positionsArray);
  };

  useEffect(() => {
    if (questionId && isOpen) {
      //The user is editing a question
      fetchQuestion();
    }
    return;
  }, [questionId, isOpen]);

  var isValid = !(
    methods.watch("question") === "" || methods.watch("positions").length === 0
  );

  var sameText = methods.watch("question") === savedText;
  var samePositions =
    JSON.stringify(methods.watch("positions").sort((a, b) => a - b)) ===
    JSON.stringify(savedPositions.sort((a, b) => a - b));
  var sameTags =
    savedTags.join(", ").toLowerCase() === methods.watch("tags").toLowerCase();

  var isTheSame = sameText && samePositions && sameTags;

  const handleCreateQuestion = async (data: any) => {
    // insert question into the database
    const { data: questionResult, error } = await supabase
      .from("questions")
      .insert({
        text: data.question,
        company_id: company.id,
      })
      .select()
      .single();

    if (error) {
      console.log(error.message);
      toast.error("Error al agregar la pregunta - EP01");
      return;
    }

    const tagsList = convertTags(data.tags);

    //insert the tags into the tags table
    tagsList.forEach(async (tag: string) => {
      const { error: tagError } = await supabase.from("question_tags").insert({
        tag: tag,
        question_id: questionResult.id,
      });

      if (tagError) {
        console.log(tagError.message);
        toast.error("Error al agregar la pregunta - EP03");
        return;
      }
    });

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
      autoClose: 1000,
    });
  };

  const handleUpdateQuestion = async (data: any) => {
    // update question in the database
    const newPositions = data.positions;
    const newText: string = data.question;
    const newTags = convertTags(data.tags);

    if (newText !== savedText) {
      //update the question's text
      const { error: textError } = await supabase
        .from("questions")
        .update({
          text: newText,
        })
        .eq("id", questionId);

      if (textError) {
        console.log(textError.message);
        toast.error("Error al actualizar la pregunta - AP-01");
        return;
      }
    }

    if (JSON.stringify(newTags) !== JSON.stringify(savedTags)) {
      const removeTags = savedTags.filter((tag) => newTags.indexOf(tag) === -1);
      const addTags = newTags.filter((tag) => savedTags.indexOf(tag) === -1);

      //delete tags
      removeTags.forEach(async (tag: string) => {
        const response = await supabase
          .from("question_tags")
          .delete()
          .eq("tag", tag)
          .eq("question_id", questionId);

        if (response.error) {
          console.log(response.error.message);
          toast.error("Error al actualizar la pregunta - AP-03");
          return;
        }
      });

      //add tags
      addTags.forEach(async (tag: string) => {
        const { error } = await supabase.from("question_tags").insert({
          tag: tag,
          question_id: questionId,
        });

        if (error) {
          console.log(error.message);
          toast.error("Error al actualizar la pregunta - AP-02");
          return;
        }
      });
    }

    if (
      JSON.stringify(newPositions.sort((a: number, b: number) => a - b)) !==
      JSON.stringify(markedPositions.sort((a, b) => a - b))
    ) {
      const removePositions = markedPositions.filter(
        (position: any) => newPositions.indexOf(position) === -1
      );
      const addPositions = newPositions.filter(
        (position: any) => markedPositions.indexOf(position) === -1
      );

      console.log({ removePositions, addPositions });

      //delete positions
      removePositions.forEach(async (position: number) => {
        const response = await supabase
          .from("question_positions")
          .delete()
          .eq("position_id", position)
          .eq("question_id", questionId);

        if (response.error) {
          console.log(response.error.message);
          toast.error("Error al actualizar la pregunta - AP-05");
          return;
        }
      });

      //add positions
      addPositions.forEach(async (position: any) => {
        const { error } = await supabase.from("question_positions").insert({
          position_id: position,
          question_id: questionId,
        });

        if (error) {
          console.log(error.message);
          toast.error("Error al actualizar la pregunta - AP-06");
          return;
        }
      });
    }

    toast.success("Pregunta actualizada correctamente", {
      position: "bottom-right",
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (data: {
    question: string;
    positions: number[];
    tags: string;
  }) => {
    setUploadingData(true);
    if (questionId) {
      await handleUpdateQuestion(data);
    } else {
      await handleCreateQuestion(data);
    }

    await setTimeout(() => {
      setFetchingQuestions(true);
      setIsOpen(false);
      setUploadingData(false);
      methods.setValue("question", "");
      methods.setValue("tags", "");
      methods.setValue("positions", []);
    }, 500);
    return;
  };

  function convertTags(tags: string) {
    let tagsList = tags.split(",").filter((tag: string) => tag.trim() !== "");
    tagsList = tagsList.map((tag: string) => {
      tag = tag.trim();
      return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    });

    return tagsList;
  }

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        {!questionId ? (
          <Button
            variant="outline"
            className="cursor-pointer w-fit"
            onClick={() => setIsOpen(true)}
          >
            Agregar pregunta
          </Button>
        ) : (
          <Button
            className="text-sm font-light py-1 px-2 bg-gray-700 hover:bg-gray-800 text-white hover:text-white mt-3"
            onClick={() => setIsOpen(true)}
            variant="outline"
          >
            {<FaPencilAlt />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1125px] [&>button]:hidden max-h-[50rem] overflow-y-scroll ">
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

              <Label htmlFor="name" className="text-right">
                Tags{" "}
                <span className="text-gray-400 italic text-xs">(opcional)</span>
              </Label>
              <Input
                placeholder="Escribe los tags separados por comas. Ejemplo: diseño, jefes, etc."
                className={`col-span-3 border-2 border-gray-400`}
                {...methods.register("tags")}
              />
              <div className="">
                {/* Select the positions where the question will be available */}
                <PositionSelector
                  markedPositions={markedPositions}
                  positions={positions}
                />
              </div>

              <DialogFooter className="flex flex-row justify-end items-end">
                <div className="flex flex-row justify-center ">
                  <Button
                    className={`mx-2 ${
                      isValid && !isTheSame && !uploadingData
                        ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }  text-white rounded-md py-1 px-3 hover:text-white ease-linear transition-all`}
                    type="submit"
                    disabled={!isValid || isTheSame || uploadingData}
                  >
                    {questionId ? "Actualizar" : "Agregar"}
                  </Button>
                </div>
                <Button
                  onClick={handleClose}
                  className="bg-darkText hover:bg-darkText-darker"
                  type="button"
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
