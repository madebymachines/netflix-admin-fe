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
import { countries } from "@/data/countries";

type ExportType = "PARTICIPANTS" | "LEADERBOARD" | "VERIFICATIONS" | "SUBMISSIONS";

interface ExportFeatureProps {
  exportType: ExportType;
}

const baseFilters = {
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
};

const participantsFilters = z.object({
  isBanned: z.string().optional(),
  country: z.string().optional(),
  purchaseStatus: z.string().optional(),
  dateRange: z.custom<DateRange>().optional(),
});

const leaderboardFilters = z.object({
  timespan: z.string().optional(),
  country: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const verificationFilters = z.object({
  status: z.string().optional(),
  verificationType: z.string().optional(),
  dateRange: z.custom<DateRange>().optional(),
});

const submissionFilters = z.object({
  status: z.string().optional(),
  eventType: z.string().optional(),
  country: z.string().optional(),
  dateRange: z.custom<DateRange>().optional(),
});

export function ExportFeature({ exportType }: ExportFeatureProps) {
  const [open, setOpen] = useState(false);

  const getTitle = () =>
    ({
      PARTICIPANTS: "Participants",
      LEADERBOARD: "Leaderboard",
      VERIFICATIONS: "Verifications",
      SUBMISSIONS: "Submissions",
    })[exportType];

  const getFilterSchema = () => {
    switch (exportType) {
      case "PARTICIPANTS":
        return participantsFilters;
      case "LEADERBOARD":
        return leaderboardFilters;
      case "VERIFICATIONS":
        return verificationFilters;
      case "SUBMISSIONS":
        return submissionFilters;
      default:
        return z.object({});
    }
  };

  const form = useForm({
    resolver: zodResolver(z.object({ ...baseFilters, ...getFilterSchema().shape })),
    defaultValues: {
      email: "",
      isBanned: "false",
      purchaseStatus: "ALL",
      country: "ALL",
      dateRange: undefined,
      timespan: "alltime",
      limit: 100,
      status: "ALL",
      verificationType: "ALL",
      eventType: "ALL",
    },
  });

  const onSubmit = async (data: any) => {
    // Bersihkan filter yang tidak relevan atau 'ALL'
    const cleanFilters = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value !== "ALL") {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    try {
      await requestExport(exportType, cleanFilters);
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
          <>
            <FormField
              control={form.control}
              name="isBanned"
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
                      <SelectItem value="false">Active</SelectItem>
                      <SelectItem value="true">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="NOT_VERIFIED">Not Verified</SelectItem>
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Date</FormLabel>
                  <DateRangePicker date={field.value} onDateChange={field.onChange} />
                </FormItem>
              )}
            />
          </>
        );
      case "LEADERBOARD":
        return (
          <>
            <FormField
              control={form.control}
              name="timespan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timespan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timespan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alltime">All-Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="streak">Top Streak</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top N Participants</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        );
      case "VERIFICATIONS":
        return (
          <>
            <FormField
              control={form.control}
              name="status"
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
              name="verificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="MEMBER_GYM">Member Gym</SelectItem>
                      <SelectItem value="RECEIPT">Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Date</FormLabel>
                  <DateRangePicker date={field.value} onDateChange={field.onChange} />
                </FormItem>
              )}
            />
          </>
        );
      case "SUBMISSIONS":
        return (
          <>
            <FormField
              control={form.control}
              name="status"
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
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="GROUP">Group</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Submission Date</FormLabel>
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
