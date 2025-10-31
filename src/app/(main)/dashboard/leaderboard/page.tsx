"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getColumns } from "./columns";
import { LeaderboardEntry, Timespan } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";
// --- PERUBAHAN DI SINI: Impor dari service API, bukan data statis ---
import { getWeeklyReportSchedules, ReportSchedule } from "@/services/reports.api";

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

  const response = await api.get(`/leaderboard?${params.toString()}`);
  return {
    leaderboard: response.data.leaderboard,
    pagination: response.data.pagination,
  };
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [timespan, setTimespan] = useState<Timespan>("monthly");
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- PERUBAHAN DI SINI: Menggunakan useQuery untuk mengambil jadwal mingguan ---
  const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery<ReportSchedule[]>({
    queryKey: ["reportSchedules"],
    queryFn: getWeeklyReportSchedules,
    staleTime: Infinity, // Data ini tidak akan berubah, jadi bisa di-cache selamanya
  });

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["leaderboard", timespan, pagination, selectedWeek],
    queryFn: () => {
      let startDate, endDate;
      if (timespan === "weekly" && selectedWeek !== "current" && schedulesData) {
        const weekData = schedulesData.find((w) => w.week === parseInt(selectedWeek));
        if (weekData) {
          startDate = weekData.start;
          endDate = weekData.end;
        }
      }
      return fetchLeaderboard(timespan, pagination.pageIndex, pagination.pageSize, startDate, endDate);
    },
    enabled: !isLoadingSchedules, // Hanya jalankan query ini setelah jadwal selesai dimuat
    placeholderData: keepPreviousData,
  });

  const tableData = data?.leaderboard ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const onViewDetails = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  const columns = useMemo(() => getColumns({ onViewDetails }), []);

  const table = useDataTableInstance({
    data: tableData,
    columns,
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>See who is at the top of the ranks.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={timespan} onValueChange={(value) => setTimespan(value as Timespan)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {/* PERUBAHAN DI SINI: Pindahkan dropdown ke sebelah kiri tombol Export */}
            {timespan === "weekly" && (
              <Select value={selectedWeek} onValueChange={setSelectedWeek} disabled={isLoadingSchedules}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={isLoadingSchedules ? "Loading..." : "Select Week"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Week</SelectItem>
                  {schedulesData?.map((schedule) => (
                    <SelectItem key={schedule.week} value={String(schedule.week)}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <ExportFeature exportType="LEADERBOARD" />
          </div>
        </div>
        {isError ? (
          <p className="text-destructive">Failed to load leaderboard data.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border">
              {isLoading || isLoadingSchedules ? ( // Tampilkan skeleton jika jadwal atau data sedang loading
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable table={table} columns={columns} />
              )}
            </div>
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
