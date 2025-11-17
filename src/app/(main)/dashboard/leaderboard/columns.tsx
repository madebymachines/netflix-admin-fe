"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LeaderboardEntry } from "./schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, MoreHorizontal, Send } from "lucide-react";

type ColumnsProps = {
  onViewDetails?: (id: number) => void;
  onNotifyWinner?: (user: LeaderboardEntry) => void;
};

export const getColumns = ({ onViewDetails, onNotifyWinner }: ColumnsProps): ColumnDef<LeaderboardEntry>[] => [
  {
    accessorKey: "rank",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="font-medium">{row.original.rank}</div>,
    enableSorting: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => (
      <button
        onClick={() => onViewDetails?.(row.original.userId)}
        className="flex items-center gap-3 text-left hover:underline"
        disabled={!onViewDetails}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.profilePictureUrl || undefined} alt={row.original.username} />
          <AvatarFallback>{getInitials(row.original.username)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.username}</span>
      </button>
    ),
  },
  {
    accessorKey: "country",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => row.original.country || "N/A",
  },
  {
    id: "score",
    accessorKey: "points",
    header: ({ column }) => <DataTableColumnHeader column={column} title={"Points"} />,
    cell: ({ row }) => {
      const score = row.original.points;
      return <div className="font-semibold tabular-nums">{score?.toLocaleString() ?? 0}</div>;
    },
  },
  {
    accessorKey: "isNotified",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Notification Status" />,
    cell: ({ row }) => {
      const isNotified = row.original.isNotified;
      if (isNotified) {
        return (
          <Badge variant="secondary" className="border-green-200 text-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Notified
          </Badge>
        );
      }
      return <span className="text-muted-foreground text-xs">Not Sent</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onNotifyWinner?.(user)} disabled={user.isNotified}>
              <Send className="mr-2 h-4 w-4" />
              Notify Winner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
