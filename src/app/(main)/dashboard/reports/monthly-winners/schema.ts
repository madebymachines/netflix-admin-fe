import { z } from "zod";

export const reportStatusSchema = z.enum(["PENDING", "SENT", "FAILED"]);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const monthlyReportSchema = z.object({
  id: z.number(),
  monthNumber: z.number(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  status: reportStatusSchema,
  sentAt: z.string().datetime().nullable(),
  recipientList: z.string().nullable(),
  downloadUrl: z.string().url().nullable(),
});

export type MonthlyReport = z.infer<typeof monthlyReportSchema>;
