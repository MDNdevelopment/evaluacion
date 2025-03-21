import { useEffect, useState } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyOptions } from "../components/CompanyOptions";
import CompanyConfig from "@/components/CompanyConfig";
import CompanyDownload from "@/components/CompanyDownload";
import CompanyDepartments from "@/components/CompanyDepartments";
import CompanyEmployees from "@/components/CompanyEmployees";
import CompanyQuestions from "@/components/CompanyQuestions";
import { shallow } from "zustand/shallow";

export default function Company() {
  const company = useCompanyStore((state) => state.company, shallow);
  const [logoIsLoading, setLogoIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(0);

  useEffect(() => {
    console.log("COMPANY RE RENDERED");
  }, []);

  const renderSelectedOption = () => {
    if (company) {
      switch (selectedOption) {
        case 0:
          return <CompanyConfig />;
        case 1:
          return <CompanyDownload />;
        case 2:
          return <CompanyDepartments company={company} />;
        case 3:
          return <CompanyEmployees />;
        case 4:
          return <CompanyQuestions company={company} />;
        default:
          return <CompanyConfig />;
      }
    }
  };
  if (company === null) {
    return <p>Loading company...</p>;
  }

  return (
    <div className="max-w-[1200px] pt-10 mx-auto flex flex-col ">
      <div className="flex flex-row items-stretch  ">
        <div className="h-full flex flex-0.3 flex-col  justify-start border-r border-r-gray-300 pr-5 pb-20">
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
          {renderSelectedOption()}
        </div>
      </div>
      {/* I want to show a spinner while the image loads, and when it finally loads show the image and hide the spinner */}
    </div>
  );
}
