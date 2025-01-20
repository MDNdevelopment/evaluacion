import { COMPANY_OPTIONS } from "@/constants/companyOptions";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@headlessui/react";
import Spinner from "./Spinner";

export function CompanyOptions({ setSelectedOption }: any) {
  const user = useUserStore((state) => state.user);
  if (!user) return <Spinner />;
  return (
    <div className="flex flex-col items-start mt-5">
      {COMPANY_OPTIONS.map((option, index) => {
        if (user.role === option.role || option.role === "employee") {
          return (
            <Button
              key={option.option}
              className="w-full text-left border rounded-md my-1.5 px-2 py-1 text-sm font-light shadow-sm hover:bg-gray-100 transition-all ease-in-out"
              onClick={() => setSelectedOption(index)}
            >
              {option.option}
            </Button>
          );
        }
      })}
    </div>
  );
}
