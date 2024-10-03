import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import formatDateForDisplay from "../utils/formatDateForDisplay";
import { useUserStore } from "../stores/useUserStore";

interface Director {
  name: string;
  evaluationDate: string;
  note: string;
}

export default function RecentEvaluations({ evaluationsData }: any) {
  console.log({ dataaaaa: evaluationsData });
  const user = useUserStore((state) => state.user);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getDirectorsNames = async () => {
    const fetchedDirectors: Director[] = [];

    for (const directorList of evaluationsData.made_by) {
      console.log({ directorList });
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
        note: director.note,
      };

      // Add new director to the list
      fetchedDirectors.push(newDirector);
    }

    console.log({ fetchedDirectors });
    setDirectors(fetchedDirectors);
    setLoading(false); // Stop loading
  };

  //Get the name of every director that has evaluated this employee
  useEffect(() => {
    if (evaluationsData && evaluationsData.made_by) {
      getDirectorsNames();
    }
  }, [evaluationsData]);

  if (directors.length === 0) {
    return <></>;
  }
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
                  className="flex flex-col w-2/5 py-2 px-5 rounded-md justify-between items-center  bg-[#f8f8f8] border border-[#f5f5f5] my-1 shadow-sm"
                  key={index}
                >
                  <div className="flex w-full mt-3 justify-between items-center">
                    {user && user.privileges > 2 ? (
                      <h4>{director.name}</h4>
                    ) : null}
                    <h5>{formatDateForDisplay(director.evaluationDate)}</h5>
                  </div>
                  <div className="flex w-full mt-3 justify-between items-center">
                    <p className="text-[#5f5f5f]">{director.note}</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
