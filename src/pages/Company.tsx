import { useState } from "react";
import { useCompanyStore } from "@/stores/useCompanyStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Company() {
  const company = useCompanyStore((state) => state.company);
  const [logoIsLoading, setLogoIsLoading] = useState(true);

  if (!company) {
    return <h1>NO company found</h1>;
  }
  return (
    <>
      <h1>{company.name}</h1>
      <h2>{company.created_at}</h2>
      <h2>{company.owner_user_id}</h2>

      {/* I want to show a spinner while the image loads, and when it finally loads show the image and hide the spinner */}
      <div className="w-[300px] h-[300px] overflow-hidden rounded-full">
        {logoIsLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img
            src={company.logo_url}
            alt="Company Logo"
            onLoad={() => setLogoIsLoading(false)}
          />
        )}
      </div>
    </>
  );
}
