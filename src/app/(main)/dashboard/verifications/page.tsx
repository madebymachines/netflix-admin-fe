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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";

import { getColumns } from "./columns";
import { Verification } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";

// API Fetcher with filters and pagination
const fetchVerifications = async (
  status: string,
  type: string,
  searchTerm: string,
  page: number,
  limit: number,
): Promise<{ data: Verification[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (type && type !== "ALL") params.append("type", type);
  if (searchTerm) params.append("nameOrEmail", searchTerm);
  params.append("page", String(page + 1));
  params.append("limit", String(limit));

  const response = await api.get(`/admin/purchase-verifications?${params.toString()}`);
  return response.data;
};

export default function VerificationsPage() {
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

  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "PENDING");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    setStatusFilter(searchParams.get("status") || "PENDING");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchParams]);

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["verifications", statusFilter, typeFilter, debouncedSearchTerm, pagination],
    queryFn: () =>
      fetchVerifications(statusFilter, typeFilter, debouncedSearchTerm, pagination.pageIndex, pagination.pageSize),
    placeholderData: keepPreviousData,
  });

  const tableData = data?.data ?? [];
  const pageCount = data?.pagination.totalPages ?? 0;

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/purchase-verifications/${id}/approve`),
    onSuccess: () => {
      toast.success("Verification approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      queryClient.invalidateQueries({ queryKey: ["sidebarStats"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to approve."),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      api.patch(`/admin/purchase-verifications/${id}/reject`, { rejectionReason: reason }),
    onSuccess: () => {
      toast.success("Verification rejected successfully.");
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
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

  const columns = useMemo(() => getColumns({ onApprove, onReject, onViewImage, onViewDetails }), []);
  const table = useDataTableInstance({
    data: tableData,
    columns,
    pageCount,
    manualPagination: true,
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Verifications</CardTitle>
          <CardDescription>Review and manage user purchase verifications.</CardDescription>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="MEMBER_GYM">Member Gym</SelectItem>
                  <SelectItem value="RECEIPT">Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ExportFeature exportType="VERIFICATIONS" />
          </div>

          {isError ? (
            <p className="text-destructive">Failed to load data.</p>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border">
                {isLoading && isPlaceholderData ? (
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
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
            <AlertDialogTitle>Reject Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejection (optional). This will be sent to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Receipt image is blurry"
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
            <DialogTitle>Receipt Image Preview</DialogTitle>
            <DialogDescription>Full-size preview of the submitted image.</DialogDescription>
          </DialogHeader>
          <div className="relative h-[80vh] w-full">
            <Image src={selectedImageUrl} alt="Receipt Preview" layout="fill" objectFit="contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}