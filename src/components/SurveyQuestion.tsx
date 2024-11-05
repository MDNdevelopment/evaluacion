import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  question: string;
  name: string;
  value: number | null;
  isLoading: boolean;
  desc: string;
  autoFilledVal: number | null;
  setAutoFilledVal: (val: number | null) => void;
}

export default function SurveyQuestion({
  question,
  name,
  value,
  isLoading,
  desc,
  autoFilledVal,
  setAutoFilledVal,
}: Props) {
  const { setValue } = useFormContext();
  const [answer, setAnswer] = useState<number | null>(null);
  const [abstention, setAbstention] = useState<boolean>(false);

  const setSelectedValue = (value: number) => {
    setAnswer(value);
    setValue(name, value);
    setAutoFilledVal(null);
  };

  useEffect(() => {
    if (value === null && autoFilledVal === null && answer === null) {
      setAnswer(5);
      setValue(name, 5);
      return;
    }

    if (value !== null) {
      setAnswer(value);
    }

    if (autoFilledVal) {
      setAnswer(autoFilledVal);
      setValue(name, autoFilledVal);
      setAbstention(false);
    }

    if (autoFilledVal === null && answer !== null) {
      setValue(name, answer);
    }
  }, [value, autoFilledVal]);
  return (
    <div className="flex flex-row justify-around items-center border-t py-3 border-gray-300 ">
      <div className=" w-1/5">
        <p className="  mr-5 font-black text-gray-900 leading-5 mb-1">
          {question}
        </p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex flex-row">
          {[...Array(10).keys()].map((option) => {
            const currentValue = option + 1;
            return (
              <div
                key={currentValue + 1}
                onClick={() => {
                  // If Value is not null,
                  if (value !== null || isLoading || abstention) return;
                  setSelectedValue(currentValue);
                }}
                className={`${
                  currentValue === answer || currentValue === autoFilledVal
                    ? "bg-primary text-white border-primary"
                    : value !== null || abstention
                    ? "bg-[#a7a7a7] text-white border-[#a7a7a7] opacity-30"
                    : "bg-white text-black hover:bg-gray-200"
                }  mx-2 w-[40px] h-[40px] rounded-full flex justify-center items-center border-2  text-md ${
                  value !== null || abstention
                    ? "cursor-not-allowed border-[#a7a7a7] "
                    : "cursor-pointer border-primary"
                } `}
              >
                <p className=" font-bold">{currentValue}</p>
              </div>
            );
          })}
        </div>
        {value === null && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => {
                setAbstention((state) => !state);
                setAnswer(5);
                setSelectedValue(5);
              }}
              className={`px-2 py-1 border text-xs rounded-md ${
                abstention
                  ? "text-red-500 border-red-500 bg-white hover:border-red-700 hover:text-red-700 "
                  : "bg-red-500  text-white   border-red-500 hover:bg-red-700"
              } `}
            >
              Abstenerse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
