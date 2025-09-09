"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { sidebarItems, NavGroup } from "@/navigation/sidebar/sidebar-items";
import { NavMain } from "./nav-main";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";

// API Fetcher
const fetchStats = async (): Promise<{
  data: {
    pendingVerifications: number;
    approvedVerifications: number;
    rejectedVerifications: number;
  };
}> => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Helper to format large numbers into K format (e.g., 5500 -> 5.5K)
const formatK = (num: number) => {
  return num > 999 ? `${(num / 1000).toFixed(1)}K` : num.toString();
};

export function NavMainWithCounts() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["sidebarStats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <SidebarMenuSkeleton showIcon />
        <SidebarMenuSkeleton showIcon />
        <SidebarMenuSkeleton showIcon />
        <SidebarMenuSkeleton showIcon />
      </div>
    );
  }

  const itemsWithCounts: NavGroup[] = sidebarItems.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.key && statsData?.data) {
        const count = statsData.data[item.key];
        return {
          ...item,
          title: `${item.title} (${formatK(count)})`,
        };
      }
      return item;
    }),
  }));

  return <NavMain items={itemsWithCounts} />;
}
