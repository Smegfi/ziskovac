import * as React from "react"
import { useTranslation } from "react-i18next"

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

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const navMain = [
    {
      title: t("sidebar.dashboard"),
      url: "#",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: t("sidebar.lifecycle"),
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: t("sidebar.analytics"),
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: t("sidebar.projects"),
      url: "#",
      icon: <FolderIcon />,
    },
    {
      title: t("sidebar.team"),
      url: "#",
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
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Quotes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
