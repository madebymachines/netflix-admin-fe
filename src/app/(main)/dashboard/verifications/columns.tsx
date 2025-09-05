"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, MoreHorizontal, X } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Verification } from "./schema";

type ColumnsProps = {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewImage: (url: string) => void; // <-- Prop baru untuk membuka dialog
};

export const getColumns = ({ onApprove, onReject, onViewImage }: ColumnsProps): ColumnDef<Verification>[] => [
  {
    accessorKey: "user.name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User Name" />,
  },
  {
    accessorKey: "user.email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted At" />,
    cell: ({ row }) => <span>{format(new Date(row.original.submittedAt), "dd MMM yyyy, HH:mm")}</span>,
  },
  {
    accessorKey: "receiptImageUrl",
    header: "Receipt",
    cell: ({ row }) => (
      <Button variant="link" className="h-auto p-0" onClick={() => onViewImage(row.original.receiptImageUrl)}>
        View Image
      </Button>
    ),
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
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, status } = row.original;
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
  },
];
