import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavGroup } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const searchParams = useSearchParams();

  const isItemActive = (url: string) => {
    // Rekonstruksi path lengkap saat ini, termasuk query parameters
    const currentFullPath = `${path}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    // Lakukan perbandingan URL lengkap secara persis
    return currentFullPath === url;
  };

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.id} className="p-0 px-2">
          {group.label && (
            <div className="text-muted-foreground px-2 pt-4 pb-2 text-xs font-semibold uppercase">{group.label}</div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.url)} tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
