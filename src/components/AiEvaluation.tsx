import { useEffect, useState } from "react";

import { GoogleGenAI } from "@google/genai";
import Spinner from "./Spinner";

type SummaryItem = keyof Omit<AiResponse, "summary">;

const summaryItems: SummaryItem[] = [
  "strengths",
  "weaknesses",
  "recommendations",
];
const formatSummary = (key: SummaryItem) => {
  switch (key) {
    case "strengths":
      return "Fortalezas";
    case "weaknesses":
      return "Debilidades";
    case "recommendations":
      return "Recomendaciones";
    default:
      return key;
  }
};
//declare that the properties of the AiResponse interface are strings

interface AiResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export default function AiEvaluation({ evaluations }: any) {
  console.log({ evaluations });
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  async function main() {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents:
          "I need you to give me an analysis on the employee performance based on his evaluations " +
          JSON.stringify(evaluations),
        config: {
          maxOutputTokens: 5000,
          temperature: 1,
          responseMimeType: "application/json",
          systemInstruction: `
          
          In the given data there will be evaluations from many months, you must take into account all the evaluations in order to give a summary of the employee's performance. Don't mention an specific month, just give a summary of the employee's performance.
          
          The response must be in JSON format where the keys are in english but the values are in spanish, the response must be a summary of the evaluations and the employee's performance, the response must be a JSON object with the following keys: 'summary', 'strengths', 'weaknesses', 'recommendations'
          Return: {{summary: response}, {strengths: Array<strengths>},  {weaknesses: Array<weaknesses>},  {recommendations: Array<recommendations>}} if for some reason you can't provide the information for a key, just return the following: for summary: "No se puede proporcionar información", for the other keys, return an array with a single string "No se puede proporcionar información". In the strengths, weaknesses and recommendations don't just put the questions related to that key but give insights about what makes that key important, for example: "El empleado tiene una gran capacidad de trabajo en equipo, lo que le permite colaborar eficazmente con sus compañeros y contribuir al éxito del equipo." and "El empleado tiene dificultades para trabajar en equipo, lo que le impide colaborar eficazmente con sus compañeros y contribuir al éxito del equipo." and "El empleado debe mejorar su capacidad de trabajo en equipo para poder colaborar eficazmente con sus compañeros y contribuir al éxito del equipo.".
          
          When speaking about commments, only take into account only the ones made in the lastest evaluation period, don't take into account the comments made in the previous evaluation periods other than the last one`,
        },
      });

      if (response.text) {
        setAiResponse(JSON.parse(response.text));
        setIsLoading(false);
        return;
      }
      throw new Error("No response text");
    } catch (error) {
      console.log({ error });
      setAiResponse(null);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setAiResponse(null);
    if (!evaluations) return;
    main();
  }, [evaluations]);

  return (
    <div className="bg-white rounded-lg p-10 shadow-sm mt-10">
      <h2 className="text-4xl font-bold mb-5">Análisis</h2>
      {isLoading ? (
        <div className="h-24 text-center">
          <p className="text-gray-500">Generando análisis...</p>
          <div className="flex items-center justify-center pt-2">
            <Spinner />
          </div>
        </div>
      ) : aiResponse ? (
        <>
          <div>
            <h3 className="text-xl font-bold">Resumen</h3>
            <p>{aiResponse.summary}</p>
          </div>
          {summaryItems.map((item: string) => (
            <div key={item} className="mt-4">
              <h3 className="text-xl font-bold">
                {formatSummary(item as SummaryItem)}
              </h3>
              <ul className="list-disc pl-10">
                {aiResponse[item as SummaryItem].map((text: string) => (
                  <li className="list-disc" key={text}>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : (
        <div className=" flex items-center justify-center">
          Ocurrió un error al generar el análisis...
        </div>
      )}
    </div>
  );
}
