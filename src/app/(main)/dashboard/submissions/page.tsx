"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";

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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";

import { getColumns } from "./columns";
import { Submission } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";

const fetchSubmissions = async (
  status: string,
  searchTerm: string,
  eventType: string,
): Promise<{ data: Submission[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status); // Status tetap dikirim ke API
  if (searchTerm) params.append("nameOrEmail", searchTerm);
  if (eventType && eventType !== "ALL") params.append("eventType", eventType);

  const response = await api.get(`/admin/activity-submissions?${params.toString()}`);
  return response.data;
};

export default function ActivitySubmissionsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [imageViewOpen, setImageViewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "PENDING");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "PENDING");
  }, [searchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions", statusFilter, debouncedSearchTerm, eventTypeFilter],
    queryFn: () => fetchSubmissions(statusFilter, debouncedSearchTerm, eventTypeFilter),
  });

  const tableData = data?.data ?? [];

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

  const columns = getColumns({ onApprove, onReject, onViewImage });
  const table = useDataTableInstance({ data: tableData, columns });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Activity Submissions</CardTitle>
          <CardDescription>Review, approve, or reject user activity submissions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[180px]">
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

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <p className="text-destructive">Failed to load data.</p>
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
          <div className="relative h-[80vh] w-full">
            <Image src={selectedImageUrl} alt="Submission Preview" layout="fill" objectFit="contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
