import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { FaFileAlt } from "react-icons/fa";

export default function EmployeeFile({
  isFileOpen,
  setIsFileOpen,
  employeeData,
}: {
  isFileOpen: boolean;
  setIsFileOpen: (val: boolean) => void;
  employeeData: any;
}) {
  return (
    <Dialog open={isFileOpen} onOpenChange={setIsFileOpen}>
      <DialogTrigger onClick={() => {}} asChild>
        <button className="group rounded-full bg-white hover:bg-primary-dark border-2 border-primary-dark p-2 transition-all ease-linear">
          <FaFileAlt
            className="text-primary-dark group-hover:text-white"
            size={25}
          />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden max-h-[70vh] overflow-y-hidden  flex flex-col">
        <DialogHeader>
          <DialogClose asChild={true}>
            <XIcon
              className=" absolute top-3 right-3 flex flex-row justify-self-end cursor-pointer"
              onClick={() => {
                setIsFileOpen(false);
              }}
            />
          </DialogClose>
          <DialogTitle className="mb-2">Ficha del empleado</DialogTitle>
        </DialogHeader>

        <div>
          <ul className="flex flex-col gap-0">
            {Object.entries(employeeData).map(([key, value], index) => {
              const val = value as {
                title: string;
                data: string;
                difference?: string;
              };
              return (
                <li
                  key={key}
                  className={` flex flex-row ${
                    index % 2 === 0 ? "bg-white" : "bg-neutral-100"
                  }  py-3 px-5 justify-between `}
                >
                  <div className="font-medium">{val.title}:</div>
                  <div className="text-right flex flex-col">
                    <span>{val.data}</span>
                    {val.difference && (
                      <span className="text-sm text-gray-500 ml-2">
                        {val.difference}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
