"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getWinnerRecipients, updateWinnerRecipients } from "@/services/settings.api";

const recipientsSchema = z.object({
  emails: z.string().refine(
    (value) => {
      if (!value) return true; // Kosong dianggap valid
      const emails = value.split(",").map((e) => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every((email) => emailRegex.test(email));
    },
    {
      message: "Please enter a valid, comma-separated list of email addresses.",
    },
  ),
});

type RecipientsFormValues = z.infer<typeof recipientsSchema>;

export function WinnerRecipientsForm() {
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery<string[]>({
    queryKey: ["winnerRecipients"],
    queryFn: getWinnerRecipients,
  });

  const form = useForm<RecipientsFormValues>({
    resolver: zodResolver(recipientsSchema),
    defaultValues: {
      emails: "",
    },
  });

  React.useEffect(() => {
    if (emails) {
      form.reset({ emails: emails.join(", ") });
    }
  }, [emails, form]);

  const mutation = useMutation({
    mutationFn: (data: string[]) => updateWinnerRecipients(data),
    onSuccess: () => {
      toast.success("Recipient list updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["winnerRecipients"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update recipients.", {
        description: error.response?.data?.message || "An unknown error occurred.",
      });
    },
  });

  const onSubmit = (data: RecipientsFormValues) => {
    const emailArray = data.emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    mutation.mutate(emailArray);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Report Recipients</CardTitle>
            <CardDescription>
              Manage the list of email addresses that will receive the weekly winner report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Emails</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="admin1@example.com, manager@example.com"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter email addresses separated by commas.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Recipients"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
