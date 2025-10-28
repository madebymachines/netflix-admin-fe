"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination"; // Impor komponen pagination
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getWeeklyReportHistory } from "@/services/reports.api";

import { columns } from "./columns";

export default function WeeklyReportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weeklyReportHistory"],
    queryFn: getWeeklyReportHistory,
  });

  const tableData = data ?? [];

  const table = useDataTableInstance({
    data: tableData,
    columns,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Winner Reports</CardTitle>
        <CardDescription>
          History of all automated weekly winner reports that have been generated and sent.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isError ? (
          <p className="text-destructive">Failed to load report history.</p>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-md border">
              <DataTable table={table} columns={columns} />
            </div>
            {/* Tambahkan baris di bawah ini */}
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
