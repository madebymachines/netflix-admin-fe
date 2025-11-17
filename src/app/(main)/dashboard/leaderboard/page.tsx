"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getColumns } from "./columns";
import { LeaderboardEntry, Timespan } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";
import {
  getWeeklyReportSchedules,
  getMonthlyReportSchedules,
  notifySingleWinner,
  WeeklyReportSchedule,
  MonthlyReportSchedule,
} from "@/services/reports.api";

// --- PERUBAHAN DI SINI: Fetcher sekarang memanggil endpoint admin ---
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

  // Menggunakan endpoint /admin/leaderboard yang dilindungi
  const response = await api.get(`/admin/leaderboard?${params.toString()}`);
  return {
    leaderboard: response.data.leaderboard,
    pagination: response.data.pagination,
  };
};

export default function LeaderboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [timespan, setTimespan] = useState<Timespan>("monthly");
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isSingleConfirmOpen, setIsSingleConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

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

  const queryKey = ["leaderboard", timespan, pagination, selectedWeek, selectedMonth];
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
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

  const notifySingleMutation = useMutation({
    mutationFn: notifySingleWinner,
    onSuccess: () => {
      toast.success(`Notification sent successfully to ${selectedUser?.username}.`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Failed to notify ${selectedUser?.username}.`, {
        description: error.response?.data?.message || "An unknown error occurred.",
      });
    },
  });

  const handleNotifySingle = (user: LeaderboardEntry) => {
    if (
      (timespan === "weekly" && selectedWeek === "current") ||
      (timespan === "monthly" && selectedMonth === "current") ||
      !["weekly", "monthly"].includes(timespan)
    ) {
      toast.error("Please select a specific week or month to send notifications.");
      return;
    }
    setSelectedUser(user);
    setIsSingleConfirmOpen(true);
  };

  const confirmSingleSend = () => {
    if (!selectedUser) return;
    const periodId = parseInt(timespan === "weekly" ? selectedWeek : selectedMonth, 10);
    if (isNaN(periodId)) return;

    notifySingleMutation.mutate({
      type: timespan,
      periodId,
      userId: selectedUser.userId,
    });
  };

  const tableData = data?.leaderboard ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const onViewDetails = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  const columns = useMemo(
    () => getColumns({ onViewDetails, onNotifyWinner: handleNotifySingle }),
    [selectedWeek, selectedMonth, timespan],
  );

  const table = useDataTableInstance({
    data: tableData,
    columns,
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const selectedPeriodLabel = useMemo(() => {
    if (timespan === "weekly") {
      return weeklySchedulesData?.find((s) => String(s.periodId) === selectedWeek)?.label;
    }
    if (timespan === "monthly") {
      return monthlySchedulesData?.find((m) => String(m.periodId) === selectedMonth)?.label;
    }
    return "";
  }, [timespan, selectedWeek, selectedMonth, weeklySchedulesData, monthlySchedulesData]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>See who is at the top of the ranks and notify winners.</CardDescription>
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
              <ExportFeature exportType="LEADERBOARD" />
            </div>
          </div>
          {isError ? (
            <p className="text-destructive">Failed to load leaderboard data.</p>
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
                  <DataTable table={table} columns={columns} />
                )}
              </div>
              <DataTablePagination table={table} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Single Confirm Dialog */}
      <AlertDialog open={isSingleConfirmOpen} onOpenChange={setIsSingleConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Single Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send a winner notification email to{" "}
              <span className="font-semibold">{selectedUser?.username}</span> for{" "}
              <span className="font-semibold">{selectedPeriodLabel}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSingleSend} disabled={notifySingleMutation.isPending}>
              {notifySingleMutation.isPending ? "Sending..." : "Confirm & Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
