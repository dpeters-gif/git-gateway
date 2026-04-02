import { useTranslation } from "react-i18next";
import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { UserAvatar } from "@/components/settings/AvatarPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationMenu from "@/components/layout/NotificationMenu";

export default function AppBar() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const { family } = useFamily();
  const navigate = useNavigate();
  const isChild = profile?.role === "child";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-app-bar bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="font-bold text-md text-foreground truncate max-w-[180px]">
          {family?.name ?? "Familienzentrale"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isChild && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-xp-light">
            <span className="text-xs font-bold text-xp">🪙</span>
          </div>
        )}
        <NotificationMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <UserAvatar avatarUrl={profile?.avatar_url} name={profile?.name ?? "?"} className="h-8 w-8" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer gap-2">
              <Settings className="w-4 h-4" />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
