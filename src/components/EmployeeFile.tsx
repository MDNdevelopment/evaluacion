import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import ToolTip from "./ToolTip";

export default function EmployeeFile({
  isFileOpen,
  setIsFileOpen,
  employeeData,
}: {
  isFileOpen: boolean;
  setIsFileOpen: (val: boolean) => void;
  employeeData: any;
}) {
  const [copyText, setCopyText] = useState("Copiar");
  const user = useUserStore((state) => state.user);
  const [toolTip, setToolTip] = useState({
    show: false,
    position: { top: 0, left: 0 },
    text: "",
  });

  function handleClickItem(data: string) {
    navigator.clipboard.writeText(data);
    setCopyText("¡Copiado!");
    setTimeout(() => {
      setCopyText("Copiar");
    }, 2000);
  }
  return (
    <Dialog open={isFileOpen} onOpenChange={setIsFileOpen}>
      <DialogTrigger className="bg-green-600 w-full" onClick={() => {}} asChild>
        <button className="group rounded-lg bg-white hover:bg-neutral-100 border  p-2 transition-all ease-linear w-fit px-5 mx-auto  shadow-sm border-[#00000018]  flex flex-row items-center justify-center gap-2">
          Información
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden max-h-[70vh] overflow-y-hidden  flex flex-col  w-90 rounded-lg">
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

        <div className=" overflow-y-auto ">
          <ul className="flex flex-col gap-0  ">
            {Object.entries(employeeData).map(([key, value], index) => {
              const val = value as {
                title: string;
                data: string;
                difference?: string;
                admin: boolean;
              };

              if (user && user?.access_level < 2 && val.admin) {
                return null;
              }
              return (
                <li
                  key={key}
                  className={` flex flex-row ${
                    index % 2 === 0 ? "bg-white" : "bg-neutral-100"
                  }  py-3 px-5 justify-between `}
                >
                  <div className="font-medium flex items-center justify-center">
                    {val.title}:
                  </div>
                  <div className="text-right flex flex-col items-end p-1">
                    <div className="relative flex justify-center  ">
                      <span
                        onMouseEnter={(e) => {
                          //get the text inside the span
                          const text = e.currentTarget.innerText;

                          if (text === "") {
                            return;
                          }
                          const rect = e.currentTarget.getBoundingClientRect();
                          setToolTip({
                            show: true,
                            position: {
                              top: rect.top - 28,
                              left: rect.left + rect.width / 2,
                            },
                            text: val.data,
                          });
                          setCopyText("Copiar");
                        }}
                        onMouseLeave={() => {
                          setToolTip({
                            show: false,
                            position: { top: 0, left: 0 },
                            text: "",
                          });
                        }}
                        onClick={() => {
                          handleClickItem(val.data);
                        }}
                        className={` w-fit px-2 rounded-lg border border-transparent  text-sm ${
                          val.data !== "" &&
                          "hover:border hover:border-neutral-300  cursor-pointer"
                        }`}
                      >
                        {val.data}
                        {/* <div className="flex justify-center items-center">
                          <span className="opacity-0 group-hover:opacity-100 absolute bottom-8 bg-white rounded-lg border border-neutral-200 px-2 transition-all ease-linear">
                            {copyText}
                          </span>
                        </div> */}
                        <ToolTip
                          show={toolTip.show}
                          position={toolTip.position}
                        >
                          {copyText}
                        </ToolTip>
                      </span>
                    </div>

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
