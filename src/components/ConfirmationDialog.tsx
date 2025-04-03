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
import { XIcon } from "lucide-react";
import { useState } from "react";

export function ConfirmationDialog({
  triggerText,
  title,
  description,
  confirmText,
  handleSubmit,
}: {
  triggerText: any;
  title: string;
  description: string;
  confirmText: string;
  handleSubmit: (extraData: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="mr-3" asChild>
        <Button
          className="text-sm font-light py-1 px-2 bg-red-700 hover:bg-red-800 text-white hover:text-white mt-3"
          onClick={() => setIsOpen(true)}
          variant="outline"
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden ">
        <div className="flex flex-row items-start ">
          <DialogHeader>
            <DialogTitle className="mt-1">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogClose asChild={true}>
            <XIcon
              className="flex flex-row  absolute right-5 top-5 cursor-pointer text-sm"
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
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
