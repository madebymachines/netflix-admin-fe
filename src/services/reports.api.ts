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

export interface MonthlyReportHistory {
  id: number;
  monthNumber: number;
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

export const getMonthlyReportHistory = async (): Promise<MonthlyReportHistory[]> => {
  const response = await api.get("/admin/reports/monthly-winners");
  return response.data.data;
};

export interface WeeklyReportSchedule {
  periodId: number;
  label: string;
  start: string;
  end: string;
}

export interface MonthlyReportSchedule {
  periodId: number;
  label: string;
  start: string;
  end: string;
}

export const getWeeklyReportSchedules = async (): Promise<WeeklyReportSchedule[]> => {
  const response = await api.get("/admin/reports/schedules");
  return response.data.data;
};

export const getMonthlyReportSchedules = async (): Promise<MonthlyReportSchedule[]> => {
  const response = await api.get("/admin/reports/monthly-schedules");
  return response.data.data;
};

export const notifySingleWinner = async (payload: {
  type: "weekly" | "monthly";
  periodId: number;
  userId: number;
}): Promise<void> => {
  const response = await api.post("/admin/reports/notify-single-winner", payload);
  return response.data;
};
