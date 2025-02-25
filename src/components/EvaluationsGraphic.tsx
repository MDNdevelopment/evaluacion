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
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig: any = {};

export const EvaluationsGraphic = ({ evaluationsData }: any) => {
  const evaluationsArray = [];

  if (evaluationsData) {
    for (const key in evaluationsData) {
      const element = evaluationsData[key];

      evaluationsArray.push(element);
    }
  }

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
    Object.keys(period.categories).forEach((category) => {
      if (!chartConfig[category]) {
        chartConfig[category] = {
          label: category,
          color: colors[Object.keys(chartConfig).length + 2],
          dataKey: `categories.${category}.average`,
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
    Object.keys(period.categories).forEach((category) => {
      uniqueCategories.add(category);
    });
  });

  return (
    <Card>
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
                tickCount={6}
                padding={{ top: 15, bottom: 15 }}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />

              {/* <ChartLegend content={<ChartLegendContent />} /> */}

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
                key={"totalRate"}
                type={"monotone"}
                dataKey={"totalRate"}
                stroke={colors[1]}
                strokeWidth={2}
                dot={false}
                name="Puntaje total"
              />
              {[...Object.keys(chartConfig)].map((category: any) => (
                <Line
                  key={category}
                  type={"monotone"}
                  dataKey={`categories.${category}.average`}
                  stroke={chartConfig[category].color}
                  strokeWidth={2}
                  dot={false}
                  name={chartConfig[category].label}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
