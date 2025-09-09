"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LeaderboardEntry } from "./schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

type Timespan = "alltime" | "weekly" | "streak";

export const getColumns = (timespan: Timespan): ColumnDef<LeaderboardEntry>[] => [
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
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.profilePictureUrl || undefined} alt={row.original.username} />
          <AvatarFallback>{getInitials(row.original.username)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.username}</span>
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => row.original.country || "N/A",
  },
  {
    id: "score",
    accessorKey: timespan === "streak" ? "streak" : "points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={timespan === "streak" ? "Top Streak" : "Points"} />
    ),
    cell: ({ row }) => {
      const score = timespan === "streak" ? row.original.streak : row.original.points;
      return <div className="font-semibold tabular-nums">{score?.toLocaleString() ?? 0}</div>;
    },
  },
];
