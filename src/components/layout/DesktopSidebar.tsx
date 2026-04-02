import { useTranslation } from "react-i18next";
import { Home, Calendar, CheckSquare, Gift, ShoppingCart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

export default function DesktopSidebar() {
  const { t } = useTranslation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();

  const items = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: Calendar, label: t("nav.calendar"), path: "/calendar" },
    { icon: CheckSquare, label: t("nav.tasks"), path: "/tasks" },
    { icon: Gift, label: t("nav.rewards"), path: "/rewards" },
    { icon: ShoppingCart, label: t("nav.shopping"), path: "/shopping" },
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>{t("nav.settings")}</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="hover:bg-muted/50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>{t("auth.logout")}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
