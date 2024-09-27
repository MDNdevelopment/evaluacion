import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import formatDateForDisplay from "../utils/formatDateForDisplay";

interface Director {
  name: string;
  evaluationDate: string;
}

export default function RecentEvaluations({ evaluationsData }: any) {
  console.log({ data: evaluationsData });
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getDirectorsNames = async () => {
    const fetchedDirectors: Director[] = [];

    for (const directorList of evaluationsData.made_by) {
      const director = directorList[0]; // Access the first element in the array

      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("user_id", director.user)
        .single();

      if (error) {
        console.error(error.message);
        continue; // Skip this iteration on error
      }

      const newDirector: Director = {
        name: `${data.first_name} ${data.last_name}`,
        evaluationDate: director.date,
      };

      // Add new director to the list
      fetchedDirectors.push(newDirector);
    }

    setDirectors(fetchedDirectors);
    setLoading(false); // Stop loading
  };

  //Get the name of every director that has evaluated this employee
  useEffect(() => {
    if (evaluationsData && evaluationsData.made_by) {
      getDirectorsNames();
    }
  }, [evaluationsData]);
  return (
    <>
      <div className="mt-10">
        <h2 className="text-slate-800 text-3xl uppercase font-black mb-5">
          Evaluaciones recientes:
        </h2>

        <div className="w-full rounded-lg  min-h-11">
          <ul className="flex flex-col  flex-wrap">
            {directors &&
              !loading &&
              directors.map((director, index) => (
                <li
                  className="flex w-2/5 py-2 px-5 rounded-md justify-between items-center  bg-[#f8f8f8] border border-[#f5f5f5] my-1 shadow-sm"
                  key={index}
                >
                  <h4>{director.name}</h4>
                  <h5>{formatDateForDisplay(director.evaluationDate)}</h5>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
