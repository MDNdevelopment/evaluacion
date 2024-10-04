import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  question: string;
  name: string;
  value: number | null;
  isLoading: boolean;
  desc: string;
}

export default function SurveyQuestion({
  question,
  name,
  value,
  isLoading,
  desc,
}: Props) {
  const { setValue } = useFormContext();
  const [answer, setAnswer] = useState<number>(1);

  const setSelectedValue = (value: number) => {
    setAnswer(value);
    setValue(name, value);
  };

  useEffect(() => {
    if (value === null) {
      setAnswer(1);
      setValue(name, 1);
      return;
    }
    setAnswer(value);
  }, [value]);
  return (
    <div className="flex flex-row justify-around items-center border-t py-3 border-gray-300 ">
      <div className=" w-1/5">
        <p className="  mr-5 font-black text-gray-900 leading-5 mb-1">
          {question}
        </p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>

      <div className="flex flex-row">
        {[...Array(10).keys()].map((option) => {
          const currentValue = option + 1;
          return (
            <div
              key={currentValue + 1}
              onClick={() => {
                // If Value is not null,
                if (value !== null || isLoading) return;
                setSelectedValue(currentValue);
              }}
              className={`${
                currentValue === answer
                  ? "bg-primary text-white"
                  : value !== null
                  ? "bg-[#a7a7a7] text-white border-[#a7a7a7] opacity-30"
                  : "bg-white text-black hover:bg-gray-200"
              }  mx-2 w-[40px] h-[40px] rounded-full flex justify-center items-center border-2 border-primary text-md ${
                value !== null ? "cursor-not-allowed" : "cursor-pointer"
              } `}
            >
              <p className=" font-bold">{currentValue}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
