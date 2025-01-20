import { useState } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyOptions } from "@/components/CompanyOptions";
import { COMPANY_OPTIONS } from "@/constants/companyOptions";

export default function Company() {
  const company = useCompanyStore((state) => state.company);
  const [logoIsLoading, setLogoIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(0);
  if (!company) {
    return <h1>NO company found</h1>;
  }
  return (
    <div className="max-w-[1200px] pt-10 mx-auto flex flex-col ">
      <div className="flex flex-row items-stretch  ">
        <div className="h-full flex flex-0.3 flex-col  justify-start border-r border-r-gray-300 pr-5 ">
          <div className="w-[100px] h-[100px] overflow-hidden rounded-full mb-5">
            <Skeleton
              className={`${logoIsLoading ? "block" : "hidden"} w-full h-full`}
            />
            <img
              src={company.logo_url}
              onLoad={() => {
                setLogoIsLoading(false);
              }}
            />
          </div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl">
            {company.name}
          </h1>
          <CompanyOptions setSelectedOption={setSelectedOption} />
        </div>
        <div className="flex flex-col  flex-1 pl-5">
          {COMPANY_OPTIONS[selectedOption].component()}
        </div>
      </div>
      {/* I want to show a spinner while the image loads, and when it finally loads show the image and hide the spinner */}
    </div>
  );
}
