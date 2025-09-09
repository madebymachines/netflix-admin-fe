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

const fetchSubmissions = async (
  status: string,
  searchTerm: string,
): Promise<{ data: Submission[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  if (searchTerm) params.append("nameOrEmail", searchTerm);

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "PENDING");
  }, [searchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions", statusFilter, debouncedSearchTerm],
    queryFn: () => fetchSubmissions(statusFilter, debouncedSearchTerm),
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
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
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
    if (!selectedId) return;
    if (!rejectionReason) {
      toast.error("Rejection reason is required.");
      return;
    }
    rejectMutation.mutate({ id: selectedId, reason: rejectionReason });
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
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
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
              Please provide a reason for rejection. This action will deduct the earned points from the user.
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
