"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getWeeklyReportSchedules,
  getMonthlyReportSchedules,
  WeeklyReportSchedule,
  MonthlyReportSchedule,
} from "@/services/reports.api";
import { LeaderboardEntry, Timespan } from "@/app/(main)/dashboard/leaderboard/schema";
import { activityColumns } from "./activity-columns";
import { ExportFeature } from "@/components/ExportFeature"; // Import ExportFeature

// Fetcher reused from Leaderboard but can be isolated if needed
const fetchLeaderboard = async (
  timespan: Timespan,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
): Promise<{ leaderboard: LeaderboardEntry[]; pagination: any }> => {
  const params = new URLSearchParams({
    timespan,
    page: String(page + 1),
    limit: String(limit),
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await api.get(`/admin/leaderboard?${params.toString()}`);
  return {
    leaderboard: response.data.leaderboard,
    pagination: response.data.pagination,
  };
};

export function UserActivityStats() {
  const [timespan, setTimespan] = useState<Timespan>("weekly");
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Limit to 5 for overview dashboard
  });

  const { data: weeklySchedulesData, isLoading: isLoadingWeeklySchedules } = useQuery<WeeklyReportSchedule[]>({
    queryKey: ["weeklyReportSchedules"],
    queryFn: getWeeklyReportSchedules,
    staleTime: Infinity,
  });

  const { data: monthlySchedulesData, isLoading: isLoadingMonthlySchedules } = useQuery<MonthlyReportSchedule[]>({
    queryKey: ["monthlyReportSchedules"],
    queryFn: getMonthlyReportSchedules,
    staleTime: Infinity,
  });

  const queryKey = ["activityStats", timespan, pagination, selectedWeek, selectedMonth];
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => {
      let startDate, endDate;
      if (timespan === "weekly" && selectedWeek !== "current" && weeklySchedulesData) {
        const weekData = weeklySchedulesData.find((w) => String(w.periodId) === selectedWeek);
        if (weekData) {
          startDate = weekData.start;
          endDate = weekData.end;
        }
      } else if (timespan === "monthly" && selectedMonth !== "current" && monthlySchedulesData) {
        const monthData = monthlySchedulesData.find((m) => String(m.periodId) === selectedMonth);
        if (monthData) {
          startDate = monthData.start;
          endDate = monthData.end;
        }
      }
      return fetchLeaderboard(timespan, pagination.pageIndex, pagination.pageSize, startDate, endDate);
    },
    enabled: !isLoadingWeeklySchedules && !isLoadingMonthlySchedules,
    placeholderData: keepPreviousData,
  });

  const tableData = data?.leaderboard ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const table = useDataTableInstance({
    data: tableData,
    columns: activityColumns,
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>Top users performing challenges in the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={timespan} onValueChange={(value) => setTimespan(value as Timespan)}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            {timespan === "weekly" && (
              <Select value={selectedWeek} onValueChange={setSelectedWeek} disabled={isLoadingWeeklySchedules}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={isLoadingWeeklySchedules ? "Loading..." : "Select Week"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Week</SelectItem>
                  {weeklySchedulesData?.map((schedule) => (
                    <SelectItem key={schedule.periodId} value={String(schedule.periodId)}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {timespan === "monthly" && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isLoadingMonthlySchedules}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={isLoadingMonthlySchedules ? "Loading..." : "Select Month"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  {monthlySchedulesData?.map((schedule) => (
                    <SelectItem key={schedule.periodId} value={String(schedule.periodId)}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* Tambahkan Tombol Export dengan customTitle */}
            <ExportFeature exportType="LEADERBOARD" customTitle="User Activity" />
          </div>
        </div>

        {isError ? (
          <p className="text-destructive">Failed to load activity data.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border">
              {isLoading || isLoadingWeeklySchedules || isLoadingMonthlySchedules ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable table={table} columns={activityColumns} />
              )}
            </div>
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
