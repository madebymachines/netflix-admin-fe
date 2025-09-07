"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  count: {
    label: "New Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// API Fetcher
const fetchUserGrowth = async (): Promise<{ data: { date: string; count: number }[] }> => {
  const response = await api.get("/admin/stats/user-growth?days=30");
  return response.data;
};

export function UserGrowthChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userGrowth"],
    queryFn: fetchUserGrowth,
  });

  const chartData = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>New User Registrations</CardTitle>
        <CardDescription>Daily new users over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : isError ? (
          <p className="text-destructive">Failed to load chart data.</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
