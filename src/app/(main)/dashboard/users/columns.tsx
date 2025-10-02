"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Ban, CheckCircle, Eye } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { User } from "./schema";

type ColumnsProps = {
  onBan: (id: number) => void;
  onUnban: (id: number) => void;
  onViewDetails: (id: number) => void;
};

export const getColumns = ({ onBan, onUnban, onViewDetails }: ColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    cell: ({ row }) => (
      <button onClick={() => onViewDetails(row.original.id)} className="hover:underline">
        {row.original.username}
      </button>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "country",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => row.original.country || "N/A",
  },
  {
    accessorKey: "purchaseStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Verification" />,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn({
          "border-yellow-500 text-yellow-500": row.original.purchaseStatus === "PENDING",
          "border-green-500 text-green-500": row.original.purchaseStatus === "APPROVED",
          "border-red-500 text-red-500": row.original.purchaseStatus === "REJECTED",
        })}
      >
        {row.original.purchaseStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Registered At" />,
    cell: ({ row }) => <span>{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, isBanned } = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isBanned ? (
                <DropdownMenuItem onClick={() => onUnban(id)}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onBan(id)} className="text-destructive">
                  <Ban className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
