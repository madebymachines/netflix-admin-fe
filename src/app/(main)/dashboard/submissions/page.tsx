"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams, useRouter } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";
import { getColumns } from "./columns";
import { Submission } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";

const fetchSubmissions = async (
  status: string | undefined,
  isFlagged: boolean | undefined,
  searchTerm: string,
  eventType: string,
  page: number,
  limit: number,
): Promise<{ data: Submission[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (isFlagged !== undefined) params.append("isFlagged", String(isFlagged));
  if (searchTerm) params.append("nameOrEmail", searchTerm);
  if (eventType && eventType !== "ALL") params.append("eventType", eventType);
  params.append("page", String(page + 1));
  params.append("limit", String(limit));

  const response = await api.get(`/admin/activity-submissions?${params.toString()}`);
  return response.data;
};

export default function ActivitySubmissionsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [imageViewOpen, setImageViewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const statusFilter = searchParams.get("status") || "PENDING";
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchParams]);

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["submissions", statusFilter, debouncedSearchTerm, eventTypeFilter, pagination],
    queryFn: () => {
      const isFlaggedQuery = statusFilter === "FLAGGED" ? true : undefined;
      const statusQuery =
        statusFilter === "FLAGGED" ? undefined : statusFilter === "ALL_STATUS" ? undefined : statusFilter;
      return fetchSubmissions(
        statusQuery,
        isFlaggedQuery,
        debouncedSearchTerm,
        eventTypeFilter,
        pagination.pageIndex,
        pagination.pageSize,
      );
    },
    placeholderData: keepPreviousData,
  });

  const tableData = data?.data ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/activity-submissions/${id}/approve`),
    onSuccess: () => {
      toast.success("Submission approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["sidebarStats"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.patch(`/admin/activity-submissions/${id}/reject`, { rejectionReason: reason }),
    onSuccess: () => {
      toast.success("Submission rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["sidebarStats"] });
      closeRejectModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to reject."),
  });

  function onApprove(id: number) {
    approveMutation.mutate(id);
  }

  function onReject(id: number) {
    setSelectedId(id);
    setRejectionModalOpen(true);
  }

  function onViewImage(url: string) {
    setSelectedImageUrl(url);
    setImageViewOpen(true);
  }

  function onViewDetails(id: number) {
    router.push(`/dashboard/users/${id}`);
  }

  function handleRejectSubmit() {
    if (selectedId) {
      rejectMutation.mutate({ id: selectedId, reason: rejectionReason });
    }
  }

  function closeRejectModal() {
    setRejectionModalOpen(false);
    setSelectedId(null);
    setRejectionReason("");
  }

  const columns = useMemo(
    () => getColumns({ onApprove, onReject, onViewImage, onViewDetails, statusFilter }),
    [statusFilter],
  );
  const table = useDataTableInstance({
    data: tableData,
    columns,
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  const getPageTitle = () => {
    switch (statusFilter) {
      case "PENDING":
        return "Pending Submissions";
      case "APPROVED":
        return "Approved Submissions";
      case "REJECTED":
        return "Rejected Submissions";
      case "FLAGGED":
        return "Flagged Submissions";
      default:
        return "All Submissions";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{getPageTitle()}</CardTitle>
          <CardDescription>Review, approve, or reject user activity submissions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Event Types</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="GROUP">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ExportFeature exportType="SUBMISSIONS" />
          </div>

          {isError ? (
            <p className="text-destructive">Failed to load data.</p>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border">
                {isLoading && isPlaceholderData ? (
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
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

      <AlertDialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejection (optional). This action will deduct the earned points from the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Image is not relevant"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeRejectModal}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectSubmit} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={imageViewOpen} onOpenChange={setImageViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Submission Image Preview</DialogTitle>
            <DialogDescription>Full-size preview of the submitted image.</DialogDescription>
          </DialogHeader>
          <div className="relative h-[80vh] w-full">
            <Image src={selectedImageUrl} alt="Submission Preview" layout="fill" objectFit="contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
