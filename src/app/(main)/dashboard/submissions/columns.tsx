"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, MoreHorizontal, X, Flag } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Submission } from "./schema";

type ColumnsProps = {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewImage: (url: string) => void;
  onViewDetails: (id: number) => void;
  statusFilter: string;
};

export const getColumns = ({
  onApprove,
  onReject,
  onViewImage,
  onViewDetails,
  statusFilter,
}: ColumnsProps): ColumnDef<Submission>[] => {
  const baseColumns: ColumnDef<Submission>[] = [
    {
      accessorKey: "user.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onViewDetails(row.original.user.id)} className="hover:underline">
            {row.original.user.name}
          </button>
          {row.original.isFlagged && statusFilter !== "FLAGGED" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Flag className="h-4 w-4 text-orange-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.flagReason || "This submission is flagged for review."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
    {
      accessorKey: "user.email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <button onClick={() => onViewDetails(row.original.user.id)} className="hover:underline">
          {row.original.user.email}
        </button>
      ),
    },
    {
      accessorKey: "eventType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event Type" />,
    },
    {
      accessorKey: "pointsEarn",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Points" />,
      cell: ({ row }) => <span className="font-semibold text-green-600">+{row.original.pointsEarn}</span>,
    },
    {
      accessorKey: "submissionImageUrl",
      header: "Image",
      cell: ({ row }) => (
        <Button variant="link" className="h-auto p-0" onClick={() => onViewImage(row.original.submissionImageUrl)}>
          View Image
        </Button>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted At" />,
      cell: ({ row }) => <span>{format(new Date(row.original.createdAt), "dd MMM yyyy, HH:mm")}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn({
            "border-yellow-500 text-yellow-500": row.original.status === "PENDING",
            "border-green-500 text-green-500": row.original.status === "APPROVED",
            "border-red-500 text-red-500": row.original.status === "REJECTED",
          })}
        >
          {row.original.status}
        </Badge>
      ),
    },
  ];

  if (statusFilter === "FLAGGED") {
    baseColumns.push({
      accessorKey: "flagReason",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Flag Reason" />,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-xs truncate">{row.original.flagReason}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>{row.original.flagReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    });
  }

  baseColumns.push({
    id: "actions",
    cell: ({ row }) => {
      const { id, status } = row.original;
      // Hanya tampilkan aksi jika status PENDING
      if (status !== "PENDING") return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onApprove(id)}>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReject(id)} className="text-destructive">
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return baseColumns;
};
