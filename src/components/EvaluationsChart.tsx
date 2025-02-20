"use client";

import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  quality: {
    label: "Calidad",
    color: "hsl(var(--chart-1))",
  },
  commitment: {
    label: "Compromiso",
    color: "hsl(var(--chart-2))",
  },
  responsibility: {
    label: "Responsabilidad",
    color: "hsl(var(--chart-3))",
  },
  initiative: {
    label: "Iniciativa",
    color: "hsl(var(--chart-4))",
  },
  customer_service: {
    label: "Comunicación efectiva",
    color: "hsl(var(--chart-5))",
  },
  process_tracking: {
    label: "Cumplimiento de procesos",
    color: "hsl(var(--chart-6))",
  },
  total_rate: {
    label: "Promedio total",
    color: "hsl(var(--chart-7))",
  },
  total_evaluations: {
    label: "Evaluaciones",
    color: "hsl(var(--chart-8))",
  },
} satisfies ChartConfig;

export const EvaluationsChart = ({ evaluationsData }: any) => {
  const dataKeys =
    evaluationsData.length > 0 ? Object.keys(evaluationsData[0]) : [];

  console.log({ dataKeys, evaluationsData });
  // Filter out keys that you don't want to include as lines
  const metricKeys = dataKeys.filter(
    (key) => key !== "period" && key !== "made_by"
  );

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

  const categories = {
    period: "Período",
    quality: "Calidad",
    commitment: "Compromiso",
    initiative: "Iniciativa",
    customer_service: "Comunicación efectiva",
    process_tracking: "Cumplimiento de procesos",
    responsibility: "Responsabilidad",
    total_rate: "Promedio total",
    total_evaluations: "Evaluaciones",
  };
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
              data={evaluationsData}
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
                tickMargin={8}
                tickCount={6}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />

              {/* <ChartLegend content={<ChartLegendContent />} /> */}

              {metricKeys.map((key: string, index) => {
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index]}
                    name={Object.values(categories)[index + 1]}
                  />
                );
              })}
            </LineChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
