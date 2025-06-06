import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const chartConfig: any = {};

export const EvaluationsGraphic = ({
  evaluationsArray,
}: {
  evaluationsArray: [];
}) => {
  const colors = [
    "#F4B000", // Vibrant Yellow
    "#8884d8", // Soft Indigo
    "#82ca9d", // Soft Green
    "#FF6347", // Tomato Red
    "#4682B4", // Steel Blue
    "#FF69B4", // Hot Pink
    "#ff0048", // Orange
    "#222222",
    "#6dee64", // Vibrant Yellow
  ];

  evaluationsArray.forEach((period: any) => {
    Object.keys(period).forEach((category) => {
      if (!chartConfig[category]) {
        chartConfig[category] = {
          label: category,
          color: colors[Object.keys(chartConfig).length + 2],
          dataKey: `${category}.totalScore`,
          stroke: "#fff",
          strokeWidth: 2,
          dot: false,
          name: category,
        };
      }
    });
  });

  // Create a unique set of categories
  const uniqueCategories = new Set();
  evaluationsArray.forEach((period: any) => {
    Object.keys(period).forEach((category) => {
      uniqueCategories.add(category);
    });
  });

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Resultados mensuales</CardTitle>
        <CardDescription>
          Mostrando los resultados totales de las evaluaciones de los últimos
          meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={evaluationsArray}
              margin={{ left: -25 }}
            >
              <CartesianGrid strokeDasharray="5 5" stroke="#cfcfcf" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={7}
                tickCount={5}
                domain={[1, 5]}
                padding={{ top: 15 }}
              />

              <Tooltip
                cursor={false}
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow-md rounded">
                        <p className="text-sm font-medium">
                          Período: {data.period}
                        </p>
                        <div className="flex flex-row items-center justify-start ">
                          <div className="w-1/8 ">
                            <div className="h-2 w-2 rounded-full bg-[#F4B000] mr-3"></div>
                          </div>
                          <p className="text-sm font-light">
                            Evaluaciones:{" "}
                            <span className="font-medium">
                              {data.totalEvaluations}{" "}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-row items-center justify-start ">
                          <div className="w-1/8 ">
                            <div className="h-2 w-2 rounded-full bg-[#8884d8] mr-2"></div>
                          </div>

                          <p className="text-sm font-light">
                            Consistencia en funciones:{" "}
                            <span className="font-medium">
                              {data.scoreResult}{" "}
                              <span className="">({data.formattedScore})</span>
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                key={"totalEvaluations"}
                type="monotone"
                dataKey={"totalEvaluations"}
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
                name="Evaluaciones"
              />
              <Line
                key={"scoreResult"}
                type={"monotone"}
                dataKey={"totalScore"}
                stroke={colors[1]}
                strokeWidth={2}
                dot={false}
                name="Rendimiento promedio"
              />
              {/* {[...Object.keys(chartConfig)].map((category: any) => (
                <Line
                  key={category}
                  type={"monotone"}
                  dataKey={`${category}`}
                  stroke={chartConfig[category].color}
                  strokeWidth={2}
                  dot={false}
                  name={chartConfig[category].label}
                />
              ))} */}
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
