"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import api from "@/lib/axios";
import { getColumns } from "./columns";
import { User } from "./schema";
import { ExportFeature } from "@/components/ExportFeature";

// API Fetcher with filters
const fetchUsers = async (searchTerm: string, banStatus: string): Promise<{ data: User[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("name", searchTerm);
  if (banStatus && banStatus !== "all") params.append("isBanned", banStatus);
  params.append("limit", "100");

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [banReason, setBanReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [banStatusFilter, setBanStatusFilter] = useState(() => {
    const initialFilter = searchParams.get("filter");
    if (initialFilter === "blocked") return "true";
    return "false"; // Default ke Active Participants
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const newFilter = searchParams.get("filter");
    setBanStatusFilter(newFilter === "blocked" ? "true" : "false");
  }, [searchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", debouncedSearchTerm, banStatusFilter],
    queryFn: () => fetchUsers(debouncedSearchTerm, banStatusFilter),
  });

  const tableData = data?.data ?? [];

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => api.patch(`/admin/users/${id}/ban`, { reason }),
    onSuccess: () => {
      toast.success("User banned successfully.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sidebarStats"] });
      closeBanModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to ban user."),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/users/${id}/unban`),
    onSuccess: () => {
      toast.success("User unbanned successfully.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sidebarStats"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to unban user."),
  });

  const onBan = (id: number) => {
    setSelectedUserId(id);
    setBanModalOpen(true);
  };

  const onUnban = (id: number) => {
    unbanMutation.mutate(id);
  };

  const onViewDetails = (id: number) => {
    router.push(`/dashboard/users/${id}`);
  };

  const handleBanSubmit = () => {
    if (selectedUserId) {
      banMutation.mutate({ id: selectedUserId, reason: banReason });
    }
  };

  const closeBanModal = () => {
    setBanModalOpen(false);
    setSelectedUserId(null);
    setBanReason("");
  };

  const columns = useMemo(() => getColumns({ onBan, onUnban, onViewDetails }), []);
  const table = useDataTableInstance({ data: tableData, columns });

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              {banStatusFilter === "true" ? "Manage blocked participants" : "Manage active participants"}
            </CardDescription>
          </div>
          <ExportFeature exportType="PARTICIPANTS" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <p className="text-destructive">Failed to load user data.</p>
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

      <AlertDialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for banning this user (optional). This action can be undone later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="e.g., Violation of terms of service"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeBanModal}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanSubmit} disabled={banMutation.isPending}>
              {banMutation.isPending ? "Banning..." : "Confirm Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
