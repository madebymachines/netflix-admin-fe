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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getColumns } from "./columns";
import { LeaderboardEntry } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";

type Timespan = "alltime" | "weekly" | "streak";

// API Fetcher
const fetchLeaderboard = async (
  timespan: Timespan,
  page: number,
  limit: number,
): Promise<{ leaderboard: LeaderboardEntry[]; pagination: any }> => {
  const params = new URLSearchParams({
    timespan,
    page: String(page + 1),
    limit: String(limit),
  });
  const response = await api.get(`/leaderboard?${params.toString()}`);
  return {
    leaderboard: response.data.leaderboard,
    pagination: response.data.pagination,
  };
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [timespan, setTimespan] = useState<Timespan>("alltime");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["leaderboard", timespan, pagination],
    queryFn: () => fetchLeaderboard(timespan, pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.leaderboard ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const onViewDetails = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  const columns = useMemo(() => getColumns({ onViewDetails, timespan }), [timespan]);

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
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the ranks.</CardDescription>
        </div>
        <ExportFeature exportType="LEADERBOARD" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Tabs value={timespan} onValueChange={(value) => setTimespan(value as Timespan)}>
            <TabsList>
              <TabsTrigger value="alltime">All-Time</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="streak">Top Streak</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isError ? (
          <p className="text-destructive">Failed to load leaderboard data.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border">
              {isLoading && isPlaceholderData ? (
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