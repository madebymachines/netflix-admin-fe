"use client";

import { ReactNode, useEffect } from "react";

import { usePathname } from "next/navigation";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth/authStore";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { type SidebarVariant } from "@/types/preferences/layout";
import { useSocket } from "@/hooks/useSocket";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";
import { SearchDialog } from "./_components/sidebar/search-dialog";

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const admin = useAuthStore((state) => state.admin);
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  useSocket(); // Initialize socket connection

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  const sidebarVariant: SidebarVariant = "inset";
  const sidebarCollapsible = "icon";
  const contentLayout = "centered";

  if (!admin) {
    return null;
  }

  return (
    <>
      <AppSidebar variant={sidebarVariant} collapsible={sidebarCollapsible} />
      <SidebarInset
        data-content-layout={contentLayout}
        className={cn(
          "data-[content-layout=centered]:!mx-auto data-[content-layout=centered]:max-w-screen-2xl",
          "max-[113rem]:peer-data-[variant=inset]:!mr-2 min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:!mr-auto",
        )}
      >
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        <div className="h-[calc(100vh-3rem)] overflow-y-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
    </>
  );
}

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
