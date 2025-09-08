"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { UserGrowthChart } from "./user-growth-chart";

// API Fetcher
const fetchStats = async (): Promise<{
  data: {
    totalUsers: number;
    newUsers: number;
    approvedVerifications: number;
    rejectedVerifications: number;
    pendingVerifications: number;
  };
}> => {
  const response = await api.get("/admin/stats");
  return response.data;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="text-muted-foreground h-4 w-4" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2" />
      ) : (
        <div className="text-2xl font-bold">{value?.toLocaleString() ?? 0}</div>
      )}
    </CardContent>
  </Card>
);

export default function OverviewPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
  });

  const stats = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      {isError && <p className="text-destructive">Failed to load dashboard statistics.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Users" value={stats?.totalUsers} icon={Users} isLoading={isLoading} />
        <StatCard title="New Users (7d)" value={stats?.newUsers} icon={UserPlus} isLoading={isLoading} />
        <StatCard
          title="Pending Verifications"
          value={stats?.pendingVerifications}
          icon={Clock}
          isLoading={isLoading}
        />
        <StatCard
          title="Approved Verifications"
          value={stats?.approvedVerifications}
          icon={CheckCircle}
          isLoading={isLoading}
        />
        <StatCard
          title="Rejected Verifications"
          value={stats?.rejectedVerifications}
          icon={XCircle}
          isLoading={isLoading}
        />
      </div>
      <div>
        <UserGrowthChart />
      </div>
    </div>
  );
}
