"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { UserGrowthChart } from "./user-growth-chart";
import { ActivityGrowthChart } from "./activity-growth-chart"; // Dikembalikan
import { UserActivityStats } from "./_components/user-activity-stats"; // Tabel Baru

// API Fetcher
const fetchStats = async (): Promise<{
  data: {
    totalUsers: number;
    newUsers: number;
    approvedVerifications: number;
    rejectedVerifications: number;
    pendingVerifications: number;
    blockedUsers: number;
  };
}> => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Helper to format large numbers into K format (e.g., 10500 -> 10.5K)
const formatK = (num: number) => {
  return num > 999 ? `${(num / 1000).toFixed(1)}K` : num;
};

// Simple stat card for smaller metrics
const SmallStatCard = ({ title, value, isLoading }: { title: string; value: number; isLoading: boolean }) => (
  <Card className="flex-1">
    <CardHeader className="p-4">
      <CardDescription>{title}</CardDescription>
      {isLoading ? <Skeleton className="h-7 w-1/2" /> : <CardTitle className="text-2xl">{formatK(value)}</CardTitle>}
    </CardHeader>
  </Card>
);

export default function OverviewPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
  });

  const stats = data?.data;

  // Calculations for Progress Reviewed card
  const reviewedCount = (stats?.approvedVerifications ?? 0) + (stats?.rejectedVerifications ?? 0);
  const totalSubmissions = reviewedCount + (stats?.pendingVerifications ?? 0);
  const progressPercentage = totalSubmissions > 0 ? Math.round((reviewedCount / totalSubmissions) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {isError && <p className="text-destructive">Failed to load dashboard statistics.</p>}

      {/* Top section with stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Participants Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardDescription>Participants</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-4xl font-bold">{formatK(stats?.totalUsers ?? 0)}</p>
            )}
          </CardContent>
        </Card>

        {/* Progress Reviewed Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardDescription>Progress Reviewed</CardDescription>
              {isLoading ? (
                <Skeleton className="h-5 w-10" />
              ) : (
                <p className="text-muted-foreground text-sm font-semibold">{progressPercentage}%</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-4xl font-bold">{formatK(reviewedCount)}</p>
            )}
            <Progress value={progressPercentage} className="h-2" />
          </CardContent>
        </Card>

        {/* Stacked small cards */}
        <div className="flex flex-col gap-4">
          <SmallStatCard title="Pending Verifications" value={stats?.pendingVerifications ?? 0} isLoading={isLoading} />
          <SmallStatCard
            title="Rejected Verifications"
            value={stats?.rejectedVerifications ?? 0}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SmallStatCard
            title="Approved Verifications"
            value={stats?.approvedVerifications ?? 0}
            isLoading={isLoading}
          />
          <SmallStatCard title="Blocked Participants" value={stats?.blockedUsers ?? 0} isLoading={isLoading} />
        </div>
      </div>

      {/* Charts Section: User Growth & Activity Growth Side-by-Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UserGrowthChart />
        <ActivityGrowthChart />
      </div>

      {/* New User Activity Stats Table (Full Width) */}
      <div className="w-full">
        <UserActivityStats />
      </div>
    </div>
  );
}
