import {
  LayoutGrid,
  Users,
  UserX,
  FileClock,
  FileCheck,
  FileX,
  Trophy,
  type LucideIcon,
  BookCheck,
  BookX,
  BookLock,
} from "lucide-react";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  key?:
    | "pendingVerifications"
    | "approvedVerifications"
    | "rejectedVerifications"
    | "pendingSubmissions"
    | "approvedSubmissions"
    | "rejectedSubmissions";
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
        url: "/dashboard/overview",
        icon: LayoutGrid,
      },
    ],
  },
  {
    id: 2,
    label: "PARTICIPANTS",
    items: [
      {
        title: "Active Participants",
        url: "/dashboard/users?filter=active",
        icon: Users,
      },
      {
        title: "Blocked Participants",
        url: "/dashboard/users?filter=blocked",
        icon: UserX,
      },
    ],
  },
  {
    id: 3,
    label: "VERIFICATIONS",
    items: [
      {
        title: "Pending",
        url: "/dashboard/verifications?status=PENDING",
        icon: FileClock,
        key: "pendingVerifications",
      },
      {
        title: "Approved",
        url: "/dashboard/verifications?status=APPROVED",
        icon: FileCheck,
        key: "approvedVerifications",
      },
      {
        title: "Rejected",
        url: "/dashboard/verifications?status=REJECTED",
        icon: FileX,
        key: "rejectedVerifications",
      },
    ],
  },
  {
    id: 4,
    label: "SUBMISSIONS",
    items: [
      {
        title: "Pending",
        url: "/dashboard/submissions?status=PENDING",
        icon: BookLock,
        key: "pendingSubmissions",
      },
      {
        title: "Approved",
        url: "/dashboard/submissions?status=APPROVED",
        icon: BookCheck,
        key: "approvedSubmissions",
      },
      {
        title: "Rejected",
        url: "/dashboard/submissions?status=REJECTED",
        icon: BookX,
        key: "rejectedSubmissions",
      },
    ],
  },
  {
    id: 5,
    label: "POINTS",
    items: [
      {
        title: "Leaderboard",
        url: "/dashboard/leaderboard",
        icon: Trophy,
      },
    ],
  },
];
