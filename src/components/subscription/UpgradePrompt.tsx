import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { popIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: string;
  requiredTier?: "family" | "familyplus";
}

export default function UpgradePrompt({ feature, requiredTier = "family" }: UpgradePromptProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const messages: Record<string, { de: string; en: string }> = {
    creatures: { de: "Schalte magische Begleiter frei!", en: "Unlock magical companions!" },
    gold: { de: "Mit Family bekommst du Gold & Belohnungen!", en: "Get Gold & rewards with Family!" },
    shoppingLists: { de: "Mehrere Listen mit Family", en: "Multiple lists with Family" },
    calendarSync: { de: "Google Calendar Sync mit Family", en: "Google Calendar sync with Family" },
    boardNotes: { de: "Unbegrenzte Notizen mit Family", en: "Unlimited notes with Family" },
    aiSuggestions: { de: "KI-Vorschläge mit Family+", en: "AI suggestions with Family+" },
    nudges: { de: "Smart Nudges mit Family+", en: "Smart nudges with Family+" },
    recap: { de: "Wöchentlicher Rückblick mit Family+", en: "Weekly recap with Family+" },
    careShare: { de: "Care-Share Analytics mit Family+", en: "Care-Share analytics with Family+" },
    multiHousehold: { de: "Mehrere Haushalte mit Family+", en: "Multi-household with Family+" },
    emailCalendar: { de: "E-Mail-zu-Kalender mit Family+", en: "Email-to-calendar with Family+" },
  };

  const msg = messages[feature];
  const tierLabel = requiredTier === "familyplus" ? "Family+" : "Family";

  return (
    <motion.div variants={popIn} initial="hidden" animate="visible" className="bg-accent/10 rounded-lg p-4 border border-accent/20 text-center space-y-3">
      <Sparkles className="w-8 h-8 text-accent mx-auto" />
      <p className="text-sm font-semibold text-foreground">
        {msg?.de ?? t("upgrade.unlockFeature", { tier: tierLabel })}
      </p>
      <Button
        size="sm"
        variant="default"
        onClick={() => navigate("/settings?tab=subscription")}
        className="gap-1"
      >
        <Sparkles className="w-3 h-3" />
        {t("upgrade.upgradeNow", `Upgrade auf ${tierLabel}`)}
      </Button>
    </motion.div>
  );
}
