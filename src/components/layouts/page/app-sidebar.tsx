import * as React from "react"
import { useTranslation } from "react-i18next"
import { useRouteContext } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"

import { NavMain } from "@/components/layouts/page/nav-main"
import { NavUser } from "@/components/layouts/page/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CommandIcon } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const { user } = useRouteContext({ from: "/app" })

  const navMain = [
    {
      title: t("sidebar.dashboard"),
      url: "/app/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: t("sidebar.lifecycle"),
      url: "/app/lifecycle",
      icon: <ListIcon />,
    },
    {
      title: t("sidebar.analytics"),
      url: "/app/analytics",
      icon: <ChartBarIcon />,
    },
    {
      title: t("sidebar.projects"),
      url: "/app/projects",
      icon: <FolderIcon />,
    },
    {
      title: t("sidebar.team"),
      url: "/app/team",
      icon: <UsersIcon />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/app/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">ZISKovač</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: user.image ?? "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
