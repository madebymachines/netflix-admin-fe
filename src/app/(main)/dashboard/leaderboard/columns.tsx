"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LeaderboardEntry, Timespan } from "./schema"; // Impor Timespan dari schema
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { PersonStanding, VenetianMask } from "lucide-react";

type ColumnsProps = {
  onViewDetails?: (id: number) => void;
  timespan: Timespan;
};

export const getColumns = ({ onViewDetails, timespan }: ColumnsProps): ColumnDef<LeaderboardEntry>[] => [
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
    accessorKey: "gender",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
    cell: ({ row }) => {
      if (!row.original.gender) return "N/A";
      return (
        <Badge variant="outline" className="capitalize">
          {row.original.gender === "MALE" ? (
            <PersonStanding className="mr-1 h-3 w-3" />
          ) : (
            <VenetianMask className="mr-1 h-3 w-3" />
          )}
          {row.original.gender.toLowerCase()}
        </Badge>
      );
    },
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
