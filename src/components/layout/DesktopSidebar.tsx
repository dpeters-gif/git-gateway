import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, CheckSquare, Gift, Settings, ShoppingCart, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

export default function DesktopSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile } = useAuth();

  const items = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: Calendar, label: t("nav.calendar"), path: "/calendar" },
    { icon: CheckSquare, label: t("nav.tasks"), path: "/tasks" },
    { icon: Gift, label: t("nav.rewards"), path: "/rewards" },
    { icon: ShoppingCart, label: t("shopping.title"), path: "/shopping" },
    { icon: BarChart3, label: t("careShare.title"), path: "/care-share" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <Sidebar collapsible="icon" className="hidden xl:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{profile?.name ?? "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
