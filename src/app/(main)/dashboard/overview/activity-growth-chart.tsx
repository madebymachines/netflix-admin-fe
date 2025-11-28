"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, CartesianGrid, XAxis, YAxis, Legend, LabelList, ComposedChart, Line } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const chartConfig = {
  PENDING: {
    label: "Pending",
    color: "#EAB308", // Yellow-500
  },
  APPROVED: {
    label: "Approved",
    color: "#22C55E", // Green-500
  },
  REJECTED: {
    label: "Rejected",
    color: "#EF4444", // Red-500
  },
  average: {
    label: "Avg per User",
    color: "#3B82F6", // Blue-500
  },
} satisfies ChartConfig;

// API Fetcher
const fetchActivityGrowth = async (
  type: "daily" | "weekly" | "monthly",
): Promise<{
  data: {
    label?: string;
    date: string;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    total: number;
    average: number;
  }[];
}> => {
  const response = await api.get(`/admin/stats/activity-growth?type=${type}&days=30`);
  return response.data;
};

export function ActivityGrowthChart() {
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">("daily");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["activityGrowth", periodType],
    queryFn: () => fetchActivityGrowth(periodType),
  });

  const chartData = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Activity Challenges</CardTitle>
            <CardDescription>
              {periodType === "daily"
                ? "Daily challenges by status & average per user (Last 30 Days)."
                : periodType === "weekly"
                  ? "Total challenges per campaign week."
                  : "Total challenges per campaign month."}
            </CardDescription>
          </div>
          <Select value={periodType} onValueChange={(val: any) => setPeriodType(val)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (Last 30 Days)</SelectItem>
              <SelectItem value="weekly">Weekly Campaign</SelectItem>
              <SelectItem value="monthly">Monthly Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : isError ? (
          <p className="text-destructive">Failed to load chart data.</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ComposedChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey={periodType === "daily" ? "date" : "label"}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  if (periodType === "daily") {
                    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }
                  return value;
                }}
              />
              {/* Left Axis for Counts */}
              <YAxis yAxisId="left" allowDecimals={false} />
              {/* Right Axis for Average */}
              <YAxis yAxisId="right" orientation="right" allowDecimals={true} tickFormatter={(val) => val.toFixed(1)} />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(label) => {
                      if (periodType === "daily") {
                        return new Date(label).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      }
                      return label;
                    }}
                  />
                }
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {/* Stacked Bars */}
              <Bar
                yAxisId="left"
                dataKey="APPROVED"
                stackId="a"
                fill="var(--color-APPROVED)"
                radius={[0, 0, 4, 4]}
                name="Approved"
              />
              <Bar yAxisId="left" dataKey="PENDING" stackId="a" fill="var(--color-PENDING)" name="Pending" />
              <Bar
                yAxisId="left"
                dataKey="REJECTED"
                stackId="a"
                fill="var(--color-REJECTED)"
                radius={[4, 4, 0, 0]}
                name="Rejected"
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={10}
                  className="fill-foreground font-bold"
                  fontSize={12}
                />
              </Bar>

              {/* Line for Average */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                strokeWidth={2}
                dot={{ fill: "var(--color-average)" }}
                name="Avg per User"
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
