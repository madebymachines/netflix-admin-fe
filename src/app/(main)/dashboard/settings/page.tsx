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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { getRegistrationSettings, updateRegistrationSettings, RegistrationSettings } from "@/services/settings.api";
import { WinnerRecipientsForm } from "./WinnerRecipientsForm"; // Impor komponen baru

const settingsSchema = z.object({
  isRegistrationOpen: z.boolean(),
  registrationLimit: z.coerce
    .number({ invalid_type_error: "Limit must be a number." })
    .int()
    .min(0, "Limit must be 0 or greater."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
  } = useQuery<RegistrationSettings>({
    queryKey: ["registrationSettings"],
    queryFn: getRegistrationSettings,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      isRegistrationOpen: true,
      registrationLimit: 0,
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: updateRegistrationSettings,
    onSuccess: () => {
      toast.success("Settings updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["registrationSettings"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update settings.", {
        description: error.response?.data?.message || "An unknown error occurred.",
      });
    },
  });

  const onSubmit = (data: SettingsFormValues) => {
    mutation.mutate(data);
  };

  if (isError) {
    return <p className="text-destructive">Failed to load settings. Please try again later.</p>;
  }

  return (
    <div className="grid gap-6">
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>
                  Manage user registration status and set a limit for the total number of users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isRegistrationOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Registration</FormLabel>
                        <FormDescription>Allow new users to register for an account.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Registration Limit</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set the maximum number of users that can register. Set to 0 for no limit.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      {/* Tambahkan Form untuk Penerima Email di sini */}
      <WinnerRecipientsForm />
    </div>
  );
}
