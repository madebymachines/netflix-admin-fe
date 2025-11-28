"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { LeaderboardEntry } from "@/app/(main)/dashboard/leaderboard/schema";

export const activityColumns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: "rank",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => <div className="text-center font-medium">{row.original.rank}</div>,
    enableSorting: false,
    size: 50,
  },
  {
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 text-left">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.profilePictureUrl || undefined} alt={row.original.username} />
          <AvatarFallback>{getInitials(row.original.username)}</AvatarFallback>
        </Avatar>
        <div>
          <span className="block font-medium">{row.original.username}</span>
          <span className="text-muted-foreground text-xs">{row.original.country || "N/A"}</span>
        </div>
      </div>
    ),
  },
  {
    id: "challengeCount",
    accessorKey: "challengeCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Challenges" />,
    cell: ({ row }) => {
      const count = row.original.challengeCount;
      return <div className="font-semibold tabular-nums">{count?.toLocaleString() ?? 0}</div>;
    },
  },
  {
    id: "score",
    accessorKey: "points",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Points" />,
    cell: ({ row }) => {
      const score = row.original.points;
      return <div className="font-bold text-green-600 tabular-nums">{score?.toLocaleString() ?? 0}</div>;
    },
  },
];
