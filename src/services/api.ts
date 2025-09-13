import api from "@/lib/axios";

interface ExportFilters {
  [key: string]: any;
}

export const requestExport = (
  type: "PARTICIPANTS" | "LEADERBOARD" | "VERIFICATIONS" | "SUBMISSIONS",
  filters: ExportFilters,
) => {
  return api.post("/admin/export", { type, filters });
};
