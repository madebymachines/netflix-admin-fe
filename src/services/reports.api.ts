import api from "@/lib/axios";
import { ReportStatus } from "@/app/(main)/dashboard/reports/weekly-winners/schema";

export interface WeeklyReportHistory {
  id: number;
  weekNumber: number;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  sentAt: string | null;
  s3FileKey: string | null;
  recipientList: string | null;
  downloadUrl: string | null;
}

export const getWeeklyReportHistory = async (): Promise<WeeklyReportHistory[]> => {
  const response = await api.get("/admin/reports/weekly-winners");
  return response.data.data;
};

// --- KODE YANG HILANG ADA DI SINI ---

export interface ReportSchedule {
  week: number;
  label: string;
  start: string;
  end: string;
}

export const getWeeklyReportSchedules = async (): Promise<ReportSchedule[]> => {
  const response = await api.get("/admin/reports/schedules");
  return response.data.data;
};
