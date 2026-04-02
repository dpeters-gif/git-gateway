import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, CheckSquare, Gift, ShoppingCart, Sparkles, Trophy, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

export default function BottomNav() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isChild = profile?.role === "child";

  const parentItems: NavItem[] = [
    { icon: Home, label: t("nav.home"), path: "/" },
    { icon: Calendar, label: t("nav.calendar"), path: "/calendar" },
    { icon: CheckSquare, label: t("nav.tasks"), path: "/tasks" },
    { icon: Gift, label: t("nav.rewards"), path: "/rewards" },
    { icon: ShoppingCart, label: t("nav.shopping"), path: "/shopping" },
  ];

  const childItems: NavItem[] = [
    { icon: Sparkles, label: t("nav.myDay"), path: "/" },
    { icon: Calendar, label: t("nav.calendar"), path: "/child-calendar" },
    { icon: Star, label: t("nav.quests"), path: "/quests" },
    { icon: Gift, label: t("nav.rewards"), path: "/rewards" },
  ];

  const items = isChild ? childItems : parentItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-bottom-nav bg-card border-t border-border flex items-center justify-around px-2 xl:hidden">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
