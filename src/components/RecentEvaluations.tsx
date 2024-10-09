import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import formatDateForDisplay from "../utils/formatDateForDisplay";
import { useUserStore } from "../stores/useUserStore";
import RateCircle from "./RateCircle";
import Spinner from "./Spinner";

interface Director {
  name: string;
  evaluationDate: string;
  note: string;
  categories: number[];
}

export default function RecentEvaluations({ evaluationsData = null }: any) {
  const user = useUserStore((state) => state.user);
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

      console.log({ director });
      const newDirector: Director = {
        name: `${data.first_name} ${data.last_name}`,
        evaluationDate: director.date,
        note: director.note,
        categories: director.categories,
      };

      // Add new director to the list
      fetchedDirectors.push(newDirector);
    }

    setDirectors(fetchedDirectors);
    setLoading(false); // Stop loading
  };

  //Get the name of every director that has evaluated this employee
  useEffect(() => {
    console.log({ evaluationsData });
    if (evaluationsData && evaluationsData.made_by) {
      getDirectorsNames();
    }
  }, [evaluationsData]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center mt-5">
        <Spinner />
      </div>
    );
  }

  if (directors.length === 0 || evaluationsData === null) {
    return <></>;
  }
  return (
    <>
      <div className="mt-10">
        <h2 className="text-slate-800 text-3xl uppercase font-black mb-5">
          Evaluaciones recientes:
        </h2>

        <div className="w-full rounded-lg  min-h-11">
          <ul className="flex flex-row justify-center  flex-wrap ">
            {directors &&
              !loading &&
              directors.map((director, index) => (
                <li
                  className="flex flex-col w-[80%] mx-2 my-2 py-2 px-5 rounded-md justify-center items-center  bg-[#f8f8f8] border border-[#f5f5f5] shadow-sm"
                  key={index}
                >
                  <div className="flex w-full mt-3 justify-between items-center ">
                    {user && user.privileges > 3 ? (
                      <div>
                        <h4>{director.name}</h4>
                      </div>
                    ) : null}
                    <h5>{formatDateForDisplay(director.evaluationDate)}</h5>
                  </div>
                  {user && user.privileges > 3 && (
                    <div className="flex flex-row w-full justify-around min-h-[25px] mt-5">
                      {director.categories.map((category, index) => (
                        <div className="grow flex-1 ">
                          <RateCircle label={index} value={category} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex w-full mt-3 justify-between items-center">
                    {director.note && (
                      <p className="text-[#5f5f5f]">
                        <span className="font-bold text-gray-900">
                          Comentario:
                        </span>{" "}
                        {director.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
