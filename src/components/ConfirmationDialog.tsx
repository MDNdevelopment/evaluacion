import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useState } from "react";

export function ConfirmationDialog({
  triggerText,
  confirmText,
  handleSubmit,
  children,
  mode = "confirm",
}: {
  triggerText: any;
  confirmText: string;
  handleSubmit: (extraData: any) => void;
  children: React.ReactNode;
  mode?: "delete" | "confirm" | "add";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger className="mr-3" asChild>
        <Button
          className={`text-sm font-light py-1 px-2 text-white hover:text-white mt-3 ${
            mode === "delete"
              ? "bg-red-700 hover:bg-red-800"
              : "bg-green-700 hover:bg-green-800"
          }`}
          onClick={() => setIsOpen(true)}
          variant="outline"
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden ">
        <div className="flex flex-row items-start ">
          <DialogHeader>
            {/* <DialogTitle className="mt-1">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription> */}
            {children}
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
            className={` text-white mt-5 ${
              mode === "delete"
                ? "bg-red-700 hover:bg-red-800"
                : "bg-green-700 hover:bg-green-800"
            }`}
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
