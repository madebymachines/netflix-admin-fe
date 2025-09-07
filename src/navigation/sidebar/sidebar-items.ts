import { ClipboardList, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Purchase Verifications",
        url: "/dashboard/verifications",
        icon: ClipboardList,
      },
      {
        title: "User Management",
        url: "/dashboard/users",
        icon: Users,
      },
    ],
  },
];
