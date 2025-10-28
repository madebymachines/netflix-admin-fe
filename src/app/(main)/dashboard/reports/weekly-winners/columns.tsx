"use client";

import { ColumnDef } from "@tanstack/react-table";
// format tidak lagi digunakan secara langsung untuk periode, bisa dihapus jika tidak dipakai di tempat lain
import { format } from "date-fns";
import { Download, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WeeklyReport } from "./schema";

// --- PERUBAHAN DIMULAI DI SINI ---
// Buat fungsi helper untuk memformat tanggal ke zona waktu Malaysia (UTC+8)
const formatToMalaysiaTime = (dateString: string, includeYear: boolean = false) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  if (includeYear) {
    options.year = "numeric";
  }
  return date.toLocaleString("en-GB", options).replace(",", "");
};
// --- PERUBAHAN SELESAI DI SINI ---

export const columns: ColumnDef<WeeklyReport>[] = [
  {
    accessorKey: "weekNumber",
    header: "Week",
    cell: ({ row }) => <div className="font-medium">Week {row.original.weekNumber}</div>,
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => (
      // --- PERUBAHAN DIMULAI DI SINI ---
      // Gunakan fungsi helper baru untuk menampilkan waktu
      <div>
        {formatToMalaysiaTime(row.original.periodStart)} - {formatToMalaysiaTime(row.original.periodEnd, true)}
      </div>
      // --- PERUBAHAN SELESAI DI SINI ---
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="outline"
          className={cn({
            "border-yellow-500 text-yellow-500": status === "PENDING",
            "border-green-500 text-green-500": status === "SENT",
            "border-red-500 text-red-500": status === "FAILED",
          })}
        >
          {status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
          {status === "SENT" && <CheckCircle className="mr-1 h-3 w-3" />}
          {status === "FAILED" && <AlertCircle className="mr-1 h-3 w-3" />}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    cell: ({ row }) => (row.original.sentAt ? format(new Date(row.original.sentAt), "dd MMM yyyy, HH:mm") : "N/A"),
  },
  {
    accessorKey: "recipientList",
    header: "Recipients",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="max-w-xs truncate">{row.original.recipientList || "N/A"}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-md">{row.original.recipientList || "N/A"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const { downloadUrl } = row.original;
      if (!downloadUrl) {
        return null;
      }
      return (
        <Button asChild variant="outline" size="sm">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      );
    },
  },
];
