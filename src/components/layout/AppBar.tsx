import { useTranslation } from "react-i18next";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationMenu from "@/components/layout/NotificationMenu";

export default function AppBar() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  const { family } = useFamily();
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
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
