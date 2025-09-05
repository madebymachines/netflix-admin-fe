import { ClipboardList, LayoutDashboard, type LucideIcon } from "lucide-react";

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
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Purchase Verifications",
        url: "/dashboard/verifications",
        icon: ClipboardList,
      },
    ],
  },
];
