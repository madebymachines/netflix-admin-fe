"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { getMonthlyReportHistory } from "@/services/reports.api";

import { columns } from "./columns";

export default function MonthlyReportsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["monthlyReportHistory"],
    queryFn: getMonthlyReportHistory,
  });

  const tableData = data ?? [];

  const table = useDataTableInstance({
    data: tableData,
    columns,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Winner Reports</CardTitle>
        <CardDescription>
          History of all automated monthly winner reports that have been generated and sent to clients.
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
            <DataTablePagination table={table} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
