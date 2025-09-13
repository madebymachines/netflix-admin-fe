"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Download } from "lucide-react";

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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requestExport } from "@/services/api";

interface ExportFeatureProps {
  exportType: "PARTICIPANTS" | "LEADERBOARD";
}

const participantsSchema = z.object({
  isBanned: z.string().default("false"),
});

const leaderboardSchema = z.object({
  timespan: z.string().default("alltime"),
});

export function ExportFeature({ exportType }: ExportFeatureProps) {
  const [open, setOpen] = useState(false);
  const isParticipant = exportType === "PARTICIPANTS";
  const schema = isParticipant ? participantsSchema : leaderboardSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isParticipant ? { isBanned: "false" } : { timespan: "alltime" },
  });

  const onSubmit = async (data: any) => {
    try {
      await requestExport(exportType, data);
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
          <DialogTitle>Export {isParticipant ? "Participants" : "Leaderboard"}</DialogTitle>
          <DialogDescription>
            Select the filters for your data export. The file will be generated in the background.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isParticipant ? (
              <FormField
                control={form.control}
                name="isBanned"
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
            ) : (
              <FormField
                control={form.control}
                name="timespan"
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
            )}
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
