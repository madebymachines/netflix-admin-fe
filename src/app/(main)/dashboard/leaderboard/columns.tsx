"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LeaderboardEntry } from "./schema";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

type ColumnsProps = {
  onViewDetails?: (id: number) => void;
};

export const getColumns = ({ onViewDetails }: ColumnsProps): ColumnDef<LeaderboardEntry>[] => [
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
];
