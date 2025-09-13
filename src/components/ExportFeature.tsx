"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { requestExport } from "@/services/api";
import { DateRangePicker } from "./ui/date-range-picker";

type ExportType = "PARTICIPANTS" | "LEADERBOARD" | "VERIFICATIONS" | "SUBMISSIONS";

interface ExportFeatureProps {
  exportType: ExportType;
}

// Skema validasi untuk setiap tipe ekspor
const participantsSchema = z.object({
  isBanned: z.string().default("false"),
});
const leaderboardSchema = z.object({
  timespan: z.string().default("alltime"),
});
const verificationSchema = z.object({
  status: z.string().default("ALL"),
  dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
});
const submissionSchema = z.object({
  status: z.string().default("ALL"),
  dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
});

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  filters: z.union([participantsSchema, leaderboardSchema, verificationSchema, submissionSchema]),
});

type FormData = z.infer<typeof formSchema>;

export function ExportFeature({ exportType }: ExportFeatureProps) {
  const [open, setOpen] = useState(false);

  const getTitle = () => {
    switch (exportType) {
      case "PARTICIPANTS":
        return "Participants";
      case "LEADERBOARD":
        return "Leaderboard";
      case "VERIFICATIONS":
        return "Verifications";
      case "SUBMISSIONS":
        return "Submissions";
    }
  };

  const getFilterSchema = () => {
    switch (exportType) {
      case "PARTICIPANTS":
        return participantsSchema;
      case "LEADERBOARD":
        return leaderboardSchema;
      case "VERIFICATIONS":
        return verificationSchema;
      case "SUBMISSIONS":
        return submissionSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
        filters: getFilterSchema(),
      }),
    ),
    defaultValues: {
      email: "",
      filters:
        exportType === "PARTICIPANTS"
          ? { isBanned: "false" }
          : exportType === "LEADERBOARD"
            ? { timespan: "alltime" }
            : { status: "ALL", dateRange: undefined },
    },
  });

  const onSubmit = async (data: FormData) => {
    const finalFilters = { ...data.filters, email: data.email };
    try {
      await requestExport(exportType, finalFilters);
      toast.success("Export job started!", {
        description: "You'll be notified when the file is ready for download.",
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error("Failed to start export job.", {
        description: error.response?.data?.message || "Please try again later.",
      });
    }
  };

  const renderFilters = () => {
    switch (exportType) {
      case "PARTICIPANTS":
        return (
          <FormField
            control={form.control}
            name="filters.isBanned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participant Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );
      case "LEADERBOARD":
        return (
          <FormField
            control={form.control}
            name="filters.timespan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leaderboard Timespan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timespan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="alltime">All-Time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="streak">Top Streak</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        );
      case "VERIFICATIONS":
      case "SUBMISSIONS":
        return (
          <>
            <FormField
              control={form.control}
              name="filters.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="filters.dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Range (Optional)</FormLabel>
                  <DateRangePicker date={field.value} onDateChange={field.onChange} />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export {getTitle()}</DialogTitle>
          <DialogDescription>
            Select filters for your export. The file will be generated in the background.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFilters()}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Starting..." : "Request Export"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
