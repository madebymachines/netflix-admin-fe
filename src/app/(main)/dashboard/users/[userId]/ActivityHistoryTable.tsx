"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import api from "@/lib/axios";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityHistoryTableProps {
  userId: number;
}

const fetchActivityHistory = async (userId: number, page: number, limit: number) => {
  const params = new URLSearchParams({
    page: String(page + 1),
    limit: String(limit),
  });
  const response = await api.get(`/admin/users/${userId}/activity-history?${params.toString()}`);
  return response.data;
};

const columns: ColumnDef<any>[] = [
  { accessorKey: "eventType", header: "Event" },
  {
    accessorKey: "pointsEarn",
    header: "Points",
    cell: ({ row }) => (
      <span className={row.original.status === "REJECTED" ? "text-red-500" : "text-green-500"}>
        {row.original.status === "REJECTED" ? "-" : "+"}
        {row.original.pointsEarn}
      </span>
    ),
  },
  { accessorKey: "pointsFrom", header: "From" },
  { accessorKey: "pointsTo", header: "To" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "APPROVED"
            ? "secondary"
            : row.original.status === "PENDING"
              ? "outline"
              : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM, HH:mm"),
  },
];

export function ActivityHistoryTable({ userId }: ActivityHistoryTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5, // Atur ukuran halaman yang lebih kecil untuk detail view
  });

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["activityHistory", userId, pagination],
    queryFn: () => fetchActivityHistory(userId, pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.data ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

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
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-destructive">Failed to load activity history.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              {isLoading && isPlaceholderData ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <DataTable table={table} columns={columns} />
              )}
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
